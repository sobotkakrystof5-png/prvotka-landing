# PRAVIDLA – jak se vede paměť tohoto projektu

Tento soubor se mění jen na výslovný pokyn zadavatele. Claude ho sám neupravuje.

## 1. Základní princip

Každá změna projektu se zapíše do `memory/memory.md` hned, ve stejném tahu. Ne na konci session a ne až po připomenutí.

## 2. Co se zapisuje

- vytvořený, přejmenovaný nebo smazaný soubor či složka,
- změna obsahu, designu nebo textů,
- technické rozhodnutí (stack, knihovna, hosting, integrace),
- cokoli, co se zkusilo a **nefungovalo**,
- cokoli, co se záměrně odložilo, a proč,
- otázky, které čekají na zadavatele.

## 3. Co se nezapisuje

- popis postupu („nejdřív jsem hledal, pak jsem…“),
- nic, co je vidět přímo v kódu,
- sebechvála a shrnutí typu „vše hotovo a funguje“,
- nic, co už stojí v `CLAUDE.md` nebo `AGENTS.md`,
- session, ve které se jen četlo a nic se nezměnilo.

## 4. Formát záznamu v changelogu

Nejnovější záznam nahoře:

```markdown
### RRRR-MM-DD – Krátký název
- **Co:** jedna nebo dvě věcné věty v minulém čase.
- **Proč:** důvod, případně „na pokyn zadavatele“, pokud jiný není.
- **Dopad:** čeho dalšího se to týká (jiné sekce, SEO, responzivita, stack, bezpečnost). „Izolované“, pokud ničeho.
- **Soubory:** `cesta/k/souboru`
```

Vždy absolutní data. Žádná vymyšlená fakta o produktu ani o zadavateli. Chybějící informace jde do „Otevřených otázek“, nikdy do projektu jako předpoklad.

## 5. Údržba ostatních sekcí memory.md

| Sekce | Kdy se mění |
|---|---|
| Aktuální stav | posune se fáze nebo se dokončí větší část. Přepisuje se, nepřidává. |
| Klíčová rozhodnutí | padne rozhodnutí, které se nebude znovu otevírat. Jen se přidává. |
| Otevřené otázky | vznikne otázka na zadavatele. Zodpovězená otázka se smaže, ne přeškrtne, a odpověď se přesune do Klíčových rozhodnutí nebo do changelogu. |
| Záměrně neudělané | něco se vědomě vynechá. Chrání to před tím, aby to další session „opravila“ jako chybu. |

## 6. Kdy sáhnout na CLAUDE.md, AGENTS.md a index.md

- `CLAUDE.md` – jen když zadavatel výslovně změní chování, tón nebo postup. Nikdy v něm není průběžný stav.
- `AGENTS.md` – když se změní stack, struktura, příkazy nebo konvence.
- `memory/index.md` – když přibude systémový soubor nebo se změní fáze.
- `memory/pravidla.md` – jen na výslovný pokyn zadavatele.

Každá změna v těchto souborech má zároveň záznam v changelogu `memory.md`. Jedno bez druhého je nedokončené.

## 7. Začátek a konec session

**Začátek:** přečti `CLAUDE.md` → `index.md` → `pravidla.md` → `memory.md` → `AGENTS.md`. Každý nový požadavek porovnej s „Klíčovými rozhodnutími“ a „Záměrně neudělaným“ dřív, než začneš. Kolizi hlas hned, ne až po implementaci.

**Konec:** zkontroluj, že každá změna je v changelogu, „Aktuální stav“ odpovídá realitě a v „Otevřených otázkách“ nezůstala žádná zodpovězená.

## 8. Ověřuj, nepředpokládej

Když `memory.md` tvrdí něco o souboru, funkci nebo nastavení, na které se chystáš spolehnout, nejdřív ověř, že to v projektu pořád platí. Paměť popisuje stav v okamžiku zápisu, ne nutně dnešní.

## 9. Napojení na celý projekt

Changelog projektu je jen jeden, a to v `memory.md`. Ostatní úložiště mají vlastní obor. `memory.md` na ně odkazuje a jejich obsah neopisuje, jinak se dvě verze rozejdou.

| Úložiště | Vlastní obsah | Co jde do `memory.md` |
|---|---|---|
| `.claude/security/` | hlavičky, CSP, výjimky, audity, incidenty | jeden řádek do changelogu s odkazem na konkrétní soubor v `.claude/security/` |
| `project-brief-prompt.md` | zadání, obsah, design | změna zadání = záznam v changelogu, případně nové Klíčové rozhodnutí |
| `AGENTS.md` | technická fakta | záznam v changelogu při každé změně |

Každý projektový skill, který změní projekt, končí zápisem do `memory.md`:

| Skill | Co zapsat |
|---|---|
| `web-project-brief` | změna zadání. Stav projektu nepíše do `CLAUDE.md`, ale sem. |
| `project-memory-system` | už proběhl. Znovu se nespouští, systém se jen rozšiřuje. |
| `web-security-setup`, `web-security-review`, `web-security-audit`, `web-security-memory` | detaily do `.claude/security/`, sem řádek do changelogu s odkazem |
| `seo-keyword-cluster-architect` | výsledná struktura URL do Klíčových rozhodnutí, routy do `AGENTS.md`, umístění mapy klíčových slov do `index.md` |
| `humanize-text-cs` | jen když se upravený text dostane do webu (změna obsahu). Text vrácený jen do chatu se nezapisuje. |
