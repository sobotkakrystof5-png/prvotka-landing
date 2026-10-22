# PRAVIDLA: jak se vede paměť

Platí pro každého agenta. Měnit je smí jen uživatel, agent je sám neupravuje.

## 1. Základ
Každá změna projektu se zapíše do `memory.md` ve stejném kroku, kdy proběhla. Ne na konci session, ne po připomenutí. Session bez zápisu není dokončená.

Paměť je v gitu a commituje se spolu s kódem.

## 2. Co se zapisuje
- Vznik, přejmenování nebo smazání souboru či složky.
- Změna obsahu, designu nebo textů.
- Technické rozhodnutí (technologie, knihovna, hosting, integrace, limity).
- Co se zkusilo a nefungovalo.
- Co se záměrně odložilo a proč.
- Otázka, která čeká na uživatele.

## 3. Co se nezapisuje
- Popis postupu ("nejdřív jsem hledal, pak jsem...").
- Co je vidět přímo v kódu nebo v gitu.
- Shrnutí typu "vše hotovo a funguje".
- Duplicitu obsahu `docs/demo/AGENTS-demo.md`, `CLAUDE.md` nebo `docs/`.
- Session, ve které se nic nezměnilo.

## 4. Zakázaný obsah (bezpečnost paměti)
- Žádné tajné hodnoty: klíče, hesla, tokeny, připojovací řetězce, hodnoty proměnných prostředí. U prostředí se píše jen "nastaveno / nenastaveno".
- Žádná data klientů: obsah faktur, e-maily a telefony leadů.
- Před koncem session prohledej změněné soubory, jestli něco z toho neobsahují.

## 5. Formát záznamu v deníku
Nejnovější nahoře. Datum vždy absolutní (`2026-10-22`), nikdy "včera".

```
### YYYY-MM-DD: krátký název
- **Co:** jedna až dvě věcné věty v minulém čase.
- **Proč:** důvod, nebo "na pokyn uživatele".
- **Dopad:** co dalšího se tím dotýká. "Izolované", když nic.
- **Soubory:** `cesta/k/souboru`
```

Do deníku nepatří nic, co si nelze ověřit. Chybějící informace jde do Otevřených otázek, nikdy do projektu jako předpokládaný fakt.

## 6. Údržba sekcí `memory.md`
| Sekce | Kdy se mění | Jak |
|---|---|---|
| Aktuální stav | Změní se fáze, prostředí nebo blokátor, na konci session vždy | Přepisuje se, nepřidává. Drž pod 80 řádky. |
| Klíčová rozhodnutí | Padne rozhodnutí, které by další session mohla přehodnotit | Jen se přidává. Zrušené se nemaže, označí se `nahrazeno D-xxx`. |
| Otevřené otázky | Vznikne otázka na uživatele | Odpovězená se smaže a odpověď jde do Klíčových rozhodnutí (nebo do deníku, je-li to drobnost). |
| Záměrně nehotové | Něco se vědomě odloží | Chrání před tím, aby to další session "opravila" jako chybu. Po vyřešení se smaže. |
| Předání další session | Konec každé session | Přepisuje se celé. |
| Deník | Každá změna | Jen se přidává. |

## 7. Formát rozhodnutí
```
### D-014 Krátký název
- Datum: 2026-10-30
- Stav: platí | nahrazeno D-0xx
- Kontext: proč se to řešilo
- Rozhodnutí: co platí
- Důsledek: co z toho plyne, co se tím vylučuje
```
Technické drobnosti se jako rozhodnutí nezapisují.

## 8. Kdy sáhnout na ostatní soubory
- `CLAUDE.md`: jen na výslovné rozhodnutí uživatele o postupu práce. Nikdy tam nejde běžící stav.
- `docs/demo/AGENTS-demo.md`: když se změní pravidla, technologie nebo konvence. Změna se zapíše i do deníku.
- `index.md`: vznikne nový systémový soubor nebo se změní fáze.
- `.claude/security/`: vzniká ve fázi F9 přes skill `web-security-memory`. Nepřepisuj ji a neslučuj s touto složkou, odkazuj se na ni z `memory.md`.

## 9. Start a konec session
**Start** (`/session-start`): přečti `index.md` → `pravidla.md` → `memory.md`. Ověř stav proti kódu. Zadání zkontroluj proti sekcím Klíčová rozhodnutí a Záměrně nehotové a kolizi řekni dřív, než něco implementuješ.

**Konec** (`/session-end`): každá změna je v deníku, Aktuální stav sedí, odpovězené otázky jsou pryč, Předání je přepsané, v paměti není tajná hodnota ani data klientů.

## 10. Ověřuj, nepředpokládej
Když paměť tvrdí něco o souboru, funkci nebo nastavení, na které se chystáš spolehnout, ověř to v projektu. Paměť popisuje stav v okamžiku zápisu. Při rozporu platí kód, paměť se opraví a oprava se zapíše do deníku.
