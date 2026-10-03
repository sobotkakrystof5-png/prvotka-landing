# MEMORY – živý stav projektu

Co se skutečně stalo, jaký je stav a proč. Pravidla formátu jsou v `pravidla.md`.

## Aktuální stav

- **Projekt:** landing page produktu Prvotka pro vytěžování faktur (PDF, skeny, fotky → ISDOC/ISDOCX) pro účetní kanceláře.
- **Fáze:** 2026-10-03 přestavěná sekce Proč to řešit a pořadí sekcí, čeká na schválení zadavatelem (screenshot sekcí 02 a 03). Fáze 1–8 implementované lokálně 2026-10-02 na pokyn „kompletní implementace“ (bez průběžných zastávek po fázích). Čeká na schválení: hlavně design na `/styleguide` (Fáze 2), pak celkový dojem (Fáze 7). Fáze 9 (nasazení) blokují podklady v Otevřených otázkách. Nic není commitnuté ani nasazené.
- **Stack:** Next.js 16.3.8 (App Router, Turbopack) + React 19 + TypeScript, Tailwind CSS 4, shadcn/ui (Radix), Motion 14, React Hook Form + Zod 4, Resend, Vitest 5, npm. Hosting Vercel Hobby.
- **Co existuje:** celá landing page (10 sekcí, 9 viditelných), právní stránky jako placeholder, 404, `/styleguide`, OG obrázek, sitemap, robots, JSON-LD, Server Action formuláře, bezpečnostní vrstva a `.claude/security/`, CI workflow. Zadání je `PROJECT-BRIEF.md` (verze 1.1).
- **Ověřeno lokálně (`next start`, 2026-10-02):** lint, typy, 31 testů, build bez varování. Chromium i WebKit na 360/768/1024/1440 px bez vodorovného scrollu, 0 porušení CSP, 0 chyb v konzoli, i s `prefers-reduced-motion`. Lighthouse mobil: Performance 90–91, Accessibility 100, Best Practices 100, SEO 100, CLS 0. Formulář: validace a chybové stavy fungují, skutečné odeslání e-mailu neověřené (chybí klíč Resend a doména).

## Klíčová rozhodnutí

Znovu se otevírají jen na výslovný pokyn zadavatele.

- **2026-10-03** – Doména webu je `prvotka.cz`, protože cílem jsou primárně české účetní kanceláře (shodně s alteno.cz, vizeon.cz, zakaziq.cz). Zatím neregistrovaná.

- **2026-10-03** – Logo: varianta „P + faktura s fajfkou“ od zadavatele, bez konstrukčních linek a bez sloganu „Z dokladů do vašeho systému“. Slogan se na web nedává.
- **2026-10-03** – Název produktu: Prvotka (`site.name` v `src/config/site.ts`). Nahrazuje placeholder `[NÁZEV]`.
- **2026-10-03** – Nové pořadí sekcí na pokyn zadavatele: Úvod → Proč to řešit → Kalkulačka → Jak to funguje → Co vám to přinese → Na míru → (Případová studie) → Kdo za tím stojí → FAQ → Kontakt. Navbar: Úspora, Jak to funguje, Na míru, O nás, Časté dotazy, Kontakt. Nahrazuje pořadí z 2026-10-02.
- **2026-10-03** – „17 h“ a „3–7 minut“ nejsou na stránce jako tvrzení (nejsou změřené). Hodiny a koruny ukazuje jen kalkulačka z čísel, která si návštěvník zadá. Sekce Proč to řešit je bez čísel.
- **2026-10-03** – Příběh: při rozjezdu Alteno jsme obvolali hodně účetních a skoro všude řešili to samé, proto vznikl startup. Hodnota: prodáváme výsledek (úsporu času a peněz), ne software. Každá aplikace individuálně pro jednu firmu, přístup jen pro ni.
- **2026-10-03** – Kalkulačka zůstává bez ceny (`showPrice: false`), výstup jako výkaz dnes / s aplikací / rozdíl + pracovní dny.
- **2026-10-03** – Úvod (hero) zůstává beze změny. Okno aplikace ve stylu Docker Desktop je ve druhé sekci, ne v heru.
- **2026-10-02** – Cena 35 000 Kč jednorázově, OSVČ, neplátce DPH. Varianta 29 990 Kč zamítnuta.
- **2026-10-02** – Pozice startupu, CEO Kryštof Sobotka, video 2 minuty.
- **2026-10-02** – Stack Next.js + React + Tailwind + shadcn/ui.
- **2026-10-02** – Struktura: jednostránková landing page s kotvami + právní stránky + 404. Závazné, ne návrh k tichému přehodnocení.
- **2026-10-02** – Paměť projektu vede `project-memory-system` ve složce `memory/`. Průběžný stav se nepíše do `CLAUDE.md`, ale sem. Důvod: `CLAUDE.md` má zůstat stabilní smlouvou o chování.
- **2026-10-02** – Projektové skills žijí v `.claude/skills/` tohoto repozitáře, ne globálně.
- **2026-10-02** – Workflow animace PDF → systém → ISDOCX → účetní program (n8n princip) je v sekci „Jak to funguje“ nad demem. Běží jednou při vstupu do viewportu a zastaví se, žádná nekonečná smyčka. Třetí uzel se jmenuje „ISDOCX“, jinde na stránce zůstává „ISDOC“. Tři textové kroky pod demem se zrušily.
- **2026-10-02** – Next.js 16 místo 15, nonce CSP v `proxy.ts`, dynamický render stránek.
- **2026-10-02** – Hosting Vercel Hobby. Podmínky Hobby nepovolují komerční použití, zadavatel riziko vědomě přijal a Pro nechce. Žádná funkce nesmí záviset na placeném tarifu.
- **2026-10-02** – Vlastní git repozitář ve složce projektu + soukromé GitHub repo (založení a push až se souhlasem).
- **2026-10-02** – Konfigurace v `src/config/site.ts`, přepínače `null` = nerozhodnuto (platí brief, ne návrh `lib/site.ts` v `AGENTS.md`). Stav projektu jen v `memory/memory.md`.
- **2026-10-02** – SEO kontrola skilly `seo-quality-principles` + `seo-technical` + `seo-schema` místo neexistujícího `seo-ai-risk-guard`.
- **2026-10-02** – `style-src 'self' 'unsafe-inline'` kvůli `style=""` atributům z Motion a `next/image`. `script-src` zůstává striktní.

