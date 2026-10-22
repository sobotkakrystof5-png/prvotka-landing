---
name: vizeon-sec-secrets-data
description: Správa tajných klíčů a ochrana dat – Supabase publishable/secret klíče a JWT signing keys, Vercel env proměnné (Sensitive), .env soubory, rotace a revokace uniklého klíče, TLS, šifrování v klidu a aplikační šifrování (Supabase Vault, AES-GCM), hashování tokenů, logování bez citlivých dat, mapování kopií dat, retence, mazání a anonymizace, oddělení dev/staging/prod a anonymizované seedy. Použij, když přidáváš klíč nebo integraci, pracuješ s .env, ukládáš citlivé údaje (IBAN, rodné číslo, tokeny integrací), nastavuješ logování nebo řešíš únik klíče. Pokrývá sekci I a #7–#8.
---

# Tajné klíče a ochrana dat (sekce I)

## P0 pravidla
1. **Žádný secret v gitu, v klientském kódu, v `NEXT_PUBLIC_*`, v logu, v issue, v chatu s AI ani v kontextu agenta** (#103, #107, #143).
2. **Uniklý klíč = kompromitovaný klíč.** Odstranění z repa nestačí – okamžitá rotace podle `references/key-rotation-runbook.md` (#106).
3. **Každé prostředí a každá integrace má vlastní klíč s minimálními právy** (#8, #105).
4. **Produkční data se nekopírují do dev/preview/stagingu** (N-38). Seed = syntetická nebo anonymizovaná data.

## Klíče Supabase (N-29)
| Klíč | Kde smí být | Poznámka |
|---|---|---|
| Publishable key (dříve `anon`) | klient, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | veřejný – bezpečnost stojí na RLS |
| Secret key (dříve `service_role`) | jen server: Vercel env (Sensitive), Edge Function secrets | obchází RLS; vytvoř samostatné secret keys pro různé komponenty (web, cron, worker), aby šly rotovat zvlášť |
| JWT signing keys | spravuje Supabase | používej asymetrické klíče; rotace bez výpadku přes standby klíč |
| DB heslo | trezor (1Password/Bitwarden), CI secret pro migrace | nikdy v `.env` aplikace na Vercelu, pokud aplikace nepotřebuje přímé spojení |

Preferuj nové publishable/secret klíče před legacy JWT `anon`/`service_role` – jdou jednotlivě odvolat a rotovat. Pokud projekt používá legacy klíče, naplánuj migraci a zapiš do `risk-register.md`.

## Vercel env proměnné (#104)
- Produkční secrets jako **Sensitive** environment variables (nelze je zpětně přečíst v dashboardu).
- Production / Preview / Development mají **odlišné** hodnoty. Preview nikdy s produkčním secret key ani produkční DB.
- `vercel env pull` stahuje secrets na disk → nepoužívej pro produkci; lokálně jen dev hodnoty.
- Seznam proměnných a jejich vlastníků v `docs/security/secrets-inventory.md` (název, účel, prostředí, scopes, kdo vlastní, datum poslední rotace, plánovaná rotace) – **bez hodnot**.

## Lokální vývoj
- `.env.local` v `.gitignore`; v repu jen `.env.example` s prázdnými hodnotami.
- Secret scanning v pre-commit (gitleaks) i v CI (`vizeon-sec-supply-chain-cicd`).
- Claude Code nesmí `.env*` číst (deny pravidla v `vizeon-sec-ai-agents`).
- Klíče se neposílají e-mailem/Slackem/WhatsAppem – jen přes správce hesel se sdíleným trezorem.

## Šifrování (#100–#102)
- TLS všude (Vercel a Supabase zajišťují HTTPS; vlastní integrace jen `https://`, ověřování certifikátů nikdy nevypínat – žádné `NODE_TLS_REJECT_UNAUTHORIZED=0`).
- Šifrování disku v klidu zajišťuje Supabase. **To nechrání proti úniku přes aplikaci nebo SQL.**
- **Aplikační šifrování** pro přísně důvěrná pole (rodné číslo, číslo OP, IBAN pro mzdy, přístupové tokeny integrací, přihlašovací údaje třetích stran):
  - Supabase Vault (`vault.create_secret`, čtení přes `vault.decrypted_secrets` jen v security definer funkci s kontrolou) pro tokeny integrací,
  - nebo AES-256-GCM v aplikaci s klíčem mimo DB (Vercel Sensitive env / KMS), náhodný IV na záznam, verze klíče uložená u záznamu (rotace),
  - pro vyhledávání podle šifrované hodnoty blind index = HMAC-SHA256 s odděleným klíčem.
- Tokeny, které jen porovnáváš (pozvánky, API klíče uživatelů, reset tokeny vlastní výroby): ukládej **hash** (SHA-256), ne hodnotu. Generuj `crypto.randomBytes(32)`.
- Nikdy vlastní kryptografie, nikdy MD5/SHA1 pro bezpečnost, nikdy `Math.random()` pro tokeny.

## Logování bez citlivých dat (#107, #191)
- Zakázané v logech: hesla, tokeny, cookies, `Authorization` hlavičky, signed URL, API klíče, celé request body, rodná čísla, čísla účtů, obsah dokumentů.
- Sentry/monitoring: `sendDefaultPii: false`, `beforeSend` scrubber (hlavičky, cookies, query params `token`, `code`, `key`), vypnutý Session Replay na stránkách s daty nebo s maskováním všeho.
- Strukturované logy s `requestId`, `userId`, `orgId`, akcí a výsledkem – ne s daty.

## Mapa kopií dat (#108)
Doplň do `data-inventory.md` pro každý citlivý údaj všechna místa: DB, Storage, zálohy (Supabase + offsite), logy (Vercel, Supabase, Sentry), cache (CDN, Redis), exporty, e-maily (Resend log), AI poskytovatel, n8n/Make běhy (ukládají payloady!), lokální disky vývojářů, CI artefakty.

## Retence, mazání, anonymizace (#109, #110)
- Retenční lhůty definuj s klientem (`vizeon-sec-gdpr-legal` – pozor na zákonné archivační lhůty).
- Implementace: plánovaná úloha (pg_cron / Vercel Cron s vlastním tokenem) maže nebo anonymizuje po lhůtě, loguje počet záznamů.
- Mazání musí pokrýt i Storage objekty a odkazované kopie; zálohy expirují podle retence záloh (zdokumentuj, že data v zálohách zanikají do N dní).
- Anonymizace = nevratná (ne jen skrytí jména); pozor na kvazi-identifikátory.

## Oddělení prostředí (#7, #8, N-38)
- Supabase: samostatný projekt pro produkci; staging projekt; lokální `supabase start`.
- Vercel: Preview deploymenty napojené na staging, s Deployment Protection.
- Seed skript generuje fiktivní firmy/osoby (Faker), nikdy dump produkce. Pokud je nutná produkční kopie pro ladění: anonymizační pipeline, schválení, smazání po použití.

## Kontroly: #7, #8, #100–#110, #191, N-29, N-38
Runbook: `references/key-rotation-runbook.md`
