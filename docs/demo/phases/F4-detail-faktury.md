# F4: Detail faktury (pravá část plochy)

Závisí na: F3. Spuštění: `/phase F4`.

## Cíl
Vpravo se po výběru faktury objeví výsledek: záložka **Údaje** (vytěžená pole s kontrolami, editovatelná), záložka **Originál** a zástupná záložka **ISDOC**. Člověk může každé pole přepsat, změny se zapisují do auditu a fakturu musí potvrdit.

## Před začátkem
**Přečti:** `docs/demo/BRIEF.md` body 0, 5, 13. `memory.md` D-010.

**Potřebuješ od uživatele:** nic nového.

## Úkoly
1. **Pravý panel se záložkami** Údaje, ISDOC (zatím prázdný stav "Export přijde v další fázi"), Originál. Design přesně jako ukázka aplikace na prvotka.cz: mono popisky vlevo, tabulární hodnoty vpravo, varování v oranžovém rámečku, razítkové stavy.
2. **Údaje:** zobrazení všech polí z `extracted`, u polí s nízkou jistotou viditelné upozornění. Zjištění z kontrol (součet nesedí, DPH, duplicita) jako seznam se závažností.
3. **Editace:** každé pole jde přepsat ručně (i položky: přidat, smazat, upravit). Po každé změně se znovu spustí kontrola z F3 a výsledek se aktualizuje. Klávesnicové ovládání.
4. **Audit:** každá změna zapsaná do `invoice_edits` (kdo: `user`, cesta, před, po, čas).
5. **Potvrzení:** tlačítko Potvrdit. Faktura s chybou (ne s varováním) nejde potvrdit, dokud ji člověk neopraví, nebo výslovně nepotvrdí vědomé přepsání (rozhodni podle BRIEF bodu 5 a zapiš). Stav `confirmed`.
6. **Originál:** náhled PDF nebo obrázku načtený přes podepsaný odkaz. **Zvol způsob, který nevyžaduje povolit cizí rámce v budoucí CSP** (vykreslení stránek PDF do plátna knihovnou z vlastního původu, obrázky přes `<img>`). Zapiš do `memory.md` (Klíčová rozhodnutí), protože to ovlivní F9.
7. **Stavy rozhraní:** načítání, prázdný stav, chyba, faktura ve stavu `processing` a `failed` (s možností zkusit znovu bez spotřeby pokusu).
8. **Mobil:** výsledek přes celou šířku s tlačítkem Zpět.
9. **Texty** projdi skillem `humanize-text-cs`.

## Mimo rozsah
Generování ISDOC a stažení (F5), asistent (F7).

## Hotovo, když
- Faktura s chybou v DPH ukáže varování a nejde potvrdit bez opravy.
- Změna pole spustí novou kontrolu a zapíše se do auditu.
- Originál se zobrazí (PDF i obrázek) bez zásahu do hlaviček a bez cizích rámců.
- Cizí plocha nemá k faktuře přístup (test).
- Vzhled je porovnaný s ukázkou na prvotka.cz a nepůsobí šablonovitě.

## Kontroly
Přístupnost (kontrast, klávesnice, popisky polí). Žádná data faktur v logu.

## Možné dělení na sessions
1. Panel, záložky, zobrazení polí a kontrol.
2. Editace, audit, potvrzení, originál, mobil.
