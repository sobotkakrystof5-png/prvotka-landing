# MEMORY: živý stav

Co se stalo, v jakém jsme stavu a proč. Pravidla vedení: `pravidla.md`.

## Aktuální stav
Poslední aktualizace: 2026-10-22 (Neon připojený, migrace F0 a F1 proběhly)

- **Aktuální fáze:** F0 Příprava hotová, F1 Brána a leady rozpracovaná. F1 začala na pokyn uživatele před uzavřením F0.
- **Další krok:** F1 session 2 (formulář, Turnstile, limit pokusů, e-maily, stavy brány). Pro ověření end-to-end: odpovědi na Q-004 a Q-009, klíče Turnstile, `SESSION_SECRET` a ostatní proměnné dema v `.env.local`.
- **Větev:** `faze/F0-priprava` v klonu `sobotkakrystof5-png/prvotka-landing` (D-018)

### Fáze
Stavy: `nezačato`, `rozpracováno`, `hotovo`, `blokováno`.

| Fáze | Název | Stav | Poznámka |
|---|---|---|---|
| F0 | Příprava | hotovo | migrace proti Neonu proběhla 2026-10-22 |
| F1 | Brána a leady | rozpracováno | session 1 hotová (schéma, normalizace, registrace, session), session 2 zbývá |
| F2 | Plocha, složky, nahrání | nezačato | |
| F3 | Vytěžení a kontrola | nezačato | |
| F4 | Detail faktury (pravá část) | nezačato | |
| F5 | Export ISDOC/ISDOCX | nezačato | blokující test v POHODĚ |
| F6 | Limit a vyčerpání | nezačato | |
| F7 | AI asistent | nezačato | |
| F8 | Mazání a ochrana nákladů | nezačato | |
| F9 | Zabezpečení | nezačato | skilly jsou v `.claude/skills` (D-015) |
| F10 | Dokončení a předání | nezačato | skill `web-predani-checklist` je v `.claude/skills` (D-015) |

### Prostředí a přístupy (jen stav, žádné hodnoty)
- Neon databáze pro demo: připojená (hostitel `ep-young-shadow-…`, eu-central-1), migrace 0000 a 0001 proběhly, značka `prvotka-demo`
- `.env.local`: jen `DATABASE_URL`, `DEMO_DATABASE_HOST`, `DEMO_ENABLED=false`. Ostatní proměnné dema chybí. Ve Vercelu nic.
- Úložiště souborů: nerozhodnuto (výchozí R2, viz D-006)
- Resend, ověřená doména a odesílací adresa: nenastaveno
- Cloudflare Turnstile: nenastaveno
- Claude API klíč a model pro vytěžení: nenastaveno
- Testovací firma v POHODĚ: nezajištěno
- Vercel plán: Hobby (podle `AGENTS.md` webu, část 3), nasazeno na prvotka.cz
- GitHub repo `prvotka-landing`: veřejné, uživatel ho přepne na soukromé (D-018)
- Bezpečnostní paměť `.claude/security/`: existuje z webu, CSP běží v `src/proxy.ts`

### Blokátory
- žádné pro F0. F1 session 2 čeká na Q-004, Q-009 a klíče Turnstile.

### Předání další session
F0 je naprogramovaná na větvi `faze/F0-priprava`, nic není commitnuté. `typecheck`, `lint`, `test` (66 testů, z toho 25 dema) a `test:e2e` (6 testů, desktop a mobil, produkční build) prošly. Neověřený zůstal jen bod „migrace jde spustit proti demo databázi“, chybí Neon větev.

F1 session 1 (bez databáze): migrace `drizzle/0001_f1_gate.sql` (leads, workspaces, access_tokens, sessions, events), `src/lib/demo/gate/` (normalizace e-mailu, jednorázové domény, schéma brány, logika registrace nad `RegistrationStore`, implementace nad Neonem `dbStore.ts`), `src/lib/demo/auth/` (tokeny, podepsaná cookie, session), server akce `src/app/demo/actions.ts` (`registerDemo` pro `useActionState`), osobní odkaz `src/app/demo/odkaz/route.ts`, `/demo/app` jen se session. 118 unit testů a 8 e2e prošlo. Migrace proběhla proti Neonu 2026-10-22, kód registrace (`dbStore.ts`) proti skutečné databázi zatím neběžel.
Session 2 zbývá: formulář na `/demo` (pole, honeypot `website`, skryté `ref` z `?ref=`, Turnstile, věta z BRIEF bodu 12), limit pokusů (Q-009), oznámení Kryštofovi s opakováním při selhání (rozhodnout a zapsat), e-mail klientovi s odkazem `/demo/odkaz?t=` (Q-004), zobrazení stavů `?stav=vyprselo|neplatny-odkaz|chyba` a výsledků akce (`link-sent`, `expired`, `error`) na bráně, texty přes `humanize-text-cs`. Akce teď u známého e-mailu vrací `link-sent`, ale e-mail ještě neposílá.

