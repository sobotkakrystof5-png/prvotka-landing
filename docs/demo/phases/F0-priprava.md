# F0: Příprava

Závisí na: nic. Spuštění: `/phase F0`.

## Cíl
Projít existující repozitář prvotka.cz, připravit kostru demo aplikace (trasy, konfigurace, databáze, úložiště, testy) a ověřit, že `/demo` se vykreslí v designu webu. Žádná byznys logika.

## Před začátkem
**Přečti:** `docs/demo/BRIEF.md` body 0, 1, 2, 10 (jen část o tajných klíčích) a 15. `docs/demo/AGENTS-demo.md`.

**Potřebuješ od uživatele:**
- Neon projekt nebo větev určená jen pro demo (připojovací řetězec uživatel vloží sám do `.env.local`, do chatu a paměti se nikdy nepíše).
- Potvrzení, že demo žije ve stejném repozitáři jako web (skupina tras `/demo`), případně rozhodnutí o jiném uspořádání.

## Úkoly
1. **Prostuduj repozitář:** verze Next.js a React, způsob stylování (Tailwind, CSS proměnné), design tokeny (`--paper`, `--ink`, `--accent` a další), fonty (Newsreader, Manrope, JetBrains Mono), existující komponenty (tlačítko, štítek, odznak stavu, ukázka aplikace na úvodní stránce), práce s formuláři a hlavičkami. Výsledek shrň do sekce Předání další session v `memory.md` a nejdůležitější do Klíčových rozhodnutí.
2. **Skupina tras `/demo`:** `/demo` (brána) a `/demo/app` (plocha), zatím s prázdným obsahem. Vlastní layout bez navigace marketingového webu.
3. **Konfigurace prostředí:** `.env.example` se všemi názvy proměnných (bez hodnot) a modul, který je validuje Zodem při startu a na serveru. Proměnné: `DATABASE_URL`, `STORAGE_*` (podle dodavatele), `ANTHROPIC_API_KEY`, `EXTRACTION_MODEL`, `RESEND_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `SESSION_SECRET`, `CRON_SECRET`, `DEMO_ENABLED`, `DEMO_DAILY_EXTRACTION_CAP`.
4. **Neon + Drizzle:** serverless driver, konfigurace Drizzle, první migrace (zatím jen prázdná nebo tabulka `leads` podle F1, rozhodni a zapiš). Skripty pro migrace a kontrolu, aby se nespustily proti jiné databázi než demo.
5. **`StorageAdapter`:** rozhraní (vytvoř podepsaný odkaz pro nahrání, podepsaný odkaz pro čtení, přečti prvních N bajtů, smaž objekt, smaž podle předpony) a dvě implementace: skutečná podle Q-001 (zatím jen kostra, pokud není rozhodnuto) a paměťová pro testy.
6. **Testy a nástroje:** Vitest pro jednotkové testy, Playwright pro end-to-end, skripty `typecheck`, `lint`, `test`. Přidej ukázkový test.
7. **Pomocná funkce pro přístup k datům plochy:** kostra funkce, která vynutí `workspace_id` ze sessionu (viz AGENTS-demo.md, pravidlo 1). Plná logika přijde ve F1, ale vzor musí existovat od začátku.
8. **Vykreslení `/demo`:** prázdná stránka v designu webu (papír, linky, písma), aby bylo vidět, že tokeny fungují.

## Mimo rozsah
Formulář, e-maily, nahrávání, vytěžení, jakákoli byznys logika. Hlavičky a CSP (to je F9). Změny stávajícího marketingového webu mimo nutné sdílení tokenů.

## Hotovo, když
- Aplikace běží lokálně a `/demo` i `/demo/app` se vykreslí v designu webu bez chyb v konzoli.
- `typecheck`, `lint` a `test` projdou.
- `.env.example` existuje a chybějící proměnná způsobí srozumitelnou chybu při startu.
- Migrace jde spustit proti demo databázi a nespustí se proti jiné.
- Zjištěná fakta o repozitáři jsou v paměti.

## Kontroly
Žádná tajná hodnota v kódu ani v `.env.example`. `.env*` je v `.gitignore`.

## Možné dělení na sessions
Celá fáze se vejde do jedné session.
