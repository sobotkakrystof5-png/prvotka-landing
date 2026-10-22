# F5: Export ISDOC a ISDOCX

Závisí na: F4. Spuštění: `/phase F5`.

## Cíl
Z potvrzených dat se deterministickým kódem vygeneruje ISDOC (a ISDOCX s originálem), zvaliduje se proti XSD, zobrazí se v záložce ISDOC a jde stáhnout. Soubory musí projít importem do skutečné POHODY.

## Před začátkem
**Přečti:** `docs/demo/BRIEF.md` body 6, 13. `memory.md` D-007.

**Potřebuješ od uživatele (Q-002, blokující):** přístup k POHODĚ s testovací firmou, kam půjde vygenerované soubory naimportovat, nebo uživatel import provede sám podle návodu. Bez ověřeného importu se demo nespouští.

## Úkoly
1. **Ověř specifikaci:** aktuální verze formátu ISDOC (očekává se 6.0.2) a oficiální XSD na stránkách formátu ISDOC. Struktura ISDOCX (balíček s XML a přílohou) podle oficiální specifikace, ne z paměti. Zapiš zdroje a verzi do `memory.md` (Klíčová rozhodnutí).
2. **Generátor ISDOC** jako čistá funkce z potvrzených dat. Žádné volání AI. Správné zaokrouhlení a jednotky, sazby DPH, měna, symboly, splatnost, platební údaje.
3. **Validace proti XSD** každého vygenerovaného souboru před stažením. Neplatný soubor se nikdy nenabídne ke stažení a chyba se zapíše (bez obsahu faktury).
4. **ISDOCX:** balíček s ISDOC a originálem faktury jako přílohou.
5. **Záložka ISDOC:** náhled XML (několik prvních řádků a posuvník nebo rozbalení), stavový odznak "připraveno k importu pro POHODU".
6. **Stažení:** trasa na serveru, která ověří session a `workspace_id`, vygeneruje soubor a vrátí ho s bezpečným názvem. Počítadlo stažení do `events`.
7. **Nastavení kanceláře** (`/demo/app/nastaveni`): střediska, předkontace, číselná řada, účetní program. Promítnout do exportu jen to, co formát ISDOC opravdu nese. Co formát nenese, ukázat v rozhraní jako ukázku nastavení na míru a netvrdit, že to POHODA naimportuje.
8. **Test v POHODĚ:** import vzorků (čistá faktura, více sazeb DPH, zahraniční dodavatel, ISDOCX). Výsledek, verze POHODY a případné odchylky zapiš do `memory.md` (Klíčová rozhodnutí a Aktuální stav).
9. **Texty** projdi skillem `humanize-text-cs`.

## Mimo rozsah
Napojení na skutečné účetní programy, hromadné stažení všech faktur najednou (jen pokud to uživatel výslovně zadá).

## Hotovo, když
- Všechny syntetické faktury z F3 dají validní ISDOC (test proti XSD).
- ISDOC a ISDOCX se stáhnou a **naimportují do POHODY bez chyby** (zapsáno, kým a kdy).
- Faktura, která není potvrzená, se nedá exportovat.
- Soubor se stažením ověřuje plochu (test cizího přístupu).

## Kontroly
Žádné logování obsahu. Názvy souborů bez osobních údajů a bez cest.

## Možné dělení na sessions
1. Ověření specifikace, generátor, validace, testy.
2. Rozhraní (záložka, stažení, nastavení) a test v POHODĚ.