Fakta o repu webu (pro další fáze):
- Next 16.4.2 (App Router, Turbopack, `src/proxy.ts` místo middleware), React 19.2, Tailwind 4 (`@theme inline` v `globals.css`), shadcn/ui přestylované v `src/components/ui/`, Zod 4, react-hook-form, Motion (`LazyMotion strict`, jen `m.*`), Resend, Vitest. Vercel Hobby.
- Tokeny v `src/app/globals.css` odpovídají briefu, navíc `--warn-ink`, `--rule-faint`, `--accent-strong`, `--figure`, `--paper-shadow`. Utility `.wrap`, `.type-display/h2/h3/lead/label`, `.tabular`, `.ledger` (`--ledger-step`), `.ledger-margin`, `.caret`. Okrajový sloupec `--margin-col` (8,5 rem od lg).
- Písma lokálně přes `next/font/local` (`--font-newsreader`, `--font-manrope`, `--font-jetbrains`).
- Komponenty k převzetí: `Button`/`buttonVariants`, `Stamp` (razítko ok/warn), `Mark`, `SampleBadge`, `DocIcons`, `LogoFull`, `InvoiceDemo` (stavový automat ukázky).
- CSP s nonce a `strict-dynamic` v `src/proxy.ts`, `style-src 'unsafe-inline'` je zdokumentovaná výjimka webu. Kvůli nonce `connection()` v kořenovém layoutu, všechny stránky dynamické. Turnstile a úložiště bude potřeba přidat do CSP (F9, `.claude/security/CSP-LOG.md`).
- Zod v prohlížeči potřebuje `z.config({ jitless: true })` (kvůli CSP), viz `src/lib/contactSchema.ts`.
- Konvence webu: texty v `src/content/`, `PascalCase.tsx`, `camelCase.ts`, Server Components jako výchozí.
- Na portu 3000 běžel během session cizí `next dev` z této složky, e2e proto používají vlastní build na portu 3100.

Rozpracováno / pozor: Q-010 (repo je veřejné). Upgrade Next (D-021) čeká na commit a nasazení.

## Klíčová rozhodnutí
Jen se přidává. Formát v `pravidla.md`, bod 7. Zrušené rozhodnutí se označí `nahrazeno D-xxx`.

### D-001 Demo je skutečná aplikace s limitem 4 faktur
- Datum: 2026-10-22
- Stav: platí
- Kontext: klient si má vyzkoušet opravdový produkt, ne simulaci nad hotovými daty.
- Rozhodnutí: každá registrace dostane pracovní plochu s kvótou 4 faktur. Zpracování je skutečné (Claude API).
- Důsledek: je potřeba kontrola nákladů (denní strop, limity), mazání dat a ochrana cizích dokumentů.

### D-002 Hromadné nahrání 30 PDF, zpracují se jen 4 vybrané
- Datum: 2026-10-22
- Stav: platí
- Kontext: klient čeká, že se zpracuje celá dávka, ale cena a riziko to neumožňují.
- Rozhodnutí: klient vybere v prohlížeči až 30 souborů a označí až 4 ke zpracování. Zbylé se na server nenahrávají a zobrazí se jako "V plné verzi se zpracují všechny".
- Důsledek: neodeslané soubory nestojí úložiště ani vytěžení a klient je nemá u nás.

### D-003 Registrace e-mailem a telefonem, e-mail jen jednou
- Datum: 2026-10-22
- Stav: platí
- Kontext: Kryštof chce kontakt na klienta a jedinou zkoušku na e-mail. Newsletter se nedělá.
- Rozhodnutí: e-mail se sjednotí (malá písmena, ořez, odstranění "+něco", u Gmailu i teček) a je jedinečný. Jednorázové domény se blokují. Telefon se nehlídá, jen volná kontrola formátu.
- Důsledek: obejít jde novým e-mailem, což je pro demo s následným voláním přijatelné.

