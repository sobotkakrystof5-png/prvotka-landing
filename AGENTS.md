<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md – technický kontext projektu

Kontext pro libovolného AI agenta (Claude Code, Cursor, Codex, Copilot, Antigravity). Obsahuje fakta o projektu a hranice, které platí pro každý nástroj. Tón a způsob komunikace se zadavatelem jsou v `CLAUDE.md`, živý stav v `memory/memory.md`.

**Než začneš:** přečti `memory/index.md` → `memory/pravidla.md` → `memory/memory.md` → `.claude/security/STATE.md`. Claude Code je načte sám přes importy v `CLAUDE.md` (kromě STATE.md), ostatní nástroje ručně. Každou změnu projektu zapiš do `memory/memory.md` ve stejném tahu.

Blok „This is NOT the Next.js you know“ nahoře vkládá `next dev`. Nemazat, jinak se vrátí. Projekt běží na Next.js 16: dokumentace odpovídající verzi je v `node_modules/next/dist/docs/`.

---

## 1. Přehled

| | |
|---|---|
| **Produkt** | Prvotka – aplikace na míru pro účetní kanceláře. Převádí faktury z PDF, skenů a fotek do ISDOC/ISDOCX pro účetní program. |
| **Co se staví** | Marketingová landing page produktu, ne aplikace samotná. |
| **Cílová skupina** | Účetní kanceláře v ČR. |
| **Jediná konverze** | Domluvit hovor přes kontaktní formulář. Každá sekce k němu vede. |
| **Provozovatel** | Kryštof Sobotka, CEO, OSVČ, neplátce DPH. Značky za produktem: Alteno, Vizeon, ZakazIQ. |
| **Typ webu** | Jednostránková landing page s kotvami + právní stránky + 404. Závazné rozhodnutí. |
| **Jazyk** | Čeština (obsah, dokumentace, commity). |
| **Doména** | `[PLACEHOLDER]` |
| **Stav** | Fáze 1–8 implementované lokálně, čeká na schválení (hlavně design ve Fázi 2). Nenasazeno. Detail v `memory/memory.md`. |
| **Zadání** | `PROJECT-BRIEF.md` (verze 1.1, 2026-10-02). Zdroj pravdy pro obsah a design. |

---

## 2. Příkazy

| Účel | Příkaz |
|---|---|
| Instalace | `npm ci` (správce balíčků npm, lockfile se commituje) |
| Vývojový server | `npm run dev` |
| Build | `npm run build` (musí projít bez chyb i varování) |
| Produkční server lokálně | `npm run start` |
| Lint | `npm run lint` |
| Typová kontrola | `npm run typecheck` (`next typegen && tsc --noEmit`, typegen kvůli globálním typům `LayoutProps`/`PageProps` v čistém prostředí) |
| Testy | `npm test` (Vitest: výpočet úspor, schéma formuláře, Server Action, časová osa workflow) |
| Bezpečnost závislostí | `npm audit --omit=dev --audit-level=high` |
| Kontrola živého webu | `.claude/security/security-check.sh <URL>` |

Před odevzdáním změny musí projít lint, typová kontrola, testy a build.

