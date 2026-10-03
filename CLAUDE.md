# CLAUDE.md – landing page produktu pro vytěžování faktur

Tento dokument je závazný pro každou session Claude Code v tomto repozitáři. Čti ho na začátku každé session, ne jen jednou. Pokud se rozchází s jednotlivým pokynem zadavatele, platí tento dokument, dokud zadavatel výslovně neřekne jinak.

---

## 0. PRVNÍ KROK KAŽDÉ SESSION – PAMĚŤ PROJEKTU

Paměť projektu se načítá automaticky přes importy níže. Pořadí: mapa → pravidla → stav → technická fakta.

@memory/index.md
@memory/pravidla.md
@memory/memory.md
@AGENTS.md

**Paměť je povinná.** Každá změna projektu se zapíše do `memory/memory.md` ve stejném tahu, ve kterém vznikla, ve formátu podle `memory/pravidla.md`. Platí to i pro práci přes jakýkoli skill v `.claude/skills/`.

---

## 1. KDO JE ZADAVATEL A JAK S NÍM MLUVIT

Zadavatel je Kryštof Sobotka, CEO a vlastník produktu. Není to junior, kterého je potřeba vodit. Chovej se jako zkušený, poctivý technický konzultant, ne jako asistent, který se chce zalíbit.

- Bez vaty a bez zbytečného nadšení. Věcně a česky.
- Když je požadavek dobrý, řekni to jednou větou a pokračuj.
- Když je požadavek špatný, zbytečný, riskantní nebo koliduje s tím, co už existuje, řekni to **hned na začátku odpovědi**, ne schované na konci.
- Stručně. Co se dá říct ve 3 větách, nemá 15.

---

## 2. POVINNÝ POSTUP PŘED KAŽDÝM KROKEM

1. **Co zadavatel chce** – jednou větou vlastními slovy.
2. **Dopad na projekt** – zkontroluj, jestli požadavek:
   - koliduje se strukturou, designem nebo obsahem v `PROJECT-BRIEF.md`,
   - koliduje s „Klíčovými rozhodnutími“ nebo „Záměrně neudělaným“ v `memory/memory.md`,
   - nerozbije něco, co funguje (formulář, demo, kalkulačku, responzivitu, SEO, CSP),
   - neodporuje zásadě „žádný šablonovitý AI vzhled“ (brief, část 0),
   - **potichu nemění stack nebo strukturu webu** (část 4). Takovou změnu oznam a rozhodnutí nech na zadavateli.
3. **Je-li problém** – řekni ho dřív, než cokoli implementuješ.
4. **Je-li vše v pořádku** – rovnou implementuj.
5. **Hned po změně** – zapiš ji do `memory/memory.md`.

---

## 3. ZÁKLADNÍ PRAVIDLA

- **Nikdy nevymýšlej fakta.** Žádná čísla, reference, loga klientů, počty firem ani časy zpracování, které nejsou v briefu. Neznámé zůstává jako viditelný `[PLACEHOLDER]`.
- **Slib o datech** („faktury neopustí vaši firmu“) jen při `site.dataStaysOnPremise === true`.
- **„Tým zkušených programátorů“** jen při `site.hasTeam === true`.
- **Cena** jen při `site.showPrice === true`, vždy s „nejsem plátce DPH“, nikdy „včetně DPH“.
- **Ukázková data** v demu, grafech a záznamu zpracování jsou vždy označená jako ukázka.
- **Pracuj po fázích** (brief, část 12). Po každé fázi se zastav a počkej na schválení.
- **Nerozhoduj potichu za zadavatele.** Při volbě mezi přístupy s různými kompromisy řekni stručně možnosti a co doporučuješ.
- **Před každým nasazením ověř:** žádné chyby v konzoli ani porušení CSP, formulář skutečně odešle e-mail, responzivita 360–1440 px, ovládání klávesnicí, `prefers-reduced-motion`.
- **Když si nejsi jistý, zeptej se hned.** Nehádej.

---

## 4. KONTEXT PROJEKTU (SHRNUTÍ)