## Otevřené otázky

Čekají na zadavatele. Po zodpovězení se smažou.

- [ ] Registrace `prvotka.cz` (zadavatel, na sebe nebo na firmu) a ověření dostupnosti u českého registrátora nebo ve whois CZ.NIC. Až bude doména jeho, doplnit `site.domain`, `AGENTS.md`, `.env.example` a doménu pro Resend. Volitelně `prvotka.com` jako přesměrování.
- [ ] Příběh v sekci Proč to řešit: počet obvolaných kanceláří nebo skutečné citace účetních (se souhlasem)? Do té doby bez čísel a citací.
- [ ] Vytěžování lokálně, nebo přes cloudové AI API (rozhoduje `site.dataStaysOnPremise`).
- [ ] Změřený čas na fakturu s aplikací (TEPO).
- [ ] Výše měsíční správy a zda zobrazit cenu.
- [ ] Tým, nebo zakladatel sám (`site.hasTeam`).
- [ ] Podporované účetní programy kromě POHODY.
- [ ] Kontaktní údaje, e-mail pro poptávky, místo podnikání (§ 435 OZ, ověřit povinnost).
- [ ] Text ochrany osobních údajů. Blokér Fáze 9, web s živým formulářem bez něj nenasazovat.
- [ ] Rate limit formuláře: ve Fázi 6 ověřit Vercel Firewall na Hobby, případně Upstash (nová závislost).
- [ ] **Schválit design Fáze 2 na `/styleguide`:** písmo nadpisů Newsreader (místo Fraunces/Instrument Serif z briefu, viz changelog), nové tokeny `warn-ink` #8F4E14, `field-border` #857C6C, `sheet` #FCFAF5, `warn-soft` #F5E6D6, logo (vektor překreslený z návrhu zadavatele, nápis v Newsreaderu, barva `ink`), motiv okraje účetní knihy s čísly sekcí.
- [ ] Oddělení přístupu podle klientů u kanceláře: nabízíme? Na webu je zatím placeholder `[OVĚŘIT, ZDA NABÍZÍME]`.
- [ ] Lighthouse ověřit na náhledovém nasazení Vercel (lokálně Performance 90–91 při gzip a simulovaném 4G, těsně nad hranicí).
- [ ] `memory/pravidla.md` (část 9) pořád odkazuje na `project-brief-prompt.md`. Soubor se mění jen na pokyn zadavatele: upravit na `PROJECT-BRIEF.md`?
- [ ] Popisky výzvy: navbar „Kontaktní formulář“ (podle briefu), jinde „Domluvit hovor“. Design skill doporučuje jeden popisek pro jeden záměr. Nechat, nebo sjednotit?
- [ ] Fotka CEO.
- [ ] Potvrdit, že ZakazIQ = `https://www.zakaziq.cz` (doplněno 2026-10-03 podle domény, vede na přihlášení).
- [ ] Video (natočení, hosting).
- [ ] Souhlas TEPO s případovou studií.
- [ ] Klíčová slova z Collabimu nebo jiného nástroje.
- [ ] Statický, nebo pevný navbar.
- [ ] Doména pro odesílání e-mailů přes Resend.
- [ ] Commit, soukromé GitHub repo a push: kód je zatím jen lokálně v novém repozitáři bez commitu.

## Záměrně neudělané

Aby to další session „neopravovala“ jako chybu.

