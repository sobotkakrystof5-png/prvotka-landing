# INDEX: mapa paměti

Čti jako první v každé session. Soubor sám nic neobsahuje, jen ukazuje, kde co je a v jakém stavu projekt je.

## 1. Stav projektu (jeden řádek)
**Fáze:** F0 Příprava hotová, F1 Brána a leady (session 1 hotová, session 2 zbývá) (větev `faze/F0-priprava`). Demo žije v repozitáři webu `prvotka-landing` (D-018).
Detail vždy v `memory.md`, sekce Aktuální stav.

## 2. Soubory
| Soubor | Obsahuje | Sahej na něj, když |
|---|---|---|
| `memory/demo/index.md` (tento) | Mapa, stav na jednom řádku | Vznikne nový systémový soubor nebo se změní fáze |
| `memory/demo/pravidla.md` | Pravidla vedení paměti, formáty, start a konec session | Jen na výslovný pokyn uživatele |
| `memory/demo/memory.md` | Stav, rozhodnutí, otevřené otázky, nehotové záměrně, deník | Po každé změně projektu, ve stejném kroku |
| `CLAUDE.md` (kořen, web) | Pravidla webu, na konci blok „Demo“ s odkazy sem | Zřídka, na výslovné rozhodnutí uživatele |
| `docs/demo/AGENTS-demo.md` | Pravidla pro každého agenta, bezpečnost, design, kontext projektu | Změní se pravidla, technologie nebo konvence |
| `docs/demo/BRIEF.md` | Plný brief (design, datový model, pravidla) | Změní se zadání |
| `docs/demo/phases/` | Zadání fází F0 až F10, pořadí v `00-INDEX.md` | Změní se rozsah fáze |
| `.claude/security/` | Bezpečnostní paměť webu (už existuje, CSP v `src/proxy.ts`), demo ji v F9 rozšiřuje | Jen přes skill `web-security-memory`, nikdy ji neslučuj s touto složkou |
| `memory/` (bez `demo/`), `PROJECT-BRIEF.md`, kořenový `AGENTS.md` | Paměť, brief a technická fakta marketingového webu | Jen při práci na webu, demo do nich nezapisuje |
| `.claude/skills/` | Skilly projektu (viz tabulka níže) | Přibude nebo se změní skill |
| `.claude/commands/` | `/session-start`, `/phase`, `/session-end`, z ECC `/plan`, `/code-review`, `/build-fix`, `/test-coverage` | Změní se postup session |
| `.claude/rules/ecc/` | Pravidla ECC (common, typescript, web), AGENTS-demo.md má přednost (sekce 11, D-016) | Aktualizace ECC |
| `.claude/agents/` | 10 agentů z ECC (code-reviewer, tdd-guide, planner a další) | Aktualizace ECC |

## 3. Přednost při rozporu
- **Chování a bezpečnost:** živé zadání uživatele → `docs/demo/AGENTS-demo.md` (platí, dokud uživatel výslovně neřekne jinak) → `CLAUDE.md` → `pravidla.md`.
- **Fakta o projektu:** kód a testy → rozhodnutí v `memory.md` → `docs/demo/BRIEF.md` → stav v `memory.md`.
- Rozpor se nikdy neřeší tiše. Řekni ho a oprav slabší zdroj.

## 4. Mapa repozitáře
```
PRVOTKA DEMO/                 klon prvotka-landing (Next.js 16, web + demo)
├── CLAUDE.md, AGENTS.md      pravidla webu, blok „Demo“ odkazuje sem
├── PROJECT-BRIEF.md          brief webu
├── memory/                   paměť webu
│   └── demo/                 index.md, pravidla.md, memory.md (paměť dema)
├── docs/demo/                AGENTS-demo.md, BRIEF.md, phases/ (F0 až F10)
├── src/                      kód webu, demo pod src/app/demo a dalšími složkami
└── .claude/
    ├── commands/             session-start, phase, session-end, ECC příkazy
    ├── skills/               viz sekce 5
    ├── agents/, rules/ecc/   ECC
    └── security/             bezpečnostní paměť webu (sdílená s demem)
```

## 5. Skilly projektu (`.claude/skills/`)
Zdroj: `~/Documents/claude skills`, zkopírováno 2026-10-22.

| Skill | Kdy |
|---|---|
| `project-memory-system` | Úprava nebo obnova této paměti |
| `humanize-text-cs` | Každý český text (formuláře, hlášky, e-maily, banner, prompt asistenta) před dokončením |
| `web-security-setup` | F9: hlavičky, CSP, gitignore, DNS, `.claude/security/` |
| `web-security-review` | Před každým commitem a nasazením kódu s uživatelským vstupem, nahráváním, API |
| `web-security-audit` | F9 a po každém nasazení: kontrola živého webu, zápis do `AUDIT-LOG.md` |
| `web-security-memory` | Práce s `.claude/security/` |
| `web-externi-audit-oprava` | F9: externí audit a oprava nálezů |
| `web-predani-checklist` | F10: předání |
| `tdd-workflow`, `verification-loop`, `e2e-testing` (ECC) | Testy, ověření před hotovo (AGENTS-demo.md bod 7) |
| `api-design`, `backend-patterns`, `frontend-patterns`, `nextjs-turbopack`, `postgres-patterns` (ECC) | Návrh API, Next.js a práce s Neonem |
| `design-taste-frontend` (taste-skill, D-017) | Jen kontrola hotových obrazovek (inspektor, kritika). Nevybírá směr, barvy ani písma |
| `accessibility`, `search-first` (ECC) | Přístupnost před nasazením, hledání hotového řešení před psaním vlastního |
| `cost-aware-llm-pipeline`, `prompt-caching-strategy`, `regex-vs-llm-structured-text` (ECC) | F3, F7, F8: náklady na Claude API a vytěžení faktur |
| `vizeon-security-standard` a 14 skillů `vizeon-sec-*` | F9: model hrozeb, autorizace a tenancy, soubory, API, AI a agenti, tajemství, release gate. Bez `vizeon-sec-supabase`, projekt jede na Neonu (D-005). |

## 6. Start session
1. `/session-start`: načte `index.md` → `pravidla.md` → `memory.md`, ověří stav proti kódu (`git status`, `git log`) a navrhne krok.
2. Před prací zkontroluj zadání proti sekcím Klíčová rozhodnutí a Záměrně nehotové v `memory.md`. Kolizi řekni dřív, než něco uděláš.
3. Pracuj. Každou změnu zapiš do `memory.md` ve stejném kroku.
4. `/session-end`: ověření, úklid, návrh zprávy commitu.
