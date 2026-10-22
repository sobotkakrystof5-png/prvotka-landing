---
description: Spustí práci na fázi (F0 až F10) podle jejího zadání v docs/demo/phases.
argument-hint: F0 | F1 | ... | F10
---

Pracuješ na fázi **$ARGUMENTS**.

1. Najdi soubor `docs/demo/phases/$ARGUMENTS-*.md` a přečti ho celý. Přečti sekce `docs/demo/BRIEF.md`, na které odkazuje.
2. Zkontroluj v `memory/demo/memory.md` (Aktuální stav), že předchozí fáze mají stav `hotovo`. Pokud ne, řekni to a zastav se.
3. Zkontroluj v `memory/demo/memory.md` (Otevřené otázky), zda fázi neblokuje otevřená otázka. Pokud ano, zeptej se uživatele, než začneš.
4. Shrň česky v nejvýše šesti řádcích, co fáze obsahuje a co z "Potřebuješ od uživatele" ještě chybí.
5. Po potvrzení implementuj jen to, co je v sekci Úkoly. Co je v sekci Mimo rozsah, nedělej.
6. Při velké fázi pracuj po částech podle sekce "Možné dělení na sessions" a po každé části zapiš postup do `memory.md`.
7. Fázi označ `hotovo` až po splnění všech bodů v sekci "Hotovo, když" a po potvrzení uživatele. Potom spusť `/session-end`.
