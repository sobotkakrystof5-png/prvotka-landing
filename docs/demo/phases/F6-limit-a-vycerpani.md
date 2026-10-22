# F6: Limit a vyčerpání

Závisí na: F5. Spuštění: `/phase F6`.

## Cíl
Dotáhnout kvótu 4 faktur do podoby, kterou klient vidí: stav ploch `active` → `exhausted` → `expired`, odpočet 24 hodin, oznámení Kryštofovi při vyčerpání a zpráva pro návrat po vypršení.

## Před začátkem
**Přečti:** `docs/demo/BRIEF.md` body 2, 3, 9, 11, 13. `memory.md` D-002, D-004, D-012.

**Potřebuješ od uživatele:** schválení textů banneru a zprávy po vypršení (nebo nechá na tobě podle `humanize-text-cs`).

## Úkoly
1. **Kvóta:** `quota_total = 4`. Pokus se spotřebuje při úspěšném vytěžení (`quota_consumed`), rozpracované faktury drží rezervaci (základ je z F2). Dohledej a odstraň možnosti obejití (souběžné požadavky, opakované nahrání téhož souboru, smazání a nahrání znovu).
2. **Přechod do `exhausted`** při spotřebování 4. pokusu: nastav `exhausted_at` a `delete_at = exhausted_at + 24 h`. Po `exhausted` nejde nahrát nový soubor, ale jde dokončit kontrolu, úpravy, potvrzení a stahování.
3. **Banner** nahoře: odpočet do `delete_at`, krátký text a tlačítko "Domluvit hovor" (odkaz na kontakt prvotka.cz). Nesmí být rušivý, ale musí být vidět.
4. **Stav `expired`:** přístup se odepře při čtení hned po `delete_at`, i když fyzické mazání ještě neproběhlo. Návrat přes osobní odkaz ukáže zprávu "Demo jste už vyzkoušel(a). Ozvu se vám, nebo mi napište." s kontaktem a žádnou další zkoušku.
5. **Seznam "zamčených" souborů** z hromadného výběru: po vyčerpání zůstávají ve výpisu jako "V plné verzi se zpracují všechny" (pokud je uživatel chce vidět), jinak se čistí.
6. **Statistika použití** do `leads`: počet zpracovaných faktur, zda stahoval ISDOC, zda použil asistenta, časy. Zdroj je tabulka `events`.
7. **Druhé oznámení Kryštofovi** při vyčerpání: e-mail leadu, telefon, `ref`, kolik faktur zkusil, stahování ISDOC, použití asistenta, časy. Odeslání se zopakuje při selhání.
8. **Texty** projdi skillem `humanize-text-cs`.

## Mimo rozsah
Fyzické mazání dat a cron (F8). Asistent (F7).

## Hotovo, když
- Po 4. úspěšné faktuře nejde nahrát pátá (test včetně souběžných požadavků).
- Selhání na naší straně pokus nespotřebuje (test).
- Banner ukazuje správný čas a odepření po `delete_at` funguje (test s posunutým časem).
- Oznámení při vyčerpání dorazí se správnými čísly.
- Návrat po vypršení ukáže správnou zprávu.

## Kontroly
Čas počítat na serveru (ne podle hodin klienta). Žádné osobní údaje v logu.

## Možné dělení na sessions
Celá fáze se vejde do jedné session.