- **Produkt:** Prvotka – aplikace na míru pro účetní kanceláře, která převádí faktury z PDF, skenů a fotek do ISDOC/ISDOCX pro účetní program.
- **Pozice:** startup pro účetní, vedený CEO Kryštofem Sobotkou. Značky za produktem: Alteno, Vizeon, ZakazIQ.
- **Cíl stránky:** jediná akce – domluvit hovor přes kontaktní formulář.
- **Stack a struktura:** v `AGENTS.md`. Jednostránková struktura je závazné rozhodnutí (`memory/memory.md` → Klíčová rozhodnutí), ne návrh k tichému přehodnocení.
- **Navbar:** logo vlevo, odkazy na sekce uprostřed, tlačítko „Kontaktní formulář“ vpravo, statický (nepřilepený) `[OVĚŘIT]`.
- **Design:** světlý, teplý krémový podklad, téměř černý text, jedna akcentní barva, serifové nadpisy, motiv účetního linkování, razítka a čísel v pozadí. Inspirace: stránka Claude Sonnet, Chase AI, Ben AI, Alteno (AI agenti a voice agenti).
- **Animace:** živé a ovladatelné podle Alteno, každá vysvětluje produkt. Signature sekce „Jak to funguje“ má nahoře workflow ve stylu n8n (PDF faktura → systém → ISDOCX → účetní program, ikony propojené spoji), pod ním interaktivní demo. Workflow běží jednou a zastaví se, import do účetního programu provádí účetní, ne systém. Detail v briefu, části 6.3 a 7.
- **Média:** fotka CEO, loga, logo produktu a 2minutové video zatím nejsou. Všude označené placeholdery s pevným `aspect-ratio`, žádné fotobanky.
- **Nejvyšší priorita:** originalita bez šablonovitého vzhledu, poctivost údajů, jasná cesta ke kontaktu.

Úplné zadání je v `PROJECT-BRIEF.md`. Když je něco nejasné, je zdrojem pravdy.

---

## 5. STAV PROJEKTU A ROZHODNUTÍ

Průběžný stav se v tomto souboru nevede. Aktuální fáze, klíčová rozhodnutí, otevřené otázky, záměrně neudělané věci a changelog jsou v `memory/memory.md`. Zapisuje se tam po každé změně, ne až na konci session.

---

## 6. CO DĚLAT, KDYŽ POKYN ZADAVATELE KOLIDUJE S TÍMTO DOKUMENTEM

Upozorni na rozpor, vysvětli ho jednou nebo dvěma větami a před nevratnou změnou se zeptej (změna stacku, struktury, design systému, nahrazení placeholderu obsahem bez podkladu, oslabení CSP). U drobných a vratných věcí stačí upozornit a pak udělat, co zadavatel chce.

---


## Security — mandatory

The full agent rules for this repository are in **`AGENTS.md`** at the root. Read it.
It applies to Claude Code exactly as it applies to any other agent, and it is not
optional context.

The security state of this project lives in **`.claude/security/`**:

- `STATE.md` — what is in place right now. **Read at the start of every session.**
- `DECISIONS.md` — why each trade-off was accepted, with review dates.
- `CSP-LOG.md` — every CSP change and the feature that required it.
- `AUDIT-LOG.md` — audits, reviews, incidents.

When you change anything security-relevant, update the matching file in the same commit.

### The three that matter most

1. **Never weaken the CSP to make a feature work.** No `unsafe-inline`/`unsafe-eval` in
   `script-src`, no wildcards, no deleting a directive to silence the console. If a
   feature will not fit the policy, raise it instead of loosening it.
2. **Never put a secret anywhere the browser can reach**, including `NEXT_PUBLIC_`
   variables. A committed secret has to be rotated, not just deleted.
3. **Never accept input without server-side validation**, and never render untrusted
   input as HTML.

### Skills

`web-security-setup` for the baseline, `web-security-review` before commits and deploys,
`web-security-audit` after deploys and monthly, `web-security-memory` at session start
and whenever recording a change.