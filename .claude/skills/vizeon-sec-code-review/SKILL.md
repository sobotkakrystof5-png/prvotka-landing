---
name: vizeon-sec-code-review
description: Bezpečnostní review každé změny kódu a každého PR (včetně kódu vygenerovaného AI) v Next.js + Supabase projektech – spuštění sec-scan.sh, systematická kontrola diffu podle checklistu (autorizace, tenant scope, RLS a migrace, validace, secrets, klient/server hranice, soubory, webhooky, AI nástroje, závislosti, CI), hodnocení závažnosti P0/P1/P2 a formát nálezů. Použij před každým commitem a PR, když uživatel řekne „zkontroluj“, „review“, „je to bezpečné?“, po dokončení funkce agentem a při převzetí cizího kódu. Pokrývá fázi 2 standardu a #149, #177.
---

# Security review změn (fáze 2)

Cíl: žádná změna se nedostane do `main`, aniž by někdo (agent i člověk) prošel otázku **„kdo jiný než oprávněný uživatel by tohle mohl zavolat, přečíst nebo změnit?“**

## Postup

### 1. Automatika
```bash
bash tools/security/sec-scan.sh            # heuristiky (skript: scripts/sec-scan.sh tohoto skillu)
pnpm lint && pnpm typecheck && pnpm test
supabase test db                            # pokud se mění DB
# po migraci: audit SQL (vizeon-sec-supabase/scripts/audit.sql) + get_advisors(security)
```
Při prvním nastavení projektu zkopíruj `scripts/sec-scan.sh`, `vizeon-sec-supabase/scripts/audit.sql` a `audit-gate.sh` do `tools/security/` v repozitáři (CI je volá odtud).

### 2. Zmapuj změnu
`git diff --stat main...HEAD` a roztřiď soubory:
- **Vstupní body** (nové/změněné Server Actions, Route Handlery, RPC funkce, Edge Functions, webhooky, cron, AI nástroje) – nejvyšší pozornost.
- **DB** (migrace, politiky, granty, funkce, views, buckety).
- **Hranice klient/server** (`"use client"`, props, env proměnné).
- **Konfigurace** (`next.config`, `middleware`/`proxy`, `vercel.json`, `.github/`, `.claude/`, `package.json`).

### 3. Checklist pro každý vstupní bod
- [ ] Validace vstupu Zod `.strict()` se limity.
- [ ] `requireUser()` (ověřený `getUser`/`getClaims`, ne `getSession`).
- [ ] `authorize(orgId, perm)` odpovídající `access-matrix.md`; `orgId` ověřen proti membership.
- [ ] Každý dotaz má `.eq('org_id', orgId)` a tabulka má RLS.
- [ ] Žádná pole z klienta navíc (role, org_id, status, cena).
- [ ] Žádný secret key; pokud ano, je to admin modul s vlastní autorizací a auditem.
- [ ] Chyby nevrací detaily; 404 pro cizí záznamy.
- [ ] Rate limit u citlivých/drahých operací.
- [ ] Audit log u citlivých operací.
- [ ] Negativní test existuje a prochází.

### 4. Checklist pro DB změny
- [ ] RLS zapnuté, politiky pro select/insert/update/delete, `WITH CHECK`, žádné `true`.
- [ ] Granty minimální (anon nic), sloupcové granty u citlivých polí.
- [ ] Funkce: `set search_path = ''`, `revoke execute from public, anon`, SECURITY DEFINER zdůvodněný a s vnitřní kontrolou.
- [ ] Views `security_invoker = true`; žádné MV v `public`.
- [ ] `org_id not null` + index + trigger neměnnosti.
- [ ] Migrace je zpětně kompatibilní; destruktivní krok má schválení a zálohu.
- [ ] pgTAP test pro cizí firmu.

### 5. Hranice klient/server
- [ ] Nic ze `src/server/**` se neimportuje do `"use client"`.
- [ ] Nové `NEXT_PUBLIC_*` jsou opravdu veřejné.
- [ ] Do klientských komponent jdou jen DTO bez citlivých polí.
- [ ] Žádný `dangerouslySetInnerHTML` s cizím obsahem, žádné `javascript:` URL.

### 6. Ostatní
- [ ] Nové závislosti ověřené (existence, původ, skripty) – viz `vizeon-sec-supply-chain-cicd`.
- [ ] Soubory: privátní bucket, cesta od serveru, typ podle magic bytes – `vizeon-sec-files`.
- [ ] Webhook: podpis nad raw body + idempotence.
- [ ] AI nástroj: allowlist, autorizace v gatewayi, schválení rizikových akcí – `vizeon-sec-ai-agents`.
- [ ] Logy bez secrets a PII.
- [ ] Workflow: minimální permissions, akce na SHA, žádný `pull_request_target`.
- [ ] `docs/security/` aktualizované (nová role, data, integrace, endpoint).

### 7. Specifika kódu z AI (#149)
AI typicky: zapomene autorizaci v nové akci, použije admin klienta „aby to fungovalo“, napíše RLS `using (true)` „dočasně“, přidá `select('*')`, vymyslí balíček, vypne kontrolu typu/testu, přidá `console.log` s daty, vloží `NEXT_PUBLIC_` k tajemství, ponechá debug endpoint. **Na tyto vzory se dívej záměrně.** Kód od agenta nikdy neschvaluje stejný agent – citlivé části (auth, RLS, platby, admin, export) vyžadují lidské review (CODEOWNERS).

## Hodnocení a formát nálezů
```
[P0] Autorizace – Server Action `deleteContact` neověřuje členství ve firmě
     Kde: app/(app)/contacts/actions.ts:42
     Dopad: libovolný přihlášený uživatel smaže kontakt jiné firmy (IDOR)
     Oprava: authorize(orgId, 'contact.delete') + .eq('org_id', orgId)
     Ověření: test 'foreignOwner NESMÍ delete contacts' v authz-matrix
```
- **P0** blokuje merge. **P1** opravit před produkcí (nebo výjimka s termínem). **P2** do backlogu s termínem.
- Neuváděj „vypadá to bezpečně“ bez důkazu. Pokud jsi něco neověřil (např. konfiguraci v dashboardu), napiš to výslovně jako otevřený bod.

## Kontroly: #149, #177, #179 (lokálně), N-40
