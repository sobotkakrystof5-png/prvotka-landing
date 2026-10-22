---
name: vizeon-sec-auth
description: Bezpečné přihlašování, správa účtů a relací pro Next.js + Supabase Auth – registrace, login, MFA/passkeys (AAL2), OAuth/Google (PKCE, redirect URI, propojování účtů), reset hesla, změna e-mailu, re-autentizace citlivých operací, odhlášení všech zařízení, cookies, refresh tokeny, brute-force a credential stuffing, enumerace účtů, offboarding uživatelů. Použij při jakékoli práci na auth flow, middleware/proxy session, cookies nebo nastavení Supabase Auth. Pokrývá sekce B a J.
---

# Autentizace a relace (sekce B, J)

Používáme **Supabase Auth** přes `@supabase/ssr`. Vlastní autentizaci (hashování hesel, tokeny) **nepíšeme** (#11, #14).

## P0 pravidla

1. **Na serveru nikdy nevěř `supabase.auth.getSession()`** – čte cookie bez ověření (N-02). Identitu ověřuj `supabase.auth.getUser()` (dotaz na Auth server) nebo `supabase.auth.getClaims()` (ověření podpisu JWT – vyžaduje asymetrické JWT signing keys). V klientských komponentách je `getSession()` jen pro UI.
2. **Identita ≠ autorizace.** Po ověření uživatele vždy následuje kontrola členství a role (`vizeon-sec-authz-tenancy`).
3. **Admini a role s přístupem k citlivým datům mají povinné MFA** (#12, #13) a MFA je **vynucené v DB**, ne jen v UI (N-35): restriktivní RLS politika `(select auth.jwt()->>'aal') = 'aal2'` na citlivých tabulkách.
4. **Žádné testovací/skryté účty** v produkci (#20). Seed s účty `test@`, `admin@` se do produkce nesmí dostat.

## Konfigurace Supabase Auth (Dashboard → Authentication) – zkontroluj a zdokumentuj

| Nastavení | Požadavek |
|---|---|
| Confirm email | zapnuto |
| Secure email change (potvrzení na starý i nový e-mail) | zapnuto (#17) |
| Secure password change (vyžaduje nedávné přihlášení) | zapnuto (#17) |
| Minimální délka hesla | ≥ 12, ideálně 15 (ASVS 5) |
| Leaked password protection (HaveIBeenPwned) | zapnuto, pokud plán umožňuje (#15) |
| Požadavky na znaky | nevynucuj složitost nad rámec délky; blokuj uniklá hesla |
| CAPTCHA (Turnstile/hCaptcha) | zapnuto pro signup, login, reset (#15, #196) |
| Rate limits (emails, token refresh, verify, OTP) | zkontrolovat a zpřísnit pro produkci |
| Site URL a Redirect URLs | jen přesné produkční URL; žádné `*` wildcardy na cizí domény; preview URL jen v ne-produkčním projektu (#21) |
| JWT expiry | 3600 s nebo méně; pro adminy zvaž kratší relace (N-35) |
| Refresh token rotation + reuse interval | zapnuto, krátký reuse interval (#113, N-36) |
| Session timebox / inactivity timeout (pokud plán umožňuje) | nastavit pro citlivé aplikace (#112) |
| JWT signing keys | asymetrické (ES256/RS256), plán rotace (N-29) |
| MFA (TOTP, WebAuthn/passkeys) | zapnuto (#12) |
| Custom SMTP | vlastní doména se SPF/DKIM/DMARC (N-28) |
| Anonymous sign-ins | vypnuto, pokud nejsou výslovně potřeba |
| Signups | u B2B aplikací vypnout veřejnou registraci → jen pozvánky |

Ověřený stav zapiš do `docs/security/auth-config.md` (screenshot nebo export konfigurace) – je to důkaz pro release gate.

## Implementační vzory

### Serverový klient a ověření uživatele
```ts
// src/server/auth.ts
import 'server-only'
import { cache } from 'react'
import { createClient } from '@/server/supabase'   // createServerClient z @supabase/ssr s cookies()

export const requireUser = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()   // NE getSession()
  if (error || !data.user) throw new AuthError('UNAUTHENTICATED')
  return { supabase, user: data.user }
})

export async function requireAal2() {
  const { supabase, user } = await requireUser()
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (data?.currentLevel !== 'aal2') throw new AuthError('MFA_REQUIRED')
  return { supabase, user }
}
```

### Vynucení MFA v RLS (restriktivní politika)
```sql
create policy "mfa required for invoices"
on public.invoices as restrictive
for all to authenticated
using ((select auth.jwt()->>'aal') = 'aal2')
with check ((select auth.jwt()->>'aal') = 'aal2');
```
Pokud MFA není povinné pro všechny role, vynucuj ji v politice jen pro konkrétní role přes funkci `app.requires_mfa()`.

### Re-autentizace citlivých operací (#34, #118)
Změna bankovního účtu, export všech dat, změna role, smazání firmy, vypnutí MFA:
- vyžaduj čerstvé MFA (AAL2 a `iat`/čas posledního ověření ≤ 5–15 min) nebo `supabase.auth.reauthenticate()` + nonce,
- zaloguj do audit logu,
- pošli notifikaci uživateli (#22).

### OAuth / Google (#21, N-10)
- Používej PKCE flow (výchozí v `@supabase/ssr`), callback route vyměňuje `code` za session na serveru.
- Parametr `next`/`redirectTo` po přihlášení validuj proti allowlistu **relativních** cest (`/^\/(?!\/)/`) – jinak open redirect (#64).
- Automatické propojení identit podle e-mailu povol jen pro providery s ověřeným e-mailem. Nikdy nepropojuj účet na základě neověřeného e-mailu.
- B2B: zvaž omezení přihlášení na doménu firmy (`hd` claim u Google) – kontroluj **na serveru**, ne v UI.

### Reset hesla (#16)
- Jednorázový token s krátkou platností (Supabase výchozí; nezvyšuj).
- Odpověď „Pokud účet existuje, poslali jsme e-mail“ – stejný text, stejný stavový kód a podobný čas pro existující i neexistující účet (N-11).
- Po resetu: odhlas všechna ostatní zařízení (`signOut({ scope: 'others' })`) a pošli notifikaci (N-36).

### Odhlášení a správa relací (#18, #114)
- Odhlášení: `supabase.auth.signOut()` (výchozí scope `global` odhlásí všude – pro běžné odhlášení zvaž `local`, pro „odhlásit všechna zařízení“ `global`).
- Při změně hesla, e-mailu, MFA, role nebo deaktivaci: zneplatni ostatní relace.
- Pamatuj: přístupový JWT zůstává platný do expirace i po odhlášení. Proto krátká expirace JWT + kontrola stavu membership v RLS/DAL (deaktivovaný člen nic nevidí okamžitě – `memberships.status = 'active'`).

### Offboarding (#19)
- Deaktivace člena firmy = `memberships.status = 'disabled'` (okamžitý účinek přes RLS) + `auth.admin.signOut(userId)` / smazání relací přes admin API v serverovém admin modulu + revokace osobních API tokenů a integrací + audit.
- Úplné smazání uživatele (`auth.admin.deleteUser`) až podle retence.

### Cookies (#111, #116, #117)
- `@supabase/ssr` nastavuje cookies z JS (nejsou HttpOnly). Kompenzuj: přísná CSP (žádný inline script bez nonce), žádné skripty třetích stran na přihlášených stránkách (N-37), `Secure`, `SameSite=Lax`, `Path=/`.
- Vlastní cookies aplikace (např. aktivní firma): `HttpOnly; Secure; SameSite=Lax`, prefix `__Host-`.
- Tokeny nikdy v URL (kromě jednorázových auth kódů, které se ihned mění), ne v localStorage pro vlastní tokeny, ne v analytice. `Referrer-Policy: strict-origin-when-cross-origin` (nebo `no-referrer` na stránkách s tokeny).
- Session fixation (#115): po přihlášení se vždy vydává nová relace (Supabase to dělá) – nepřenášej žádný pre-login identifikátor do post-login stavu.

### Logování a upozornění (#22)
Loguj: úspěšné a neúspěšné přihlášení, MFA enroll/unenroll, změnu hesla/e-mailu, reset, nové zařízení/IP země, odhlášení všude. Upozorni uživatele e-mailem u: změny hesla, e-mailu, MFA, nového přihlášení z nové země (pokud implementováno). Hesla, tokeny ani OTP do logů nikdy.

## Negativní testy (povinné, viz `vizeon-sec-testing`)
- [ ] Požadavek bez cookie → 401 na všech chráněných routách a akcích.
- [ ] Zfalšovaný/expirovaný/cizím klíčem podepsaný JWT → odmítnut.
- [ ] Uživatel s AAL1 nečte tabulky chráněné AAL2 politikou (přímo přes REST).
- [ ] Reset hesla pro neexistující e-mail → stejná odpověď.
- [ ] `redirectTo=https://evil.example` → ignorováno.
- [ ] Deaktivovaný člen → okamžitě 0 řádků.
- [ ] Po změně hesla stará relace na jiném zařízení nefunguje (po refresh).

## Kontroly k ověření: #11–#22, #111–#118, N-02, N-10, N-11, N-35, N-36