### D-004 Mazání: 24 hodin po 4. faktuře, pojistka 14 dní, lead zůstává
- Datum: 2026-10-22
- Stav: platí
- Kontext: faktury obsahují cizí data, nemají se držet déle, než je nutné.
- Rozhodnutí: po vyčerpání 4. faktury 24 hodin na dokončení, pak smazat soubory a data ploch. Pojistka: 14 dní od poslední aktivity. Zůstává lead a statistika použití.
- Důsledek: doba uchování leadu je otevřená otázka (Q-003). Mazací úloha musí být idempotentní.

### D-005 Neon Postgres + Drizzle místo Supabase
- Datum: 2026-10-22
- Stav: platí
- Kontext: Kryštof používá Neon.
- Rozhodnutí: Neon serverless driver, Drizzle pro migrace a typy, samostatná větev nebo projekt pro demo.
- Důsledek: žádná pravidla na úrovni řádků, izolace dat je jen v kódu (`workspace_id` vynucený společnou funkcí). Žádný hotový storage ani auth.

### D-006 Úložiště souborů zdarma, za rozhraním `StorageAdapter`
- Datum: 2026-10-22
- Stav: platí (konkrétní dodavatel čeká na Q-001)
- Kontext: Kryštof za úložiště nechce platit. Ověřeno 2026-10-22: R2 má 10 GB zdarma, Vercel Blob na Hobby 1 GB a 2 000 zápisů, po překročení se zablokuje na 30 dní.
- Rozhodnutí: výchozí Cloudflare R2, vyměnitelné za Vercel Blob přes rozhraní. Soubory jen přes podepsané odkazy. Fotky se zmenšují v prohlížeči, limit 10 MB na soubor.
- Důsledek: Hobby plán Vercelu je určen pro nekomerční použití, ověřit podmínky (Q-001).

### D-007 Vytěžení přes Claude API, kontrola a ISDOC deterministickým kódem
- Datum: 2026-10-22
- Stav: platí
- Kontext: AI je dobrá na čtení, ale součty, DPH a export musí být ověřitelné.
- Rozhodnutí: AI vrací strukturovaná data (Zod schéma). Kontroly a generátor ISDOC jsou běžný kód s testy a validací proti XSD.
- Důsledek: model se bere z `EXTRACTION_MODEL`, volba se ověřuje na syntetických fakturách.

### D-008 AI asistent jen navrhuje, člověk potvrdí
- Datum: 2026-10-22
- Stav: platí
- Kontext: účetní nesmí přijít o kontrolu nad údaji.
- Rozhodnutí: asistent vrací `ChangeSet`, UI ukáže rozdíl před a po, změna se použije až po potvrzení a zapíše do auditu.
- Důsledek: asistent nikdy nezapisuje do databáze sám.

### D-009 Přihlášení bez hesel
- Datum: 2026-10-22
- Stav: platí
- Kontext: demo nemá účty a hesla.
- Rozhodnutí: osobní odkaz s náhodným tokenem (v databázi jen hash) a podepsaná httpOnly cookie. Opakovaný e-mail dostane nový odkaz, plochu hned neotevírá.
- Důsledek: cizí e-mail neotevře cizí faktury.

### D-010 Dvoudílná plocha a design téměř identický s prvotka.cz
- Datum: 2026-10-22
- Stav: platí
- Kontext: demo má působit jako stejný produkt jako ukázka na webu.
- Rozhodnutí: vlevo vstup (složky, nahrání, seznam), vpravo výsledek vybrané faktury (záložky Údaje, ISDOC, Originál). Tokeny a komponenty z kódu webu. Jen světlý režim.
- Důsledek: žádný samostatný celoobrazovkový detail. Mobil skládá části za sebe.

### D-011 Oznámení e-mailem, bez newsletteru
- Datum: 2026-10-22
- Stav: platí
- Kontext: souhlas s marketingem se nechce vynucovat za přístup do dema.
- Rozhodnutí: Kryštofovi přijde e-mail (e-mail, telefon, `ref`, čas) při registraci a druhý při vyčerpání dema se statistikou použití. Odesílá Resend ze serveru.
- Důsledek: formulář má jen informativní větu o kontaktu, ne newsletterový souhlas.

