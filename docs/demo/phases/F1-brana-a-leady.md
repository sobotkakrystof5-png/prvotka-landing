# F1: Brána a leady

Závisí na: F0. Spuštění: `/phase F1`.

## Cíl
Klient na `/demo` zadá e-mail a telefon, vznikne lead a pracovní plocha, Kryštofovi přijde oznámení a klient se přihlásí a získá osobní odkaz. E-mail jde použít jen jednou.

## Před začátkem
**Přečti:** `docs/demo/BRIEF.md` body 2, 3, 4, 9, 10, 12. `memory.md` D-003, D-009, D-011, D-013.

**Potřebuješ od uživatele (otevřené otázky Q-004, Q-009):**
- Odesílací adresa e-mailů a ověřená doména v Resendu (SPF, DKIM).
- Cloudflare Turnstile: site key a secret key (uživatel je vloží do `.env.local` sám).
- Rozhodnutí o rate limitingu bez Redisu (výchozí: tabulka v Neonu). Rozhodnutí zapiš do `memory.md` (Klíčová rozhodnutí).

## Úkoly
1. **Schéma:** `leads` (e-mail, `email_normalized` UNIQUE, telefon, `ref`, časy, hash IP, země, počítadla použití), `workspaces` (lead_id UNIQUE, status, kvóta, `delete_at`, `settings`), `access_tokens`, `sessions`, `events`. Migrace.
2. **Normalizace e-mailu:** malá písmena, ořez mezer, odstranění "+něco", u Gmailu a Googlemailu i teček v místní části. Blokace jednorázových e-mailových domén (seznam v repozitáři, snadno rozšiřitelný). Jednotkové testy včetně okrajových případů.
3. **Telefon:** jen volná kontrola formátu (české a mezinárodní číslo). Nehlídá se jedinečnost (D-003).
4. **Formulář `/demo`:** pole e-mail a telefon, validace na klientu i na serveru (Zod), honeypot, Cloudflare Turnstile, limit pokusů na IP a na e-mail. Pod formulářem informativní věta o kontaktu a mazání (text z BRIEF bodu 12), odkaz na ochranu osobních údajů.
5. **Server akce (registrace):** v jedné transakci vytvoř lead a plochu, ulož `ref` z adresy `/demo?ref=...`, vygeneruj token (v databázi jen hash), vytvoř session a nastav podepsanou httpOnly, secure, SameSite cookie, přesměruj na `/demo/app`.
6. **Oznámení Kryštofovi (Resend):** e-mail, telefon, `ref`, čas, země. Neblokuje uživatele: při selhání se lead uloží a odeslání se zopakuje (fronta nebo opakování při dalším požadavku, rozhodni a zapiš).
7. **E-mail klientovi s osobním odkazem** do dema. Text věcný, česky, vykání.
8. **Opakovaný e-mail:**
   - plocha `active` nebo `exhausted`: pošli nový osobní odkaz, plochu hned neotevírej, neprozraď existenci e-mailu jinak než hláškou "Odkaz jsme poslali".
   - plocha `expired`: zobraz "Demo jste už vyzkoušel(a). Ozvu se vám, nebo mi napište." s kontaktem na Kryštofa.
9. **Ověření session** na `/demo/app` (zatím prázdná plocha s pozdravem), odhlášení neřeš.
10. **Texty** projdi skillem `humanize-text-cs`.

## Mimo rozsah
Složky, nahrávání, vytěžení, počítání kvóty, mazání (to je F6 a F8). Hlavičky a CSP (F9).

## Hotovo, když
- Registrace projde end-to-end: lead vznikl, plocha vznikla, oznámení dorazilo, klient je v `/demo/app`.
- Stejný sjednocený e-mail (včetně variant s "+" a tečkami u Gmailu) podruhé plochu neotevře.
- Telefon se nehlídá a klient s jiným e-mailem a stejným telefonem projde.
- Selhání Resendu neshodí registraci.
- Testy: normalizace e-mailu, jednorázové domény, hash tokenů, opakovaná registrace, vypršená plocha.
- Žádný e-mail ani telefon v logu.

## Kontroly
Pomocná funkce pro data plochy vynucuje `workspace_id`. Tajné hodnoty jen na serveru. Turnstile secret se ověřuje na serveru.

## Možné dělení na sessions
1. Schéma, normalizace e-mailu a testy, server akce registrace.
2. Formulář s ochranou proti robotům, e-maily (oznámení a osobní odkaz), opakovaný a vypršený e-mail.
