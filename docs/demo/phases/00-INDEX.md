# Fáze projektu: index

Každá fáze je samostatný soubor, který jde zadat v nové session příkazem `/phase F<číslo>`. Aktuální stav fází je v `memory/demo/memory.md`.

## Pořadí a závislosti

| Fáze | Název | Závisí na | Sekce briefu | Odhad |
|---|---|---|---|---|
| F0 | Příprava | nic | 0, 1, 2, 10, 15 | 1 session |
| F1 | Brána a leady | F0 | 2, 3, 4, 9, 10, 12 | 1 až 2 sessions |
| F2 | Plocha, složky, nahrání | F1 | 3, 4, 8, 10, 13 | 2 sessions |
| F3 | Vytěžení a kontrola | F2 | 4, 5, 10, 15 | 2 sessions |
| F4 | Detail faktury (pravá část) | F3 | 0, 5, 13 | 1 až 2 sessions |
| F5 | Export ISDOC/ISDOCX | F4 | 6, 13 | 1 až 2 sessions + test v POHODĚ |
| F6 | Limit a vyčerpání | F5 | 2, 3, 9, 11, 13 | 1 session |
| F7 | AI asistent | F4 (lépe po F5) | 7, 10, 12 | 1 až 2 sessions |
| F8 | Mazání a ochrana nákladů | F6 | 9, 10, 11 | 1 session |
| F9 | Zabezpečení | F1 až F8 | 10 + skill `web-security-setup` | 1 až 2 sessions |
| F10 | Dokončení a předání | F9 | 0, 12, 13, 15, 17 | 1 až 2 sessions |

F7 se dá dělat souběžně s F5, pokud už je F4 hotová. Ostatní fáze jdou za sebou.

## Společná pravidla pro všechny fáze

- Přečti `docs/demo/AGENTS-demo.md`, pokud ho `CLAUDE.md` nenačetl.
- Jedna fáze = jedna větev. Necommituj bez pokynu uživatele.
- Na konci každé session `/session-end`. Fázi označ `hotovo` až po splnění sekce "Hotovo, když" a po potvrzení uživatele.
- Nový nápad mimo rozsah fáze zapiš do Otevřených otázek nebo do Předání v `memory.md`, neimplementuj ho.
- Každá fáze má povinné kontroly: typy, lint, testy, žádné tajné hodnoty, žádná chyba v konzoli, vzhled v souladu s webem.

## Struktura souborů fází

Cíl, před začátkem (co přečíst a co potřebuješ od uživatele), úkoly, mimo rozsah, hotovo když, kontroly, možné dělení na sessions.