### D-012 Chyba na naší straně nespotřebuje pokus
- Datum: 2026-10-22
- Stav: platí
- Kontext: výpadek API nebo nečitelný soubor nesmí klienta připravit o pokus.
- Rozhodnutí: pokus se spotřebuje až při úspěšném vytěžení.
- Důsledek: kvóta potřebuje rezervaci rozpracovaných faktur, aby se nedala obejít souběžným nahráním.

### D-013 DNS pro e-maily musí zahrnovat Resend
- Datum: 2026-10-22
- Stav: platí
- Kontext: skill `web-security-setup` doporučuje `v=spf1 -all` pro doménu bez pošty. Demo ale posílá e-maily z prvotka.cz.
- Rozhodnutí: SPF a DKIM musí zahrnout Resend a běžnou poštu. DMARC se zpřísňuje až po ověření doručování.
- Důsledek: nikdy nenastavit `-all` bez kontroly, kdo z domény posílá.

### D-014 Paměť jsou tři soubory v `memory/demo/`
- Datum: 2026-10-22
- Stav: platí (umístění upraveno D-018)
- Kontext: původních pět souborů (STATE, DECISIONS, OPEN-QUESTIONS, SESSION-LOG, HANDOFF) a README se mělo nahradit systémem podle skillu `project-memory-system`.
- Rozhodnutí: `index.md` (mapa), `pravidla.md` (pravidla vedení), `memory.md` (stav, rozhodnutí, otázky, záměrně nehotové, předání, deník). Obsah starých souborů je převzatý sem, staré soubory smazané. Číslování D-xxx a Q-xxx zůstává.
- Důsledek: odkazy v `CLAUDE.md`, `docs/demo/AGENTS-demo.md`, `docs/` a příkazech míří na `memory.md`. `.claude/security/` zůstává samostatná (vzniká v F9).

### D-015 Skilly projektu jsou v `.claude/skills/`
- Datum: 2026-10-22
- Stav: platí
- Kontext: Q-006 a Q-007 řešily, že skilly pro F9 a F10 nejsou dostupné.
- Rozhodnutí: z `~/Documents/claude skills` se zkopírovaly relevantní skilly (seznam v `index.md`, sekce 5). SEO, layouty webů a `vizeon-sec-supabase` se nekopírovaly.
- Důsledek: zdroj zůstává v Documents. Při změně zdroje se kopie v projektu aktualizuje ručně a zapíše se do deníku.

### D-016 ECC je nainstalovaný jen jako výběr, bez hooků
- Datum: 2026-10-22
- Stav: platí
- Kontext: uživatel chtěl do projektu `affaan-m/ecc` (v2.2.3, 313 skillů, 73 agentů, 99 příkazů, rules pro 20 jazyků). Profil `minimal` by natáhl i Vue, Rust nebo Swift a instalátor do plánu přidával nevybrané skilly.
- Rozhodnutí: ruční kopie do `.claude/`: rules `common`, `typescript`, `web` (do `rules/ecc/`, bez git-workflow, development-workflow, hooks, agents, performance, design-quality), 10 agentů, 13 skillů, příkazy `/plan`, `/code-review`, `/build-fix`, `/test-coverage`. Agent `planner` přepnutý z Opusu na Sonnet. Hooky, MCP a `install-state` se neinstalují. `docs/demo/AGENTS-demo.md` má novou sekci 11 s přednostní klauzulí.
- Důsledek: git pravidla ECC by porušovala AGENTS-demo.md bod 8 (commit jen na pokyn), design pravidla ECC (bento, hloubka) odporují D-010. Aktualizace ECC jde jen ručním porovnáním se zdrojem, `ecc update` ani `uninstall` nefungují. Zdroj verze 2.2.3, commit 90606c8.