- **Případová studie se nezobrazuje.** Dokud neexistují změřená data a souhlas klienta.
- **FAQ otázky s `published: false`.** Čekají na odpovědi zadavatele.
- **Slib o ochraně dat chybí.** Dokud není rozhodnut způsob vytěžování.
- **HSTS bez `preload`.** Doplní se po měsíci bezchybného provozu (`.claude/security/DECISIONS.md` #006).
- **Z repozitáře taste-skill je jen `design-taste-frontend`.** Zbylých 12 variant (gpt-taste, soft, minimalist, brutalist, redesign, imagegen …) se neinstalovalo, protože by se překrývaly. Rozpory skillu se zadáním se neopravují v `SKILL.md`, jsou vypsané v `AGENTS.md`, část 10.
- **Výchozí výsledek kalkulačky (cca 4 670 Kč/měsíc) je nižší než „5 000–7 000 Kč“ z TEPO.** Kalkulačka odečítá čas na kontrolu, tabulka TEPO ne. Neopravovat. Od 2026-10-03 poznámka pod čarou rozsah z TEPO nezmiňuje, jen vysvětluje odečet kontroly.
- **Sekce Proč to řešit nemá žádné číslo** (2026-10-03). Žádné „17 h“, „3–7 min“ ani velké číslo vedle seznamu. Nevracet.
- **Ukázky v Proč to řešit nepoužívají razítko** (`Stamp`). Razítka má stránka max 3, překlep a „součet nesedí“ jsou ve `warn` barvách.
- **Čísla a obrysy souborů v pozadí jsou na mobilu vypnuté** (jako dřív, brief to dovoluje). Na úzkém displeji by se pletly do textu.
- **Při `showPrice: false` graf kalkulačky bez investice a návratnosti, bez srovnání s poplatkem za doklad.** Jinak by prozradil cenu. Čára „s aplikací“ je pak jen čas na kontrolu.
- **Čáry grafu kalkulačky jsou rovné, ne „načrtnuté“** (2026-10-03). Výpočet je přesný a vlnka působila jako šum v datech. Nevracet bez pokynu.
- **Odkaz na video v heru se nevykresluje, dokud `videoSrc` je `null`.** Nesliboval by obsah, který neexistuje.
- **Rate limit formuláře na IP není v kódu.** Limit v paměti na Vercelu nefunguje (DECISIONS.md #005). Řeší se ve Fázi 6 na náhledovém nasazení. Do té doby honeypot + minimální doba 3 s.
- **Formulář není v initial HTML.** Načítá se po hydrataci (`ContactFormLoader`), aby nezdržoval obsah nad ohybem. V HTML je zástupný blok a `<noscript>` s e-mailem. Texty sekce Kontakt jsou v HTML normálně.
- **Komponenta Tooltip ze shadcn/ui se nepoužívá (smazaná).** Popis kroků workflow je v panelu pod workflow s `aria-live`, funguje i na dotyk a klávesnici.
- **`<Mark>` a čísla v okraji bez Motion.** IntersectionObserver + CSS a CSS scroll-driven animace. Hero díky tomu nepotřebuje knihovnu animací (výkon). Prohlížeč bez `animation-timeline` ukáže čísla staticky.
- **Písma jsou lokální podmnožiny (`next/font/local`), ne `next/font/google`.** S osou `opsz` stahoval Google celý rozsah vah (311 kB fontů, Performance 80). Nový znak mimo podmnožinu vyžaduje nové stažení (`src/assets/fonts/FONTS.md`).
- **Odpovědi FAQ jsou v HTML i zavřené** (`forceMount`, skryté přes `data-state=closed`). Kvůli SEO.
- **Čísla sekcí „(02)“ jsou v levém okraji jako čísla řádků účetní knihy, ne jako štítek nad nadpisem.** Na mobilu nad nadpisem.
- **`/styleguide` zůstává do Fáze 9.** Má `noindex` a zákaz v robots.txt. Před nasazením odstranit.
- **Právní stránky mají `noindex` a nejsou v sitemapě,** dokud obsahují jen placeholder.
- **IČO v ukázkách záměrně nemají platný kontrolní součet a účty mají kód banky 0000.** Nemůžou kolidovat se skutečnou firmou.
- **`security.txt` má placeholder kontakt.** Není platný, dokud zadavatel nedodá e-mail (STATE.md).

## Changelog

Nejnovější nahoře.

### 2026-10-03 – Přestavba grafu kalkulačky a nelineární posuvník faktur
- **Co:** Graf místo jedné vlnité čáry kumulativní úspory ukazuje dvě kumulativní čáry nákladu (ruční přepis dnes, kontrola s aplikací), plocha mezi nimi je úspora s popiskem „ušetříte“. Nad grafem výkaz pro vybraný měsíc (dnes / s aplikací / ušetříte), měsíc se vybírá myší, dotykem i klávesnicí (`role="slider"`, šipky, Home/End, PageUp/Down). Při změně vstupů čáry plynule přejdou (350 ms, při omezených animacích hned). Osa Y má hysterezi (přepočet až při přetečení nebo poklesu pod třetinu), takže víc faktur = viditelně vyšší čáry, dřív se osa přeškálovala a obrázek zůstal stejný. Rovné čáry místo „načrtnutých“. Osa má jednotku Kč a kulaté dílky, miliony s desetinným místem. Při `showPrice` se k čáře s aplikací přičte cena a správa a návratnost je průsečík. Posuvník faktur je nelineární (`INVOICE_STOPS` v `savings.ts`: do 300 po 10, do 1 000 po 25, dál po 100) s popisky 300 a 1 000 na skutečné pozici. Levá karta kalkulačky už se nenatahuje na výšku pravého sloupce (`lg:self-start`).
- **Proč:** Na pokyn zadavatele, graf „absolutně nefungoval a nedával smysl“: jedna přímka z nuly, osa se při každé změně přeškálovala, takže vypadal pořád stejně, a nic nesrovnával. Posuvník faktur měl běžné hodnoty 100–500 v prvních milimetrech.
- **Dopad:** `SavingsPoint` má nová pole `manualCost` a `checkCost`, prop `description` grafu zrušený (popis si graf skládá sám). Texty grafu v `cs.ts` přepsané. Cena se dál nikde neukazuje. CSP beze změny. Odchylka od briefu 6.6 („načrtnutá“ linka, „jen kumulativní úspora“) zapsaná do `PROJECT-BRIEF.md`. Ověřeno: typy, lint, 41 testů, Playwright Chromium + WebKit na 360/768/1024/1440 px s omezenými animacemi i bez nich, bez vodorovného scrollu, bez chyb v konzoli, ovládání klávesnicí.
- **Soubory:** `src/lib/savings.ts`, `src/lib/savings.test.ts`, `src/components/sections/SavingsChart.tsx`, `src/components/sections/CalculatorWidget.tsx`, `src/content/cs.ts`, `PROJECT-BRIEF.md`, `memory/memory.md`

### 2026-10-03 – Oprava CI: typecheck a audit závislostí
- **Co:** Skript `typecheck` nově spouští nejdřív `next typegen` (v CI chyběl generovaný typ `LayoutProps`). `shadcn` přesunut z `dependencies` do `devDependencies`, protože jde o CLI a jeho tranzitivní zranitelnost (`braces`) shazovala `npm audit --omit=dev`.
- **Proč:** první běh workflow `security` na GitHubu selhal ve dvou jobech.
- **Dopad:** bezpečnost (AUDIT-LOG). Runtime ani build se nemění, `@import "shadcn/tailwind.css"` se při buildu dál načte, protože dev závislosti se při buildu instalují.
- **Soubory:** `package.json`, `package-lock.json`, `.claude/security/AUDIT-LOG.md`, `AGENTS.md`

### 2026-10-03 – Nahrání projektu na veřejný GitHub
- **Co:** Vytvořen první commit celého projektu a veřejné repo `sobotkakrystof5-png/prvotka-landing` (větev `main`, remote `origin`).
- **Proč:** na pokyn zadavatele.
- **Dopad:** repo je veřejné, tedy i `PROJECT-BRIEF.md`, `memory/`, `.claude/` a `AGENTS.md` jsou veřejně čitelné. Tajemství v repu nejsou, `.env*` je ignorované, v git je jen `.env.example`.
- **Soubory:** celý repozitář

### 2026-10-03 – Volba domény prvotka.cz
- **Co:** Zadavatel zvolil doménu `prvotka.cz`. Kontrola dostupnosti přes Vercel ukázala volné .cz, .com, .app, .io, .ai, .eu, .net, .online, u .cz ale výsledek není spolehlivý (Vercel .cz neprodává). V kódu se zatím nic nezměnilo, `site.domain` zůstává placeholder.
- **Proč:** Na pokyn zadavatele. Doménu do `site.ts` nepíšu před registrací, protože by canonical, sitemap a OG začaly mířit na neexistující adresu.
- **Dopad:** Po registraci: `site.domain`, `AGENTS.md`, `.env.example`, ověřená doména v Resend (SPF, DKIM, DMARC, doporučena subdoména pro odesílání), `security.txt`. Izolované do té doby.
- **Soubory:** `memory/memory.md`

### 2026-10-03 – IČO 29977231
- **Co:** `site.ico` v `src/config/site.ts` změněno z placeholderu `[IČO]` na `29977231` (kontrolní součet IČO sedí).
- **Proč:** Na pokyn zadavatele.
- **Dopad:** IČO se zobrazuje v patičce, v kontaktní sekci a ve větě o provozovateli (`cs.legal.operator`) na právních stránkách. Do JSON-LD se nepřidávalo (zatím ho tam nic nečte). Ověřeno: typy, výskyt na lokálním webu.
- **Soubory:** `src/config/site.ts`, `PROJECT-BRIEF.md`, `memory/memory.md`

### 2026-10-03 – Popis ZakazIQ: klientský rezervační systém
- **Co:** Popis ZakazIQ v pásu značek změněn z „po objednání v něm sledujete průběh zavedení, domlouváte termíny a dáváte zpětnou vazbu“ na „klientský rezervační systém“.
- **Proč:** Na pokyn zadavatele.
- **Dopad:** Jen text v pásu značek (patička popisy nezobrazuje). Ověřeno: typy.
- **Soubory:** `src/config/site.ts`, `PROJECT-BRIEF.md`, `memory/memory.md`

### 2026-10-03 – Loga značek Alteno, Vizeon, ZakazIQ a URL ZakazIQ
- **Co:** Placeholder `[URL ZAKAZIQ]` odstraněn, ZakazIQ odkazuje na `https://www.zakaziq.cz` (web přesměruje na přihlášení). V pásu značek a v patičce jsou místo textových názvů loga (`alt` = název značky). Loga jsou lokální SVG v `public/brands/`, převzatá z webů značek: Alteno = původní SVG z hlavičky alteno.cz, světlá část přebarvená na `ink` #1A1916, tyrkysová #2DD4BF zůstala. Vizeon = wordmark „VIZEON“ z Cormorant Garamond 300 (písmo z vizeon.cz), prostrkání 0,1 em, převedený na křivky, barva `ink`, bez sloganu „Vize. Vývoj. Výsledky.“ (v malé velikosti nečitelný). ZakazIQ = ikona (čtyři čtverce v gradientu #1B3868 → #23478B) + „ZakazIQ“ z Inter 600 na křivkách, barva #1B3868, podle přihlašovací stránky zakaziq.cz. `Brand` v `site.ts` má nové pole `logo` (src, šířka, výška v pásu; patička 0,7×). Klíč `about.brands.urlPlaceholder` z `cs.ts` smazán.
- **Proč:** Na pokyn zadavatele.
- **Dopad:** CSP se neměnila (`img-src 'self'`, loga jsou lokální). `next/image` s `unoptimized`, SVG se servírují beze změny. Výšky log jsou vyrovnané na stejnou optickou výšku písma. Ověřeno: typy, lint, 38 testů, Chromium 1470 px (pás i patička), bez chyb v konzoli. Mobil 360 px vizuálně neověřen. Zda je zakaziq.cz správná adresa, potvrdí zadavatel.
- **Soubory:** `public/brands/alteno.svg`, `public/brands/vizeon.svg`, `public/brands/zakaziq.svg`, `src/config/site.ts`, `src/content/cs.ts`, `src/components/sections/BrandMarquee.tsx`, `src/components/layout/SiteFooter.tsx`, `PROJECT-BRIEF.md`, `AGENTS.md`, `memory/memory.md`

### 2026-10-03 – Přestavba sekce Co vám to přinese
- **Co:** Nový nadpis „Víc faktur za den, víc času na *podnikání*“ a perex místo „Stejná práce, dvě verze“. Šest řádků podle přínosů (Čas, Faktur za den, Peníze, Chyby, Přehled, Bezpečnost), každý „Dnes, ručně“ proti Prvotce s tučným výsledkem a vysvětlením. Sloupec Prvotky je list papíru (`sheet`, akcentní horní linka, `shadow-paper`) s logem v záhlaví, odrážky jsou fajfka ze znaku loga. Na mobilu místo záložek Ručně/S aplikací karta na řádek, kde je vidět obojí. Poznámka pod čarou odkazuje na `#kalkulacka`.
- **Proč:** Na pokyn zadavatele, původní nadpis nedával smysl a tabulka byla suchá. Zaměření na čas, peníze, víc faktur za den, čas na podnikání, bezpečnost a přehled.
- **Dopad:** Bez čísel (nejsou změřená). Řádek Bezpečnost slibuje jen přístup pro vlastní lidi, při `dataStaysOnPremise === true` se sám přepne na „Faktury neopustí vaši firmu“. Řádek Cena dál jen při `showPrice`. Ověřeno: typy, lint, 38 testů, Chromium 360/768/1440 px bez vodorovného scrollu a bez chyb v konzoli.
- **Soubory:** `src/components/sections/Benefits.tsx`, `src/content/cs.ts`, `memory/memory.md`

### 2026-10-03 – Zvýraznění „Startup pro účetní kanceláře“ v heru
- **Co:** Řádek nad nadpisem heru už není drobný popisek (`type-label`, 12 px), ale štítek: mono písmo 13–14 px tučně v `accent-strong`, podklad `accent-soft`, akcentní rámeček a tečka. Text beze změny.
- **Proč:** Na pokyn zadavatele, pozice startupu pro účetní má být vidět hned. Drobná výjimka z rozhodnutí „Úvod zůstává beze změny“, na výslovný pokyn.
- **Dopad:** Jen vzhled řádku nad nadpisem. Ověřeno: typy, lint, Chromium 360 a 1440 px bez vodorovného scrollu a bez chyb v konzoli.
- **Soubory:** `src/components/sections/Hero.tsx`, `memory/memory.md`

### 2026-10-03 – Logo místo názvu Prvotka v textu stránky
- **Co:** Každý výskyt `site.name` ve viditelném textu se vykresluje jako logo (znak + nápis) přes `BrandName`, napojené ve `withPlaceholders`, takže platí i pro budoucí texty. Týká se nadpisu „Proto vznikl Prvotka.“, titulku okna aplikace (zrušen tam samostatný znak, byl by dvakrát) a uzlu 2 workflow. Logo má velikost a účaří okolního písma, interpunkce za ním se neodtrhne, čtečky a vyhledávače dostanou text „Prvotka“ (`sr-only`).
- **Proč:** Na pokyn zadavatele.
- **Dopad:** Titulek záložky, metadata, OG alt, `aria-label` a JSON-LD zůstávají textem, logo tam nejde. V textu se používá varianta `compact` (silnější pravá hrana). Ověřeno: typy, lint, 38 testů, build, Chromium 360 a 1440 px bez vodorovného scrollu a bez chyb v konzoli.
- **Soubory:** `src/components/motifs/Placeholder.tsx`, `src/components/motifs/LogoMark.tsx`, `src/components/sections/AppWindow.tsx`

### 2026-10-03 – Logo Prvotka (varianta 2) v SVG
- **Co:** Znak z návrhu zadavatele (patkový dřík P, přeložený roh faktury, tenká hrana, fajfka) byl ručně překreslený do SVG a porovnaný s předlohou. Nápis „Prvotka“ je převedený na křivky z Newsreader 400 opsz 72 (písmo webu), prostrkání −60/2000 em, s kerningem. Bez konstrukčních linek a sloganu. Nasazeno v navbaru a patičce (`LogoFull`), v uzlu 2 workflow a v okně aplikace (`LogoMark compact`), na `/styleguide`, ve faviconu a v OG obrázku. Samostatné soubory jsou v `src/assets/brand/`. Starý dočasný znak z `DocIcons.tsx` byl smazán.
- **Proč:** Na pokyn zadavatele.
- **Dopad:** Hlavička, patička, favicon, OG, workflow. Varianta `compact` má silnější pravou hranu, protože pod 24 px tenká hrana mizela. Ve faviconu se fajfka při 16 px slévá, při 32 px je čitelná. Barva je `ink` (předloha je tmavě zelená). Nápis se při změně `site.name` nezmění. Ověřeno: typy, lint, 38 testů, build bez varování, Chromium 360 a 1440 px bez vodorovného scrollu a bez chyb v konzoli, OG vrací PNG. CSP se neměnila.
- **Soubory:** `src/components/motifs/LogoMark.tsx`, `src/components/motifs/DocIcons.tsx`, `src/components/layout/Logo.tsx`, `src/components/demo/Workflow.tsx`, `src/components/sections/AppWindow.tsx`, `src/app/styleguide/page.tsx`, `src/app/opengraph-image.tsx`, `src/app/icon.svg`, `src/assets/brand/`, `AGENTS.md`

### 2026-10-03 – Název produktu: Prvotka
- **Co:** Rozhodnutý název produktu je Prvotka. `site.name` v `src/config/site.ts` změněn z placeholderu `[NÁZEV]` na `"Prvotka"`. V dokumentaci (`PROJECT-BRIEF.md`, `CLAUDE.md`, `AGENTS.md`) nahrazeny prozaické zmínky `[NÁZEV]` (sekce 1, 4 a popis sekce Proč to řešit/workflow) skutečným jménem; kódová ukázka v briefu zůstala s placeholderem, protože zdrojem pravdy je `site.ts`.
- **Proč:** Na pokyn zadavatele.
- **Dopad:** V kódu šlo jen o jednu konstantu, všechny texty na stránce ji čtou přes `site.name`, žádný další výskyt v `src/` nebyl natvrdo. Typecheck bez chyb. Doména, e-mail, telefon, IČO a sídlo zůstávají placeholdery.
- **Soubory:** `src/config/site.ts`, `PROJECT-BRIEF.md`, `CLAUDE.md`, `AGENTS.md`, `memory/memory.md`

### 2026-10-03 – Zvýraznění perexu v heru
- **Co:** Perex heru je v plné barvě textu (dřív tlumený) s akcentní linkou vlevo. Pointa „Vy jen zkontrolujete a naimportujete.“ je na vlastním řádku, tučně v akcentní barvě. V `cs.ts` rozdělený na `hero.lead` a `hero.leadPoint`, text beze změny.
- **Proč:** Na pokyn zadavatele, aby si klient perexu všiml.
- **Dopad:** Jen vzhled perexu. Ověřeno: typy, lint, desktop 1320 px bez chyb v konzoli. Mobil 360 px vizuálně neověřen.
- **Soubory:** `src/components/sections/Hero.tsx`, `src/content/cs.ts`, `memory/memory.md`

### 2026-10-03 – Zvýraznění citátu CEO v „Proč to řešit“
- **Co:** Citát „Když jsme rozjížděli Alteno…“ je větší (serif až 2.6rem), má velkou akcentní uvozovku „ nad textem, silnější akcentní linku vlevo a podpis se jménem tučně a „CEO“ jako štítek.
- **Proč:** Na pokyn zadavatele.
- **Dopad:** Jen vzhled úvodu sekce, text beze změny. Ověřeno na desktopu 1470 px, mobil 360 px vizuálně neověřen.
- **Soubory:** `src/components/sections/Problem.tsx`, `memory/memory.md`

### 2026-10-03 – Přestavba „Proč to řešit“, kalkulačka nahoru, příběh a hodnota
- **Co:** Sekce Proč to řešit přepsaná na příběh ve čtyřech krocích: hlas zakladatele (Alteno), nadpis o bolesti + 3 krátké body ve velkém písmu, živá ukázka ručního přepisu s překlepem (`ManualRetype.tsx`), „Proto vznikl [NÁZEV]“ a okno aplikace ve stylu Docker Desktop (`AppWindow.tsx`, `appWindowTimeline.ts` + test). Obě ukázky přes nový `src/lib/useOneShotTimeline.ts` (jeden běh do 5 s, koncový stav na serveru a při omezených animacích). Kalkulačka přesunutá hned za problém, hlavní vstup je počet faktur, výstup jako výkaz (dnes / s aplikací / rozdíl, Kč ročně, pracovní dny); `savings.ts` rozšířený o `checkHoursPerMonth`, náklady a `workDaysSavedPerYear` + testy. Nové pořadí sekcí a navbaru. Z tabulky Co vám to přinese vypadly časové řádky. Na míru má postup ve 4 krocích, Kdo za tím stojí a Kontakt nové texty (příběh, hodnota). Pozadí s čísly rozšířené o obrysy souborů PDF/ISDOCX/SKEN a úryvky ISDOC (Úvod, Proč to řešit, Kalkulačka). Opraveno: pevná mezera před „Kč“ za číslem nefungovala, když za „Kč“ následovala interpunkce nebo konec textu (`typography.ts`, `\b` za „č“). Opraveno varování React o `key` v sekci Na míru (prvky v poli props ze serverové do klientské komponenty, jen v dev režimu).
- **Proč:** Na pokyn zadavatele. „17 h“ nebylo ověřené a nic neříkalo, texty byly malé a dlouhé. Zadavatel chce, aby účetní na první pohled poznal problém, hned si spočítal svá čísla, viděl, že dostane aplikaci, a pochopil příběh a hodnotu.
- **Dopad:** Struktura (pořadí sekcí, navbar), obsah, animace (dvě nové, obě jednorázové). Ověřeno: lint, typy, 38 testů, build. Chromium i WebKit 360/768/1024/1440 px bez vodorovného scrollu, s i bez `prefers-reduced-motion`. Produkční build bez chyb v konzoli a bez porušení CSP. Lighthouse mobil Performance 90, Accessibility 100, Best Practices 100, SEO 100, CLS 0. CSP ani vstupy se neměnily.
- **Soubory:** `src/components/sections/Problem.tsx`, `ManualRetype.tsx`, `AppWindow.tsx`, `appWindowTimeline.ts`, `appWindowTimeline.test.ts`, `Calculator.tsx`, `CalculatorWidget.tsx`, `Custom.tsx`, `HowItWorks.tsx`, `Hero.tsx`, `src/components/motifs/MarginFigures.tsx`, `DocIcons.tsx`, `ReplayButton.tsx`, `src/lib/useOneShotTimeline.ts`, `src/lib/savings.ts`, `src/lib/savings.test.ts`, `src/lib/sections.ts`, `src/lib/typography.ts`, `src/app/page.tsx`, `src/app/globals.css`, `src/content/cs.ts`, `PROJECT-BRIEF.md`, `AGENTS.md`

### 2026-10-02 – Výkon: lokální písma, odložený formulář, animace bez Motion v heru
- **Co:** Písma přešla na lokální podmnožiny přes `next/font/local` (130 kB místo 311 kB). Funkce Motion se načítají asynchronně, `<Mark>` a čísla v okraji běží bez Motion, formulář se stahuje až po hydrataci. Uzly workflow přestavěny na „roztažené tlačítko“ (WCAG 2.5.3), čekající uzly už neztlumují text (kontrast). Lighthouse mobil z 80 na 90–91, Accessibility z 97 na 100.
- **Proč:** Definice hotového chce Performance ≥ 90 a Accessibility ≥ 95 na mobilu. Nefungovalo: samotné vypnutí preloadu písem (79–81) a odložení formuláře bez zmenšení písem (76–79).
- **Dopad:** Výkon, přístupnost. Při novém znaku mimo podmnožinu písma je nutné písmo stáhnout znovu.
- **Soubory:** `src/app/layout.tsx`, `src/assets/fonts/`, `src/components/motion/`, `src/components/motifs/Mark.tsx`, `src/components/motifs/MarginFigures.tsx`, `src/components/sections/ContactFormLoader.tsx`, `src/components/demo/Workflow.tsx`, `src/app/globals.css`

### 2026-10-02 – Ověření v prohlížečích a opravy
- **Co:** Playwright (Chromium + WebKit) na 360/768/1024/1440 px a s `prefers-reduced-motion`. Opraveno: porušení CSP `script-src eval` od Zodu (`z.config({ jitless: true })`), hydratační chyba React #418 při omezených animacích (vlastní `usePrefersReducedMotion`), `upgrade-insecure-requests` rozbíjející lokální test v Safari (jen u HTTPS), zavřené odpovědi FAQ viditelné kvůli `forceMount`, ořezy na 1024 px v heru, workflow a kalkulačce, nečitelné popisky grafu na mobilu, razítko přes částku ve workflow, přesah logu z hera do další sekce.
- **Proč:** Definice hotového (konzole a CSP čisté v Chrome i Safari, responzivita 360–1440).
- **Dopad:** Bezpečnost (CSP v2, `.claude/security/CSP-LOG.md`), přístupnost, responzivita.
- **Soubory:** `src/proxy.ts`, `src/lib/contactSchema.ts`, `src/lib/usePrefersReducedMotion.ts`, `src/components/ui/accordion.tsx`, sekce v `src/components/`

### 2026-10-02 – Implementace Fází 1–8 (lokálně)
- **Co:** Založený Next.js 16.3.8 projekt (create-next-app, shadcn/ui Radix, Motion, RHF, Zod, Resend, Vitest), `git init` ve složce projektu. Nonce CSP v `src/proxy.ts`, hlavičky v `next.config.ts`, `.claude/security/` (STATE, DECISIONS #001–006, CSP-LOG, AUDIT-LOG, `security-check.sh`), `security.txt`, CI workflow, `.env.example`. Design tokeny v `globals.css`, motivy (linkování, okraj účetní knihy s čísly sekcí, razítko, Mark, čísla v okraji), `/styleguide`. Všech 10 sekcí podle briefu včetně workflow se stavovým automatem, dema s pěti fakturami, ukázek „Na míru“, kalkulačky (`src/lib/savings.ts`), pásu značek, FAQ a formuláře se Server Action. Právní stránky jako placeholder, 404, metadata, OG obrázek s latin-ext písmem, sitemap, robots, JSON-LD (ProfessionalService, SoftwareApplication, FAQPage jen s publikovanými otázkami). Texty v `src/content/cs.ts` podle `humanize-text-cs`.
- **Proč:** Na pokyn zadavatele „kompletní implementace“. Pokyn byl brán jako schválení Fáze 0 a vynechání zastávek po fázích. Nevratné kroky (commit, GitHub, nasazení, nové závislosti mimo stack) se neprovedly.
- **Dopad:** Celý projekt. Návrhy ke schválení ve Fázi 2: písmo Newsreader místo Fraunces/Instrument Serif (design-taste-frontend je zakazuje jako nejčastější „AI“ volby, brief je uváděl jen jako příklad), tokeny `warn-ink` #8F4E14 a `field-border` #857C6C (kontrast spočítaný), nové tokeny `sheet` a `warn-soft`, jeden rádius 3 px. `cn` z balíčku `cn` (součást shadcn presetu). `@types/node` zvednuté na 24 kvůli Vitest 5.
- **Soubory:** `package.json`, `next.config.ts`, `src/`, `public/.well-known/security.txt`, `.claude/security/`, `.github/workflows/security.yml`, `.env.example`, `.gitignore`, `vitest.config.ts`, `components.json`

### 2026-10-02 – Přejmenování briefu a sjednocení AGENTS.md
- **Co:** `project-brief-prompt.md` přejmenován na `PROJECT-BRIEF.md`. `AGENTS.md` přepsán podle skutečného stavu (příkazy, stack s verzemi, struktura, přepínače, env proměnné včetně `CONTACT_FROM_EMAIL`, Next.js blok, který vkládá `next dev`). `memory/index.md` aktualizován.
- **Proč:** Přejmenování odsouhlasené v plánu Fáze 0. AGENTS.md obsahoval návrhy `[NÁVRH]`/`[POTVRDIT]`, které implementace rozhodla.
- **Dopad:** Dokumentace. `memory/pravidla.md` pořád odkazuje na starý název (mění se jen na pokyn zadavatele, viz Otevřené otázky).
- **Soubory:** `PROJECT-BRIEF.md`, `AGENTS.md`, `memory/index.md`, `memory/memory.md`

### 2026-10-02 – Brief verze 1.1: rozhodnutí z analýzy Fáze 0
- **Co:** Do `project-brief-prompt.md` se zapsala rozhodnutí z analýzy briefu: Next.js 16 a `proxy.ts`, Tailwind 4 `@theme`, Vercel Hobby, git repo, `site.address`, náhrada `seo-ai-risk-guard`, tokeny `warn-ink`/`field-border`, kalkulačka bez ceny, odkaz na video jen s videem, dynamické číslování sekcí, rate limit bez paměti, CSP `style-src`, privacy text jako blokér Fáze 9, stav v `memory.md` místo `CLAUDE.md` část 5. Úvod briefu má souhrn „Změny ve verzi 1.1“.
- **Proč:** Na pokyn zadavatele, odsouhlasený plán realizace (Fáze 0).
- **Dopad:** Stack (verze Next.js), bezpečnost (CSP, rate limit), právo (privacy, patička), design (2 nové tokeny), kalkulačka. `AGENTS.md` a `memory/index.md` ještě nejsou sjednocené, soubor briefu ještě není přejmenovaný.
- **Soubory:** `project-brief-prompt.md`, `memory/memory.md`

### 2026-10-02 – Workflow animace „Od PDF faktury do účetnictví“
- **Co:** Do briefu přibyla v části 6.3 workflow animace ve stylu n8n: 4 uzly s ikonami (PDF faktura → systém `[NÁZEV]` → ISDOCX → účetní program) propojené spoji, po kterých putuje dokument. Doplněno do částí 3 (vlastní SVG ikony PDF/ISDOCX), 7 (povolené animace) a 12 (Fáze 3). Tři textové kroky pod demem zrušeny. Shrnutí animací v `CLAUDE.md` část 4, prvek v `AGENTS.md` část 5. Opraveny zastaralé zmínky „brief je prázdný“.
- **Proč:** Na pokyn zadavatele. Spouštění jednou, umístění nad demem a štítek „ISDOCX“ zvolil zadavatel.
- **Dopad:** Sekce „Jak to funguje“ má dvě animace za sebou. Uzel 4 nesmí slibovat automatické zaúčtování, import provádí účetní. Motion `style` atributy a CSP viz `AGENTS.md` část 9.
- **Soubory:** `project-brief-prompt.md`, `CLAUDE.md`, `AGENTS.md`, `memory/index.md`, `memory/memory.md`

### 2026-10-02 – Instalace skillu design-taste-frontend (taste-skill)
- **Co:** Do `.claude/skills/design-taste-frontend/` přibyl `SKILL.md` (v2, experimentální) a licence MIT z github.com/leonxlnx/taste-skill, commit `ce26fc2` (2026-09-26). Soubor je beze změn. Rozpory se zadáním (krémový podklad, serify, picsum, Simple Icons, vymyšlená loga a čísla, tmavý režim, GSAP) jsou vypsané v `AGENTS.md`, část 10.
- **Proč:** Na pokyn zadavatele.
- **Dopad:** Design budoucích sekcí. Nová závislost ani změna stacku nevznikla. Aktualizace skillu znamená ruční nové stažení a porovnání.
- **Soubory:** `.claude/skills/design-taste-frontend/`, `AGENTS.md`, `memory/index.md`, `memory/memory.md`

### 2026-10-02 – Přepis AGENTS.md na úplný technický kontext
- **Co:** `AGENTS.md` přepsán podle konvence agents.md: příkazy, stack, aktuální a navržená struktura, obsah stránky a přepínače `site`, design, konvence kódu, definice hotového, bezpečnostní pravidla, skills, git a hranice Vždy / Nejdřív se zeptej / Nikdy. Neznámé údaje jsou `[PLACEHOLDER]`, návrhy označené `[NÁVRH]`.
- **Proč:** Na pokyn zadavatele, aby měl každý AI nástroj úplný kontext i bez `CLAUDE.md`.
- **Dopad:** Bezpečnostní blok v `CLAUDE.md` už neodkazuje na neexistující pravidla. Hranice v `AGENTS.md` se částečně překrývají s částí 3 `CLAUDE.md`, při změně pravidla upravit obojí. Obsahová část vychází jen z `CLAUDE.md`, protože zadání je prázdné.
- **Soubory:** `AGENTS.md`, `memory/memory.md`

### 2026-10-02 – Zapojení paměťového systému
- **Co:** Vznikly `memory/index.md`, `memory/pravidla.md`, `memory/memory.md` a `AGENTS.md`. Průběžný stav (rozhodnutí, otevřené otázky, záměrně neudělané) se přesunul z části 5 `CLAUDE.md` sem, stack a struktura do `AGENTS.md`. `CLAUDE.md` načítá paměť přes `@import`. Smazána prázdná složka `.memory/`.
- **Proč:** Na pokyn zadavatele, aby paměť navazovala na celý projekt v každé session.
- **Dopad:** `CLAUDE.md` části 0, 2, 4 a 5. Šablona `web-project-brief` už nezakládá stav v `CLAUDE.md`, pokud projekt má `memory/`.
- **Soubory:** `memory/index.md`, `memory/pravidla.md`, `memory/memory.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/skills/web-project-brief/assets/claude-md-template.md`

### 2026-10-02 – Instalace projektových skills
- **Co:** Do `.claude/skills/` přibylo 8 skills: `web-security-setup`, `web-security-review`, `web-security-audit`, `web-security-memory`, `web-project-brief`, `project-memory-system`, `humanize-text-cs`, `seo-keyword-cluster-architect`. `web-project-brief` rozdělen ze single-file exportu na `SKILL.md` + `assets/`. Bezpečnostní šablony přesunuty do `web-security-setup/templates/`.
- **Proč:** Na pokyn zadavatele, zdroj je složka `~/Desktop/claude skills`.
- **Dopad:** Izolované, kód webu zatím neexistuje.
- **Soubory:** `.claude/skills/`
