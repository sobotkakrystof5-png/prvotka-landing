# F8: Mazání a ochrana nákladů

Závisí na: F6. Spuštění: `/phase F8`.

## Cíl
Data se po lhůtě skutečně smažou (kromě leadu), demo nejde zneužít k vysokým nákladům a v krizi jde celé vypnout.

## Před začátkem
**Přečti:** `docs/demo/BRIEF.md` body 9, 10, 11. `memory.md` D-004.

**Potřebuješ od uživatele (Q-003, Q-005):** dobu uchování leadu a hodnotu denního stropu vytěžení. Plán Vercelu určuje, jak často smí běžet cron (Hobby jednou denně).

## Úkoly
1. **`delete_at` pravidla:** při 4. faktuře `exhausted_at + 24 h`. Pojistka: při každé aktivitě se `delete_at` posune na `last_active_at + 14 dní`, nejpozději však na hodnotu z lhůty po 4. faktuře, jakmile ta existuje.
2. **Mazací úloha** (Vercel Cron, trasa chráněná `CRON_SECRET`): najde plochy po `delete_at`, smaže soubory v úložišti (podle předpony `workspaces/<id>/`), potom řádky `invoices`, `invoice_edits`, `jobs`, `clients` a plochu převede na `expired`. Je **idempotentní** (opakované spuštění nic nerozbije), běží po dávkách a loguje jen počty. Smí pracovat jen nad daty dema.
3. **Odepření při čtení** po `delete_at` platí už od F6. Ověř, že funguje i bez běhu mazací úlohy.
4. **Lead zůstává** se statistikou. Případné mazání leadů po době uchování (Q-003) zatím jen jako samostatný skript, neběží automaticky, pokud uživatel nezadá jinak.
5. **Limity na bráně a nahrávání:** počet registrací na IP a na e-mail za čas, počet nahrání za minutu na plochu, počet požadavků na asistenta. Nad sdílený mechanismus (tabulka v Neonu nebo podle rozhodnutí z F1).
6. **Denní strop vytěžení** (`DEMO_DAILY_EXTRACTION_CAP`) v jednotném místě `guardedModelCall`. Po dosažení se lead uloží a klient dostane zprávu "Demo je dnes plně vytížené, ozvu se vám". Kryštof dostane oznámení o dosažení stropu.
7. **Vypínač `DEMO_ENABLED`:** po vypnutí brána ukáže "Demo je dočasně nedostupné", ale leady se dál ukládají.
8. **Sledování:** počty (registrace, faktury, náklady na tokeny, smazané plochy) do `events`, žádný obsah. Krátká sumarizace do oznámení nebo logu.
9. **Testy s posunutým časem:** plocha po `delete_at` je smazaná, lead zůstal, opakované spuštění nic nerozbije, strop se respektuje, vypínač funguje.

## Mimo rozsah
Analytika návštěvnosti, nástroje třetích stran pro sledování chyb (zapnout jen s rozhodnutím uživatele a bez obsahu faktur).

## Hotovo, když
- Test s posunutým časem smaže soubory i řádky a ponechá lead.
- Smazání je idempotentní a nezasáhne jinou než demo databázi.
- Denní strop a limity zastaví zneužití a lead se přesto uloží.
- Vypínač funguje.

## Kontroly
Cron trasa není veřejně volatelná bez tajného tokenu. V logu jen počty.

## Možné dělení na sessions
Celá fáze se vejde do jedné session.