### D-017 taste-skill jen jako kontrola designu, ne jako zdroj designu
- Datum: 2026-10-22
- Stav: platí
- Kontext: uživatel chtěl `leonxlnx/taste-skill` (commit 6010f91). Jeho jádro losuje směr, barvy, písma a kompozici ze 247 galerijních webů, což odporuje D-010 (design téměř identický s prvotka.cz, tokeny z kódu webu).
- Rozhodnutí: skill je v `.claude/skills/design-taste-frontend/` bez `evals` a README. Do `SKILL.md` je vložený blok „Project adaptation“ a zúžený popis (spouští se jen na kontrolu). Povoleno: kapitola `app-screens.md`, `inspect.mjs --app`, `lint.mjs`, kritická smyčka. Zakázáno: `draw.mjs` a `--redraw`, `assets.mjs` bez výslovného pokynu. Varování inspektoru způsobená značkou (linky, mono popisky) jsou přijatá odchylka.
- Důsledek: `draw.mjs` by bez `TASTE_SKILL_HISTORY` psal do `~/.taste-skill/` v home. Složka `.taste-skill/` se nesmí commitovat, v projektu zatím není `.gitignore` (řešit v F0). Skripty vyžadují Node 22+ a Chrome, `assets.mjs` volá veřejná API archivů. Aktualizace jen ručním porovnáním se zdrojem.

### D-018 Demo žije v repozitáři webu, pravidla webu zůstávají základem
- Datum: 2026-10-22
- Stav: platí
- Kontext: F0 počítá s demem jako skupinou tras `/demo` v repu webu. Repo `prvotka-landing` má vlastní `CLAUDE.md`, `AGENTS.md`, paměť `memory/` a `.claude/security/`. Původní složka PRVOTKA DEMO neměla vlastní git (byla uvnitř gitu domovské složky).
- Rozhodnutí: `prvotka-landing` je naklonovaný do PRVOTKA DEMO jako kořen repa. Pravidla a paměť webu zůstávají beze změny, demo má `docs/demo/AGENTS-demo.md`, `docs/demo/BRIEF.md`, `docs/demo/phases/` a paměť `memory/demo/`. Kořenový `CLAUDE.md` a `AGENTS.md` mají na konci blok s odkazem na demo. ECC příkazy, agenti a pravidla jsou v `.claude/`. Bezpečnostní skilly jsou ve verzi z webu (opravené cesty), `design-taste-frontend` v omezené verzi dema (D-017). Repo se přepne na soukromé, aby nebyla veřejná logika kvót a vytěžení.
- Důsledek: nahrazuje umístění souborů z D-014 (tři soubory jsou nově v `memory/demo/`). Každá session načítá i paměť webu přes kořenový `CLAUDE.md`. Pravidla ECC v `.claude/rules/ecc/` se načítají i při práci na webu.

### D-019 Demo jde vypnout a bez zapnutí nepotřebuje své proměnné
- Datum: 2026-10-22
- Stav: platí
- Kontext: demo sdílí nasazení s ostrým webem. Povinná validace demo proměnných při startu by po sloučení shodila web, dokud nejsou nastavené.
- Rozhodnutí: `DEMO_ENABLED` jiné než `true` znamená vypnuté demo, `/demo` ukáže „Demo je teď vypnuté“ a proměnné dema se neověřují. Se zapnutým demem `src/instrumentation.ts` při startu ověří všechny proměnné (`src/lib/demo/envSchema.ts`) a vypíše názvy chybějících, nikdy hodnoty. `STORAGE_DRIVER=memory` se v produkci odmítne. Přibyla proměnná `DEMO_DATABASE_HOST` (pojistka migrací).
- Důsledek: `DEMO_ENABLED=false` je zároveň vypínač dema bez nasazení kódu.

### D-020 Struktura kódu dema a pojistka migrací
- Datum: 2026-10-22
- Stav: platí
- Kontext: F0 úkoly 2 až 7.
- Rozhodnutí: stránky webu ve skupině tras `src/app/(site)/`, demo v `src/app/demo/` s vlastním layoutem bez navigace webu, `noindex`. Logika v `src/lib/demo/` (`env`, `db/`, `storage/`), komponenty v `src/components/demo-app/` (složka `demo/` patří ukázce na webu), texty v `src/content/demo.ts`. Databáze: Neon HTTP driver, Drizzle, migrace v `drizzle/`, spouští se jen `npm run db:migrate` (`scripts/db-migrate.mts`, Node 24 bez kompilace). Pojistka: hostitel musí odpovídat `DEMO_DATABASE_HOST` a databáze musí mít značku `demo_marker`, nebo být prázdná. První migrace obsahuje jen `demo_marker` a vložení značky ve stejné migraci, `leads` přijde ve F1. `drizzle-kit push/migrate` se nepoužívá. Přístup k datům plochy přes `scopedWhere(session, table, …)` v `src/lib/demo/db/workspaceScope.ts`. `R2Storage` je kostra, `MemoryStorage` plná a testovaná.
- Důsledek: každá nová tabulka plochy musí mít `workspaceId` a dotazy přes `scopedWhere`. Nové závislosti: `drizzle-orm` 0.45.4, `@neondatabase/serverless` 1.2.0, `server-only`, dev `drizzle-kit` 0.31.11, `@playwright/test` 1.64.0 (vybrané verze staré aspoň týden).

