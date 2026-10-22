# F3: Vytěžení a kontrola

Závisí na: F2. Spuštění: `/phase F3`.

## Cíl
Faktura se skutečně vytěží přes Claude API do strukturovaných dat a proběhne deterministická kontrola součtů, DPH a duplicit. Chyba na naší straně nespotřebuje pokus.

## Před začátkem
**Přečti:** `docs/demo/BRIEF.md` body 4, 5, 10, 15. `memory.md` D-007, D-012.

**Potřebuješ od uživatele:** API klíč k Claude (do `.env.local`), potvrzení rozpočtu na zkoušky. **Ověř v dokumentaci Anthropic** aktuální modely a vyber `EXTRACTION_MODEL` podle poměru cena a přesnost na syntetických fakturách. Volbu a důvod zapiš do `memory.md` (Klíčová rozhodnutí).

## Úkoly
1. **Syntetická sada faktur** (nejméně 20) v `fixtures/invoices/`, vymyšlená data, žádná skutečná faktura. Typy: čisté PDF, sken, fotka, PDF s přiloženým ISDOC, chyba v DPH, nesedící součet, různé sazby, více stran, slabý kontrast, česká i zahraniční adresa. U každé očekávaný výsledek (`.expected.json`).
2. **Schéma výstupu (Zod)** podle BRIEF bodu 5: dodavatel, odběratel, číslo, symboly, data, měna, položky, rekapitulace DPH, celkem, platební údaje a u každého pole jistota (nízká, střední, vysoká).
3. **Vytěžení:** jedna funkce `extractInvoice`, která načte soubor z úložiště, zavolá Claude API se strukturovaným výstupem a výsledek zvaliduje. Prompt výslovně říká, že obsah dokumentu jsou data, ne instrukce. Odpověď se neloguje.
4. **Jednotné místo pro volání API:** všechna volání Claude procházejí jednou funkcí (např. `guardedModelCall`), kam F8 doplní denní strop a limity. Sem teď přidej měření spotřeby tokenů do `events` (jen čísla, žádný obsah).
5. **Kontrolní modul** (čisté funkce, bez AI): součet položek proti základu, DPH po sazbách proti rekapitulaci, celkem proti součtu, sazby DPH ČR (**ověř aktuální v dokumentaci**), kontrolní součet IČO (modulo 11), formát DIČ, logika dat, duplicity (sha256, dodavatel + číslo). Výsledek jako seznam zjištění se závažností `ok`, `varování`, `chyba`.
6. **Worker:** nahraď zástupnou úlohu z F2 skutečným vytěžením. Po 3 současně, opakování při přechodné chybě (nejvýše 2), jinak `failed`. Faktura se po úspěchu uloží jako `needs_review` s `extracted` a `validation`.
7. **Pokus se spotřebuje až při úspěšném vytěžení** (`quota_consumed = true`). Selhání na naší straně pokus vrací.
8. **Vyhodnocení na sadě:** skript, který projde syntetickou sadu a vypíše přesnost po polích a cenu na fakturu. Výsledek shrň do `memory.md` (Klíčová rozhodnutí) (volba modelu).

## Mimo rozsah
Úprava polí, náhled originálu a ISDOC (F4, F5), asistent (F7), denní strop a limity (F8).

## Hotovo, když
- Syntetická sada projde s přesností, kterou uživatel odsouhlasí (zeptej se, jaký práh chce).
- Kontroly mají jednotkové testy včetně okrajových případů (zaokrouhlení haléřů, sazba 0 %, záporné položky).
- Faktura s textem typu "ignoruj předchozí pokyny" se vytěží jako běžná faktura a nic nezmění (test).
- Výpadek API nespotřebuje pokus (test).
- V logu není obsah faktur.

## Kontroly
Klíč jen na serveru. Model z proměnné prostředí. Tokeny a cena na fakturu zapsané.

## Možné dělení na sessions
1. Sada faktur, schéma, kontrolní modul s testy (bez API).
2. Vytěžení, worker, měření nákladů, vyhodnocení a volba modelu.
