---
name: vizeon-sec-authz-tenancy
description: Autorizace, role a izolace firem (multi-tenant) – Data Access Layer s requireMembership/authorize, ochrana proti IDOR/BOLA, mass assignment, eskalaci rolí, field-level oprávnění, pozvánky do firmy, přepínání firem, impersonace/podpora, odebírání oprávnění, admin operace. Použij VŽDY, když kód čte nebo mění data patřící uživateli nebo firmě, při návrhu rolí, při tvorbě admin sekce, pozvánek, sdílení a při každé otázce „kdo to smí“. Pokrývá sekci C (P0) a část D/E.
---

# Autorizace a izolace tenantů (sekce C – P0)

Nejčastější reálná zranitelnost v CRM/fakturačních aplikacích je **přístup k cizím datům změnou ID** (IDOR/BOLA) a **chybějící kontrola v jedné z mnoha cest k datům**. Proto platí **dvojitá kontrola**:

1. **Aplikační vrstva (DAL)** – každá operace volá `authorize()` podle `access-matrix.md`.
2. **Databázová vrstva (RLS)** – i kdyby DAL selhala, DB nevydá cizí řádek (`vizeon-sec-supabase`).

Ani jedna vrstva sama nestačí. UI (skrytá tlačítka) **není** vrstva (#28).

## Datový model (výchozí pro naše aplikace)

```sql
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type public.org_role as enum ('viewer','user','manager','owner');

create table public.memberships (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'user',
  status text not null default 'active' check (status in ('active','disabled')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- každá tenantová tabulka:
--   org_id uuid not null references organizations(id), index na (org_id, ...),
--   RLS přes app.is_member(org_id) / app.has_role(org_id, 'manager'),
--   trigger neměnnosti org_id (viz vizeon-sec-supabase/references/rls-patterns.sql)
```

**Role nikdy z `user_metadata` / `raw_user_meta_data`** (N-01) – uživatel si je změní sám přes `supabase.auth.updateUser({ data: { role: 'admin' } })`. Pokud potřebuješ claim v JWT, použij Custom Access Token Hook, který čte z `memberships`, nebo `app_metadata` nastavované jen serverem.

## Data Access Layer (DAL) – jediná cesta k datům

```ts
// src/server/authz.ts
import 'server-only'
import { requireUser } from './auth'

type Role = 'viewer' | 'user' | 'manager' | 'owner'
const rank: Record<Role, number> = { viewer: 0, user: 1, manager: 2, owner: 3 }

// Oprávnění = kopie access-matrix.md. Změna matice = změna tohoto souboru + testu.
const permissions = {
  'contact.read':      'viewer',
  'contact.write':     'user',
  'invoice.read':      'viewer',
  'invoice.create':    'user',
  'invoice.void':      'manager',
  'member.invite':     'manager',
  'member.changeRole': 'owner',
  'org.exportAll':     'owner',
} as const satisfies Record<string, Role>
export type Permission = keyof typeof permissions

export async function requireMembership(orgId: string) {
  const { supabase, user } = await requireUser()
  // orgId z URL/requestu je jen NÁVRH – ověřujeme ho proti DB:
  const { data: m } = await supabase
    .from('memberships')
    .select('role, status')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!m || m.status !== 'active') throw new ForbiddenError()   // 404 navenek – neprozrazuj existenci
  return { supabase, user, orgId, role: m.role as Role }
}

export async function authorize(orgId: string, perm: Permission) {
  const ctx = await requireMembership(orgId)
  if (rank[ctx.role] < rank[permissions[perm]]) throw new ForbiddenError()
  return ctx
}
```

Použití v každé Server Action / Route Handleru:
```ts
'use server'
export async function voidInvoice(input: unknown) {
  const { orgId, invoiceId, reason } = VoidInvoiceSchema.parse(input)      // .strict()
  const { supabase, user } = await authorize(orgId, 'invoice.void')
  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'void', void_reason: reason })   // explicitní pole, NE ...input
    .eq('id', invoiceId)
    .eq('org_id', orgId)                                // vždy scope na tenanta
    .select('id')
    .single()
  if (error || !data) throw new NotFoundError()         // 0 řádků = neexistuje NEBO cizí
  await audit('invoice.void', { orgId, invoiceId, userId: user.id })
}
```

## Pravidla

### IDOR/BOLA (#25, #26, N-31)
- Každý dotaz podle ID má i podmínku `org_id` (DAL) a RLS (DB).
- UUID v URL je v pořádku, ale **neuhodnutelné ID není autorizace**. Sekvenční čísla faktur zobrazuj, ale nepoužívej jako jediný klíč v API.
- Odpověď pro „neexistuje“ a „nemáš právo“ je stejná (404), aby nešla zjistit existence cizích záznamů.
- Kontroluj **všechny cesty**: detail, seznam, vyhledávání, filtr, export, tisk/PDF, Storage, Realtime, RPC, webhook, e-mailový odkaz, AI tool, cron.

### Mass assignment a citlivá pole (#31, #83)
- Nikdy `.insert(input)` / `.update(input)` s celým objektem z klienta. Validuj Zod schématem `.strict()` a předávej jen vyjmenovaná pole.
- Pole `org_id`, `created_by`, `role`, `status` (platba), `price`, `is_admin` nastavuje **server** (nebo DB default/trigger), nikdy klient.
- V DB: column-level GRANT (`grant update (name, email, phone) on contacts to authenticated;` místo `grant update on contacts`) pro tabulky s citlivými poli.

### Role a eskalace (#29, #30, #34)
- Změna role jen přes RPC/Server Action s kontrolou: volající je `owner`, nesahá na sebe, neuděluje vyšší roli než má, nezůstane firma bez ownera.
- Přímý `UPDATE memberships` z klienta zakázán (žádná UPDATE politika pro `authenticated`, změna jen přes SECURITY DEFINER funkci s vlastní kontrolou).
- Admin operace: re-autentizace (`requireAal2()` + čerstvost), audit, případně 4-eyes (#268).

### Odebrání oprávnění (#19, #33)
- Účinek musí být okamžitý: RLS kontroluje `memberships.status = 'active'` při každém dotazu. Nespoléhej na role v JWT claimu, který platí do expirace.
- Signed URL vydané před odebráním platí do expirace → krátké expirace (60–300 s) (`vizeon-sec-files`).
- Osobní API tokeny, integrace a sdílené odkazy daného uživatele zneplatni.

### Pozvánky do firmy (N-12)
- Token: 32 B z CSPRNG, v DB jen **hash** (SHA-256), expirace 72 h, jednorázový.
- Pozvánka je vázaná na e-mail: přijmout ji smí jen přihlášený uživatel s **ověřeným** e-mailem shodným s pozvánkou.
- Role v pozvánce ≤ role zvoucího. Pozvánku lze odvolat. Audit vytvoření i přijetí.

### Aktivní firma / přepínání tenantů
- Aktivní firma v cookie (`__Host-org`) nebo v URL je jen preference – při každém požadavku ověř membership.
- Nikdy necachuj výsledek autorizace napříč requesty bez klíče `user_id + org_id`.

### Impersonace a podpora (N-13)
- Výchozí stav: VIZEON nemá přístup k datům klientů.
- Pokud je podpora nutná: časově omezený, klientem schválený přístup, read-only, viditelný banner, každá akce v audit logu s `actor_id` i `impersonated_id`, notifikace ownerovi firmy.
- Nikdy „login as“ přes secret key a sdílené heslo.

### Admin rozhraní (#28, #75)
- Admin routy mají vlastní layout s `authorize(..., 'admin.*')` **v každé stránce/akci**, ne jen v layoutu (layout se při client-side navigaci nemusí znovu vykonat) a ne jen v middleware.
- Admin API endpointy nejsou dostupné jinou cestou (stejná Server Action importovaná do veřejné stránky = veřejný endpoint).

## Antipatterny – pokud je uvidíš, je to P0
- `supabase.from('x').select().eq('id', params.id)` bez `org_id` a bez RLS.
- `if (user.user_metadata.role === 'admin')`.
- `const orgId = formData.get('orgId')` použito bez `requireMembership`.
- `createAdminClient()` (secret key) v běžné uživatelské akci „protože RLS blokovalo“.
- Autorizace pouze v `middleware.ts` / `proxy.ts`.
- `{isAdmin && <DeleteButton/>}` bez kontroly na serveru.

## Negativní testy (povinné)
Pro každou entitu a každou operaci: anon, viewer, user, manager, owner **vlastní firmy** a owner **cizí firmy** → očekávaný výsledek podle matice. Generuj testy z `access-matrix.md` (viz `vizeon-sec-testing/references/authz-matrix.test.ts`).

## Kontroly: #23–#34, #19, #57, #83, N-01, N-12, N-13, N-31