### D-021 Next 16.4.2 samostatnou větví z `main`
- Datum: 2026-10-22
- Stav: platí
- Kontext: Q-011, kritické zranitelnosti Next 16.3.8 na ostrém webu.
- Rozhodnutí: upgrade na 16.4.2 ve větvi `oprava/next-16.4.2` z `main`, aby šel na web bez nehotového dema. Stejná změna ve `faze/F0-priprava`.
- Důsledek: při sloučení F0 do `main` konflikt jen v `package-lock.json` a pamětech, řeší se převzetím verze 16.4.2.

### D-022 Přihlášení odkazem a cookie dema
- Datum: 2026-10-22
- Stav: platí
- Kontext: F1 úkoly 5 a 9, D-009.
- Rozhodnutí: token 32 náhodných bajtů (base64url), v databázi SHA-256. Cookie `prvotka_demo` nese token s HMAC podpisem klíčem `SESSION_SECRET`, podpis se ověří před dotazem do databáze. httpOnly, `secure` mimo `next dev`, SameSite Lax (odkaz z e-mailu je navigace z cizího webu, Strict by cookie po přesměrování neposlal), cesta `/demo`. Osobní odkaz `/demo/odkaz?t=` platí 14 dní a jde použít opakovaně, aby ho nespotřeboval náhled odkazu v poště. Session platí 14 dní. Přístup se navíc vždy odepře po `delete_at` plochy. Nová plocha má `delete_at` = registrace + 14 dní. IP se ukládá jen jako HMAC (`ip_hash`). Identifikátory generuje aplikace, registrace se zapisuje jedním `db.batch` (Neon HTTP nemá interaktivní transakce). Souběžná registrace stejného e-mailu skončí na UNIQUE `leads_email_normalized_unique` a dostane nový odkaz.
- Důsledek: dotazy brány a session (`dbStore.ts`) jdou na `workspaces` bez `scopedWhere`, protože session teprve vzniká. Vracejí jen id, stav a `delete_at`, nikdy data plochy.

## Otevřené otázky
Čekají na uživatele. Odpovězenou smaž a odpověď zapiš do Klíčových rozhodnutí.

| ID | Otázka | Výchozí předpoklad | Blokuje |
|---|---|---|---|
| Q-010 | Přepnout `prvotka-landing` na GitHubu na soukromé (`gh repo edit --visibility private`). Udělá uživatel, nebo agent na pokyn? | uživatel | nic, ale do F3 by mělo být hotovo |
| Q-001 | Úložiště souborů: R2, nebo Vercel Blob? Jaký plán Vercelu je nasazený a smí na Hobby běžet placená služba? | R2 za rozhraním `StorageAdapter` | F2 (skutečné úložiště) |
| Q-002 | Testovací firma v POHODĚ pro import vygenerovaných souborů | žádný | F5 a spuštění dema (blokující) |
| Q-003 | Doba uchování leadu | 12 měsíců | F8, F10 (text ochrany údajů) |
| Q-004 | Odesílací adresa e-mailů (např. `demo@prvotka.cz`) a ověření domény v Resendu (SPF, DKIM) | `demo@prvotka.cz` | F1 |
| Q-005 | Limity asistenta (zpráv na fakturu a na plochu) a denní strop vytěžení celého dema | 10 na fakturu, 30 na plochu, strop v konfiguraci | F7, F8 |
| Q-008 | Kde a jak vznikne stránka Ochrana osobních údajů (zpracovatelé: Vercel, Neon, Cloudflare, Anthropic, Resend) | doplní uživatel nebo právník | F10 |
| Q-009 | Rate limiting bez Redisu: tabulka v Neonu, Upstash (zdarma), nebo pravidla Vercelu? | tabulka v Neonu | F1 |

## Záměrně nehotové
Aby to další session neopravovala jako chybu.

