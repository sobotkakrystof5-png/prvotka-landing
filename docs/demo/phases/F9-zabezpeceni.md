# F9: Zabezpečení

Závisí na: F1 až F8. Spuštění: `/phase F9`.

## Cíl
Nasadit celý bezpečnostní základ podle skillu `web-security-setup`, projít kód aplikace a zkontrolovat živý web. Výsledek zapsat do bezpečnostní paměti.

## Před začátkem
**Přečti:** `docs/demo/BRIEF.md` bod 10. Skill `web-security-setup` (celý, včetně souborů `references/` a `assets/`). `.claude/security/STATE.md`, pokud existuje (pak to není čistá instalace, doplň jen mezery a existující rozhodnutí nepřepisuj bez dotazu).

**Potřebuješ od uživatele (Q-006, Q-007):** skilly `web-security-audit`, `web-security-review` a `web-security-memory` a případné bezpečnostní skilly od Vizeonu a checklist "externí oprava". V účtu nebyly nalezeny. Pokud chybí, projdi kontroly níže ručně a napiš, co jsi nemohl ověřit.

## Úkoly
1. **Zjisti situaci:** platforma (Vercel, Next.js), integrace (Turnstile, úložiště souborů, Resend, Claude API), zpracovávaná data (osobní údaje, nahrané soubory), fáze (web je v provozu).
2. **Hlavičky (celá sada najednou):** HSTS (`max-age=63072000; includeSubDomains`, bez `preload`), CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` odepírající vše nepoužité (fotka jde přes pole pro soubor, ne přes API kamery), `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy`, `X-XSS-Protection: 0`. `poweredByHeader: false`.
3. **CSP:** `script-src` bez `unsafe-inline` a `unsafe-eval`, inline skripty jen přes nonce a `strict-dynamic`. `style-src 'unsafe-inline'` jen pokud ho framework opravdu vyžaduje, a zapsat do `.claude/security/DECISIONS.md`. Vždy `base-uri`, `object-src 'none'`, `frame-ancestors`, `form-action`. Žádné zástupné znaky, jen konkrétní domény (Turnstile, úložiště souborů v `connect-src` a případně `img-src`). Každou doménu do `CSP-LOG.md` s důvodem. Náhled PDF z F4 nesmí vyžadovat cizí rámce.
4. **Nasazení po krocích:** nejdřív všechno kromě CSP, potom CSP jako `Content-Security-Policy-Report-Only`. Projdi celou cestu klienta (brána, nahrání, fotka z mobilu, náhled originálu, ISDOC, asistent, Safari) a sbírej porušení. Chybějící zdroje přidávej jako konkrétní domény, nikdy `*` ani `unsafe-inline`. Potom vynuť a projdi znovu.
5. **Repozitář:** rozšířit `.gitignore` (`.env`, `.env.*`, `*.pem`, `*.key`, `.vercel`, `.DS_Store`), `/.well-known/security.txt` (pole `Expires` povinné, nastavit připomínku), CI workflow (audit závislostí, hledání tajných klíčů, kontrola hlaviček živého webu).
6. **DNS, pozor:** demo posílá e-maily z prvotka.cz přes Resend. `v=spf1 -all` pro doménu bez pošty zde **neplatí** (D-013). SPF a DKIM musí zahrnout Resend a běžnou poštu, DMARC zpřísňovat až po ověření doručování. Dále DNSSEC a CAA. Předat tomu, kdo spravuje doménu, a stav zapsat do `.claude/security/STATE.md`.
7. **Revize kódu aplikace** (skill `web-security-review`, pokud existuje, jinak ručně): vynucení `workspace_id` u všech dotazů, validace vstupů na serveru, nahrávání souborů (typ podle obsahu, velikost, počet stran), podepsané odkazy, cookie, CSRF u akcí měnících data, rate limity, injekce do promptů, úniky v logu, závislosti.
8. **Kontrola živého webu** (skill `web-security-audit`, pokud existuje, jinak ručně): hlavičky, cookie atributy, nedostupnost cron trasy bez tajného tokenu, nedostupnost cizích souborů, chování po vypršení.
9. **Paměť a bloky:** vytvoř `.claude/security/` (`STATE.md`, `DECISIONS.md`, `CSP-LOG.md`, `AUDIT-LOG.md`) s reálným stavem, vlož bezpečnostní blok do `CLAUDE.md` (místo označené `SECURITY-BLOCK`, nepřepisuj zbytek) a doplň `docs/demo/AGENTS-demo.md`, pokud skill vyžaduje.

## Mimo rozsah
Útoky na systémy, které uživatel nevlastní. HSTS preload (patří na konec po měsíci čistého provozu, zapiš jako otevřenou položku). Nová funkcionalita.

## Hotovo, když
- CSP běží vynuceně a na celé cestě klienta (včetně Safari) nejsou porušení.
- Kontrola hlaviček živého webu projde a výsledek je v `AUDIT-LOG.md`.
- Revize kódu je hotová a nálezy jsou opravené nebo zapsané jako otevřené s vysvětlením.
- `.claude/security/`, `security.txt` a CI existují.
- DNS pro e-maily je zapsané a doručování oznámení ověřené.

## Kontroly
Žádné tajné hodnoty v repozitáři. Žádné `unsafe-inline` v `script-src`.

## Možné dělení na sessions
1. Hlavičky, CSP v Report-Only, sběr porušení, repozitář, `security.txt`, CI.
2. Vynucení CSP, DNS, revize kódu, kontrola živého webu, paměť a bloky.