Lokální `next start` běží přes http. `upgrade-insecure-requests` se proto posílá jen u HTTPS požadavků (`.claude/security/DECISIONS.md` #004).

---

## 3. Stack

| Vrstva | Technologie | Poznámka |
|---|---|---|
| Framework | Next.js 16.3 (App Router, Turbopack) | `src/proxy.ts` místo `middleware.ts` |
| UI | React 19 + TypeScript | `strict: true` |
| Styly | Tailwind CSS 4 | tokeny v `src/app/globals.css` (`:root` + `@theme inline`), žádný `tailwind.config` |
| Komponenty | shadcn/ui (Radix, preset nova) | jen jako kostra, přestylované přes tokeny. Utilita `cn` z balíčku `cn` (od shadcn) |
| Ikony | `lucide-react`, strokeWidth 1.5 | dokumenty PDF/ISDOCX jsou vlastní SVG (`DocIcons.tsx`), logo a znak v `LogoMark.tsx` |
| Animace | Motion (`motion/react`), `LazyMotion` s asynchronně načtenými funkcemi | jen komponenty `m.*`, `prefers-reduced-motion` přes `usePrefersReducedMotion` |
| Formulář | React Hook Form + Zod 4 + `@hookform/resolvers` | stejné schéma na klientu i serveru, Zod v režimu `jitless` (CSP) |
| E-mail | Resend | jen v Server Action `src/app/actions/contact.ts` |
| Písma | `next/font/local` | Newsreader (nadpisy), Manrope (text), JetBrains Mono (čísla). Podmnožiny v `src/assets/fonts/`, viz `FONTS.md` |
| Testy | Vitest 5 | `src/**/*.test.ts` |
| Hosting | Vercel Hobby | žádná funkce nesmí záviset na placeném tarifu |

Změna stacku je rozhodnutí zadavatele. Žádná knihovna navíc bez jeho souhlasu.

---

## 4. Struktura repozitáře

```
Faktura - systems/
├── AGENTS.md, CLAUDE.md, PROJECT-BRIEF.md
├── memory/                         paměť projektu (index, pravidla, memory)
├── .claude/
│   ├── skills/                     9 projektových skills (část 10)
│   └── security/                   STATE, DECISIONS, CSP-LOG, AUDIT-LOG, security-check.sh
├── .github/workflows/security.yml  lint, typy, testy, build, audit, gitleaks, hlavičky
├── .env.example                    vzor proměnných prostředí
├── public/.well-known/security.txt
├── public/brands/                  loga Alteno, Vizeon, ZakazIQ (SVG převzatá z webů značek)
└── src/
    ├── proxy.ts                    CSP s nonce
    ├── app/
    │   ├── layout.tsx              písma, metadata, navbar, patička, connection() kvůli nonce
    │   ├── page.tsx                landing page: pořadí sekcí + JSON-LD
    │   ├── actions/contact.ts      Server Action formuláře (+ test)
    │   ├── ochrana-osobnich-udaju/, obchodni-podminky/   placeholder, noindex
    │   ├── styleguide/             interní, noindex, před nasazením odstranit
    │   ├── not-found.tsx, opengraph-image.tsx, sitemap.ts, robots.ts, icon.svg
    │   └── globals.css             design tokeny a motivy
    ├── config/site.ts              přepínače a údaje (null = nerozhodnuto)
    ├── content/cs.ts               všechny texty
    ├── components/
    │   ├── layout/                 Section (okraj účetní knihy + číslo sekce), header, MobileNav, footer, ContactLink
    │   ├── sections/               jedna sekce = jeden soubor (+ jejich interaktivní části)
    │   ├── demo/                   Workflow (časová osa ve workflowTimeline.ts), InvoiceDemo
    │   ├── motifs/                 Mark, Stamp, MarginFigures, Placeholder, RichText, SampleBadge, DocIcons, LogoMark
    │   ├── motion/                 MotionProvider
    │   └── ui/                     shadcn/ui přestylované
    ├── lib/                        savings, contactSchema, escapeHtml, jsonLd, sections, navigate, typography
    └── assets/fonts/               podmnožiny písem + písma pro OG obrázek
    └── assets/brand/               logo a znak jako samostatné SVG (tisk, dokumenty)
```

---

## 5. Obsah stránky

Pořadí sekcí (`src/lib/sections.ts`, závazné, změněno 2026-10-03): Úvod, Proč to řešit, Kalkulačka, Jak to funguje, Co vám to přinese, Na míru, Případová studie (jen s daty), Kdo za tím stojí, Časté dotazy, Kontakt. Čísla „(01)“ až „(09)“ se počítají z viditelných sekcí. Sekce 02 a 03 končí větou s odkazem na další sekci.

- **Proč to řešit** (brief 6.2): příběh (rozjezd Alteno) → ruční přepis s překlepem (`ManualRetype`) → „Proto vznikla Prvotka“ → okno aplikace ve stylu Docker Desktop (`AppWindow`, časová osa `appWindowTimeline.ts`). Obě ukázky běží jednou přes `src/lib/useOneShotTimeline.ts`, do 5 s, s „Přehrát znovu“. Žádná čísla.

- **Navbar:** logo vlevo, odkazy uprostřed (Úspora, Jak to funguje, Na míru, O nás, Časté dotazy, Kontakt), „Kontaktní formulář“ vpravo (posun na `#kontakt` + fokus na první pole). Statický `[OVĚŘIT]`. Pod 1024 px Sheet zprava.
- **Workflow** (brief 6.3): PDF → systém → ISDOCX → účetní program, jeden běh při vstupu do viewportu, pauza a „Spustit znovu“. Import provádí účetní.
- **Demo:** pět faktur, stavový automat `idle → reading → checking → done | warning`.
- **Kalkulačka:** výpočet v `src/lib/savings.ts`. Hlavní vstup je počet faktur, ostatní jsou „Vaše předpoklady“. Výstup jako výkaz: ruční přepis dnes, kontrola s aplikací, rozdíl (h/měsíc, Kč/měsíc, Kč/rok) + přepočet na osmihodinové pracovní dny. Při `showPrice: false` bez investice, návratnosti a srovnání s poplatkem za doklad.
- **FAQ:** položky s `published: false` se nevykreslí ani v JSON-LD.
- **Texty:** jen v `src/content/cs.ts`. `*slovo*` = zvýraznění `<Mark>`, `[NĚCO]` = viditelný placeholder. Typografické pevné mezery doplňuje `deepTypo`.

### Přepínače v `src/config/site.ts`

`null` znamená „nerozhodnuto“ a chová se jako `false`. Text závislý na přepínači se renderuje podmíněně, ne skrytím přes CSS.

| Přepínač | Co řídí | Teď |
|---|---|---|
| `showPrice` | cena, řádek nákladů, návratnost, srovnání s poplatkem za doklad, cena v JSON-LD | `false` |
| `dataStaysOnPremise` | slib o datech (bod v „Na míru“, FAQ) | `null` |
| `hasTeam` | věta o týmu programátorů | `null` |
| `caseStudy` | sekce případové studie | `null` |
| `videoSrc` | odkaz na video v heru, přehrávač | `null` |
| `monthlyFee` | správa v ceně a návratnosti | `null` |
| `responseTime`, `introCallLength` | „Co můžete čekat“ v kontaktu | `null` |

---

## 6. Design

- Tokeny v `src/app/globals.css`. Barvy z briefu + `warn-ink`, `field-border`, `sheet`, `warn-soft` (návrh Fáze 2, ke schválení na `/styleguide`).
- Motivy: účetní linkování (`.ledger`), okraj účetní knihy s dvojitou linkou a číslem sekce (`Section`), razítko (max 3× na stránce), `<Mark>`, čísla v okraji (CSS scroll-driven parallax max 8 px).
- Jeden rádius pro celý web (3 px). Výjimka: kulaté úchyty posuvníku a porty ve workflow.
- Světlý režim. Tmavý jen po schválení zadavatelem.
- **Žádný šablonovitý AI vzhled:** žádné fialovomodré gradienty, glassmorphism, mřížky stejných karet, emoji, nepřestylované shadcn/ui.
- Média: fotka CEO a video zatím nejsou (loga značek Alteno, Vizeon, ZakazIQ jsou v `public/brands/`), místo nich označené placeholdery s pevným `aspect-ratio`. Žádné fotobanky.

---

## 7. Konvence kódu

- TypeScript `strict`, žádné `any` bez komentáře proč.
- Server Components jako výchozí. `"use client"` jen u interaktivních částí.
- Komponenty v `PascalCase.tsx`, utility v `camelCase.ts`, routy a složky v `kebab-case`. Výjimka: `src/components/ui/` drží názvy shadcn/ui.
- Texty jen v `src/content/cs.ts`, proměnná data jen v `src/config/site.ts`.
- Neznámý údaj je viditelný `[PLACEHOLDER]`, nikdy domyšlená hodnota.
- Ukázková data mají vždy štítek „Ukázka“ (`SampleBadge`).
- Animace: jen `transform` a `opacity`, vždy statická varianta pro `prefers-reduced-motion`. Pro rozhodnutí v renderu používej `usePrefersReducedMotion` (bezpečné pro hydrataci), ne `useReducedMotion` z Motion.
- Žádné `window.addEventListener('scroll')`. Viewport přes IntersectionObserver nebo Motion `useInView`.
- Sémantické HTML, jeden `<h1>`, kotvy sekcí s `id` v kebab-case, nadpis sekce `#{id}-title`.

---

## 8. Kvalita a definice hotového

Změna je hotová, když:

- [ ] lint, typová kontrola, testy a build projdou bez chyb a varování,
- [ ] konzole prohlížeče je čistá, žádné porušení CSP (Chrome i Safari),
- [ ] layout funguje na 360, 768, 1024 a 1440 px bez vodorovného scrollu,
- [ ] vše se dá ovládat klávesnicí, fokus je viditelný,
- [ ] animace respektují `prefers-reduced-motion`,
- [ ] formulář (pokud se ho změna týká) skutečně odešle e-mail,
- [ ] změna je zapsaná v `memory/memory.md`.

Před nasazením navíc kontrolní seznam v části 9.

---

## 9. Bezpečnost

Bezpečnostní stav žije v `.claude/security/` (`STATE.md`, `DECISIONS.md`, `CSP-LOG.md`, `AUDIT-LOG.md`). Čti `STATE.md` na začátku každé session a bezpečnostní změny zapisuj do příslušného souboru ve stejném commitu.

### Nepřekročitelná pravidla

1. **CSP se nikdy neoslabuje kvůli funkci.** Žádné `unsafe-inline` ani `unsafe-eval` ve `script-src`, žádné wildcardy, žádné mazání direktivy kvůli chybě v konzoli. CSP s nonce je v `src/proxy.ts`. Když se funkce do politiky nevejde, nahlas to.
2. **Žádné tajemství v kódu dostupném prohlížeči.** Klíče jen na serveru, nikdy s prefixem `NEXT_PUBLIC_`. Commitnuté tajemství se musí rotovat, smazání nestačí.
3. **Každý vstup se validuje na serveru** Zod schématem s limitem délky každého pole. Validace na klientu je jen UX.
4. **Nedůvěryhodný vstup se nikdy nerenderuje jako HTML.** `dangerouslySetInnerHTML` jen pro JSON-LD z vlastních dat (escapované `<`). Obsah e-mailu z formuláře se escapuje.
5. **Formulář je chráněný:** honeypot, minimální doba vyplnění 3 s, odeslání jen ze serveru. Rate limit na IP chybí, řeší se ve Fázi 6 (`DECISIONS.md` #005). Captcha zatím ne.
6. **Žádný skript třetí strany bez souhlasu zadavatele.** Pokud přibude: SRI hash, záznam v CSP a v `CSP-LOG.md`.

### Výchozí nastavení

- `target="_blank"` vždy s `rel="noopener noreferrer"`.
- Žádné inline `<script>` bez nonce ani `onclick=` atributy.
- Návštěvník vidí obecnou chybu, detaily (bez osobních údajů) jdou do logu.
- Žádné source mapy ani `console.log` interních dat v produkci.
- Lockfile se commituje.
- HSTS zatím bez `preload`.
- `style-src 'unsafe-inline'` je vědomá výjimka (`DECISIONS.md` #003), nikdy ne ve `script-src`.
- Všechny stránky se renderují dynamicky (`connection()` v root layoutu), jinak by skripty neměly nonce.

### Proměnné prostředí

| Proměnná | Kde | Poznámka |
|---|---|---|
| `RESEND_API_KEY` | server | tajné |
| `CONTACT_TO_EMAIL` | server | e-mail pro poptávky `[PLACEHOLDER]` |
| `CONTACT_FROM_EMAIL` | server | odesílatel z ověřené domény v Resend `[PLACEHOLDER]` |

Vzor je v `.env.example`. Skutečné `.env*` soubory se necommitují.

### Před každým nasazením

- [ ] audit závislostí bez nálezů úrovně high
- [ ] v diffu není nové tajemství
- [ ] nové vstupy validované na serveru
- [ ] CSP pokrývá vše přidané, konzole čistá
- [ ] `.claude/security/` aktualizované
- [ ] po nasazení `security-check.sh <URL>` a výsledek do `AUDIT-LOG.md`

---

## 10. Projektové skills

Všechny jsou v `.claude/skills/`. Skill, který změní projekt, končí zápisem do `memory/memory.md` (`memory/pravidla.md`, část 9).

| Skill | Kdy |
|---|---|
| `web-project-brief` | vznik nebo zásadní změna zadání webu |
| `project-memory-system` | paměť už běží, jen při rozšíření systému |
| `web-security-setup` | základní zabezpečení: hlavičky, CSP, CI, `.claude/security/` |
| `web-security-review` | formulář, API route, env proměnné; před commitem a deployem |
| `web-security-audit` | po nasazení a jednou měsíčně |
| `web-security-memory` | začátek session, zápis bezpečnostní změny |
| `seo-keyword-cluster-architect` | URL struktura podle naměřených klíčových slov |
| `humanize-text-cs` | české texty pro web, aby nezněly jako od AI |
| `design-taste-frontend` | návrh a kontrola sekcí proti šablonovitému vzhledu (taste-skill, MIT). Podřízený zadání a částem 6, 9 a 12 tohoto souboru, viz níže |

**`design-taste-frontend` – co z něj neplatí.** Skill je psaný obecně a v několika bodech jde proti zadání. Přednost má vždy zadání:

- Krémový podklad a serifové nadpisy jsou daná zadáním (skill je jinak zakazuje jako „AI default“, zadání je výslovná výjimka). Ze skillu se převzalo jen to, že serif není Fraunces ani Instrument Serif.
- Světlý režim podle zadání. Tmavý režim jen po schválení zadavatelem.
- Žádné obrázky z picsum.photos ani fotobank, žádná loga přes Simple Icons nebo CDN, žádné vymyšlené značky, loga ani „organická“ čísla. Platí placeholdery s `aspect-ratio`.
- GSAP a jiné knihovny mimo stack jen po schválení (část 3). Animace přes Motion nebo CSS.
- Ikony: `lucide-react` podle zadání (skill preferuje Phosphor).
- Číslování sekcí „(02)“ je výslovně v zadání. Je řešené jako číslo řádku v okraji účetní knihy, ne jako eyebrow nad každým nadpisem.

---

## 11. Git

- Vlastní repozitář ve složce projektu (`main`). GitHub repo a push až se souhlasem zadavatele.
- Commit zprávy česky, krátce, co se změnilo (např. `přidání sekce FAQ`).
- Necommituj `.env*` (kromě `.env.example`), `node_modules/`, `.next/`, `.vercel/`.

---

## 12. Hranice

**Vždy**
- Čti paměť před prací a zapiš každou změnu do `memory/memory.md` ve stejném tahu.
- Neznámé údaje nechávej jako `[PLACEHOLDER]`.
- Pracuj po fázích a po každé se zastav ke schválení.
- Ověř definici hotového (část 8).

**Nejdřív se zeptej**
- Změna stacku, struktury webu, design systému nebo navigace.
- Nová závislost nebo skript třetí strany.
- Nahrazení placeholderu obsahem, pro který není podklad.
- Zapnutí kteréhokoli přepínače v `site`.
- Commit, push, nasazení, změna DNS nebo hostingu.
- Úprava `memory/pravidla.md` nebo `CLAUDE.md`.

**Nikdy**
- Nevymýšlej čísla, reference, loga klientů, počty firem ani časy zpracování.
- Neslibuj, že data neopustí firmu, dokud `site.dataStaysOnPremise` není `true`.
- Nepiš „včetně DPH“.
- Neoslabuj CSP a nedávej tajemství do klientského kódu.
- Nezobrazuj případovou studii bez dat a souhlasu klienta.
- Nepoužívej fotobanky.

---

## 13. Údržba tohoto souboru

Aktualizuj při změně stacku, struktury, příkazů, konvencí nebo rout. Každá změna má záznam v changelogu `memory/memory.md` ve stejném tahu. Průběžný stav sem nepatří.