- **Kód dema neexistuje.** Fáze se nepředbíhají (AGENTS-demo.md, bod 2).
- **`.claude/security/` patří webu.** Demo ji nezakládá znovu, v F9 ji rozšíří přes `web-security-memory`.
- **Právní text Ochrany osobních údajů nepíše agent.** Doplní ho uživatel (Q-008).
- **Žádný newsletterový souhlas ve formuláři.** Viz D-011.

## Deník
Nejnovější nahoře. Formát v `pravidla.md`, bod 5.

### 2026-10-22: Neon připojený, migrace F0 a F1
- **Co:** vznikl `.env.local` s `DATABASE_URL` a `DEMO_DATABASE_HOST` demo databáze Neon. `npm run db:migrate` na prázdné databázi zapsal značku a vytvořil `demo_marker`, `leads`, `workspaces`, `access_tokens`, `sessions`, `events`. Druhý běh pojistku prošel přes značku a nic nezměnil.
- **Proč:** na pokyn uživatele, poslední bod F0.
- **Dopad:** F0 hotová. Připojovací řetězec uživatel vložil do chatu, heslo uživatel v Neonu změnil a nové je v `.env.local` (připojení ověřené). Node při migraci varuje `MODULE_TYPELESS_PACKAGE_JSON` (import `guard.ts`), neškodné, neřešeno.
- **Soubory:** `.env.local` (mimo git), `memory/demo/memory.md`, `memory/demo/index.md`

### 2026-10-22: F1 session 1, registrace bez databáze
- **Co:** schéma a migrace brány, normalizace e-mailu a seznam jednorázových domén, volná kontrola telefonu, tokeny a podepsaná cookie, logika registrace a přihlášení odkazem s testy, server akce, trasa `/demo/odkaz`, `/demo/app` jen s platnou session (D-022).
- **Proč:** fáze F1, na pokyn uživatele začatá před dokončením F0. Turnstile, limit pokusů a e-maily čekají na Q-004, Q-009 a klíče.
- **Dopad:** web beze změny. Migrace F1 ještě neběžela, `npm run db:migrate` ji spustí s F0. E2e `/demo/app` teď ověřuje přesměrování bez session.
- **Soubory:** `src/lib/demo/db/schema.ts`, `drizzle/0001_f1_gate.sql`, `drizzle/meta/*`, `src/lib/demo/gate/*`, `src/lib/demo/auth/*`, `src/app/demo/actions.ts`, `src/app/demo/odkaz/route.ts`, `src/app/demo/app/page.tsx`, `src/content/demo.ts`, `e2e/demo-shell.spec.ts`

### 2026-10-22: upgrade Next 16.4.2
- **Co:** `next` a `eslint-config-next` 16.4.2 ve `faze/F0-priprava` i v nové větvi `oprava/next-16.4.2` (D-021).
- **Proč:** Q-011, rozhodnutí uživatele.
- **Dopad:** lint, typy, 66 testů, build a 6 e2e prošly. Záznam i v `memory/memory.md` webu a `.claude/security/AUDIT-LOG.md`.
- **Soubory:** `package.json`, `package-lock.json`

### 2026-10-22: F0 kostra dema
- **Co:** vznikly trasy `/demo` a `/demo/app` s vlastním layoutem, validace prostředí, Neon + Drizzle s první migrací a pojistkou, `StorageAdapter` (paměťový a kostra R2), `scopedWhere` pro `workspace_id`, Vitest testy a Playwright. Stránky webu se přesunuly do `(site)`.
- **Proč:** fáze F0.
- **Dopad:** web beze změny adres a CSP, ověřeno v produkčním buildu. Záznam i v `memory/memory.md` webu. `.claude/**` vyřazeno z ESLintu (skripty převzatých skillů). `.taste-skill/` přidáno do `.gitignore` (D-017).
- **Soubory:** `src/app/(site)/*`, `src/app/demo/*`, `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/instrumentation.ts`, `src/lib/demo/*`, `src/components/demo-app/*`, `src/content/demo.ts`, `drizzle/*`, `drizzle.config.ts`, `scripts/db-migrate.mts`, `playwright.config.ts`, `e2e/*`, `.env.example`, `package.json`, `tsconfig.json`, `eslint.config.mjs`, `.gitignore`

