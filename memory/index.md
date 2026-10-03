# INDEX – mapa paměti

Čti jako první v každé session, ještě než začneš pracovat. Tento soubor nenese obsah, jen říká, kde co najdeš a v jaké fázi projekt je.

## 1. Stav projektu (jeden řádek)

**Fáze:** Fáze 1–8 implementované lokálně (2026-10-02), čeká se na schválení designu (Fáze 2, `/styleguide`) a celku. Fáze 9 (nasazení) blokují chybějící podklady.

Podrobnosti jsou vždy v `memory/memory.md` → „Aktuální stav“.

## 2. Systémové soubory

| Soubor | Obsahuje | Kdy na něj sáhnout |
|---|---|---|
| `memory/index.md` (tento) | mapu a stav na jeden řádek | přibude systémový soubor nebo složka, změní se fáze |
| `memory/pravidla.md` | pravidla, jak se paměť vede | jen na výslovný pokyn zadavatele |
| `memory/memory.md` | stav, rozhodnutí, otevřené otázky, changelog | po každé změně projektu, ve stejném tahu |
| `CLAUDE.md` | chování, postup, obsahový kontext | zřídka, jen když zadavatel změní způsob práce |
| `AGENTS.md` | technická fakta: stack, struktura, příkazy, konvence, skills | změní se stack, struktura, příkazy nebo konvence |
| `PROJECT-BRIEF.md` | úplné zadání webu, zdroj pravdy pro obsah a design | změní se zadání |
| `.claude/security/` | bezpečnostní stav, výjimky, CSP, audity, `security-check.sh` | každá bezpečnostní změna, vede ji `web-security-memory` |
| `src/config/site.ts` | přepínače a údaje o produktu (`null` = nerozhodnuto) | zadavatel rozhodne nebo dodá údaj |
| `src/content/cs.ts` | všechny texty webu | změna textů |
| `src/assets/fonts/FONTS.md` | původ a licence písem | změna písem |
| `.claude/skills/` | 9 projektových skills, přehled v `AGENTS.md` | přidání nebo úprava skillu |

## 3. Přednost při rozporu

Živý pokyn zadavatele → `CLAUDE.md` → `memory/pravidla.md` → `memory/memory.md` → `AGENTS.md`.

Rozpor se vždy nahlásí zadavateli. Nikdy se neřeší potichu.

## 4. Jak dokumenty souvisí

```
                    CLAUDE.md  (jak pracovat)
                        │  načítá přes @import
     ┌──────────────┬───┴──────────┬───────────────┐
  index.md     pravidla.md     memory.md        AGENTS.md
 (kde co je)  (jak zapisovat) (co se stalo)  (z čeho projekt je)
                                   │                │
                          odkazuje │                │ popisuje
                                   ▼                ▼
                   .claude/security/          .claude/skills/
                   PROJECT-BRIEF.md
```

`memory.md` je jediný changelog celého projektu. Ostatní úložiště (bezpečnost, zadání) mají vlastní obor a `memory.md` na ně jen odkazuje, detaily neopisuje.

## 5. Mapa projektu

```
Faktura - systems/
├── CLAUDE.md                  chování, postup, kontext obsahu
├── AGENTS.md                  technická fakta, skills
├── PROJECT-BRIEF.md           zadání webu (verze 1.1)
├── memory/
│   ├── index.md               tento soubor
│   ├── pravidla.md            pravidla paměti
│   └── memory.md              živý stav a changelog
├── .claude/
│   ├── skills/                projektové skills
│   └── security/              bezpečnostní stav (STATE, DECISIONS, CSP-LOG, AUDIT-LOG)
├── .github/workflows/         CI (kvalita, audit, gitleaks, hlavičky)
├── public/.well-known/        security.txt
└── src/                       kód webu (Next.js 16), strom v AGENTS.md, část 4
```

## 6. Rychlý start session

1. Claude Code načte paměť automaticky přes importy v `CLAUDE.md` (část 0). Jiný nástroj čte ručně v pořadí `CLAUDE.md` → `memory/index.md` → `memory/pravidla.md` → `memory/memory.md` → `AGENTS.md`.
2. V `memory.md` zjisti, kde práce skončila a co je otevřené.
3. Pokud existuje `.claude/security/STATE.md`, přečti i ten.
4. Pracuj.
5. Každou změnu zapiš do `memory.md` ve stejném tahu, ve kterém vznikla.