### 2026-10-22: demo přesunuté do repozitáře webu
- **Co:** do PRVOTKA DEMO se naklonoval `prvotka-landing` a vznikla větev `faze/F0-priprava`. Plánovací soubory dema se přesunuly do `docs/demo/` a `memory/demo/` a cesty v nich, v příkazech a ve skillu `design-taste-frontend` se přepsaly. Kořenový `CLAUDE.md` a `AGENTS.md` (část 14) dostaly blok o demu. Prázdné `PROJECT-BRIEG.md`, `memory/`, `.agents` a `.codex` se smazaly.
- **Proč:** na pokyn uživatele (D-018).
- **Dopad:** D-014 má nové umístění souborů. `design-taste-frontend` v repu je nyní omezená verze dema místo verze webu. Původní plánovací soubory zůstaly zálohou jen v dočasném adresáři session.
- **Soubory:** `CLAUDE.md`, `AGENTS.md`, `docs/demo/*`, `memory/demo/*`, `.claude/commands/*`, `.claude/agents/*`, `.claude/rules/ecc/*`, `.claude/skills/*`

### 2026-10-22: instalace taste-skill (omezená)
- **Co:** `leonxlnx/taste-skill` zkopírován do `.claude/skills/design-taste-frontend/` (SKILL.md, references, library, scripts, assets). Přidán blok o omezení a zúžený popis. Sekce 11 v `docs/demo/AGENTS-demo.md` doplněna o jeho roli.
- **Proč:** na pokyn uživatele, přizpůsobeno fixnímu designu (D-010).
- **Dopad:** žádný kód ani nastavení. Skript nic nespouštěl, zkontrolováno jen, že síť používá pouze `assets.mjs` a procesy jen `inspect` (headless Chrome).
- **Soubory:** `.claude/skills/design-taste-frontend/*`, `docs/demo/AGENTS-demo.md`, `memory/demo/*` (D-017)

### 2026-10-22: instalace ECC (výběr)
- **Co:** z `affaan-m/ecc` 2.2.3 zkopírováno do `.claude/`: `rules/ecc/` (common, typescript, web), 10 agentů, 13 skillů, 4 příkazy. Opraveny odkazy na nenainstalované soubory (`code-review.md`, `web/performance.md`, `tdd-workflow`). Přidána sekce 11 do `docs/demo/AGENTS-demo.md`.
- **Proč:** na pokyn uživatele, přizpůsobeno projektu (Next.js, TypeScript, Neon, bez hooků).
- **Dopad:** rules se načítají automaticky, ECC agenti a skilly jsou dostupné. Žádný kód, hooky ani nastavení se nezměnily.
- **Soubory:** `.claude/rules/ecc/*`, `.claude/agents/*`, `.claude/skills/*`, `.claude/commands/*`, `docs/demo/AGENTS-demo.md`, `memory/demo/*` (D-016)

### 2026-10-22: sjednocení paměti a skilly projektu
- **Co:** paměť přepsaná na `index.md`, `pravidla.md`, `memory.md`. Staré soubory STATE, DECISIONS, OPEN-QUESTIONS, SESSION-LOG, HANDOFF a README smazané po převzetí obsahu. Do `.claude/skills/` zkopírováno 23 skillů z `~/Documents/claude skills`. Q-006 a Q-007 vyřešeny (D-015).
- **Proč:** na pokyn uživatele.
- **Dopad:** přepsané odkazy v `CLAUDE.md`, `docs/demo/AGENTS-demo.md`, `docs/demo/BRIEF.md`, `docs/demo/phases/` a v příkazech `/session-start`, `/phase`, `/session-end`. `CLAUDE.md` už neimportuje stav automaticky, jen mapu (`index.md`).
- **Soubory:** `memory/demo/*`, `.claude/skills/*`, `.claude/commands/*`, `CLAUDE.md`, `docs/demo/AGENTS-demo.md`, `docs/`

### 2026-10-22: plánování (mimo repozitář)
- **Co:** návrh dema vznikl v konverzaci: skutečná aplikace, 4 faktury na klienta, hromadné nahrání 30 PDF, mazání po vyčerpání, e-mail jen jednou. Ověřeny ceny a limity úložiště (R2, Vercel Blob) a vzhled prvotka.cz. Vznikl brief, AGENTS-demo.md, rozdělení na fáze F0 až F10 a první verze paměti.
- **Proč:** založení projektu.
- **Dopad:** izolované, kód neexistuje.
- **Soubory:** `docs/demo/BRIEF.md`, `docs/demo/phases/*`, `docs/demo/AGENTS-demo.md`, `CLAUDE.md`
