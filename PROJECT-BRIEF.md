# CLAUDE CODE PROMPT – landing page produktu pro vytěžování faktur

Verze 1.1 · 2. 10. 2026 · zadavatel: Kryštof Sobotka (CEO)

Tento dokument je kompletní zadání pro Claude Code. Ulož ho do kořene nového repozitáře jako `PROJECT-BRIEF.md` a vedle něj `CLAUDE.md`. Práce probíhá **po fázích (část 12)**. Po každé fázi se zastav, shrň, co je hotové, a počkej na schválení. Další fázi nezačínej sám.

Všechno, co je v hranatých závorkách `[TAKHLE]`, je zatím neznámé. Nevymýšlej to. Ponech zástupný text, který je vidět, a zapiš ho do Otevřených otázek v `memory/memory.md`. Stav projektu, rozhodnutí a otevřené body se vedou v `memory/memory.md`, ne v `CLAUDE.md`.

### Změny ve verzi 1.1 (rozhodnutí Fáze 0, 2026-10-02)
Analýza briefu ve Fázi 0 našla rozpory a technické díry. Zadavatel odsouhlasil tato řešení. Jsou zapracovaná přímo v příslušných částech:
- **Stack:** Next.js 16 místo 15. Nonce CSP v `proxy.ts` (v Next.js 16 nahrazuje `middleware.ts`). Tailwind 4: tokeny v `@theme` v `globals.css`, ne v `tailwind.config` (části 3, 4, 11).
- **Hosting:** Vercel Hobby. Zadavatel Pro nechce a riziko podmínek Hobby (nekomerční použití) přijímá vědomě. Rate limit formuláře proto nesmí stát na placené funkci (části 4, 8).
- **Git:** vlastní repozitář ve složce projektu (`git init`) + soukromé GitHub repo. Založení repa a push až s výslovným souhlasem (část 12, Fáze 1).
- **Dokumentace:** platí `src/config/site.ts` s přepínači `null` = nerozhodnuto. Stav se vede v `memory/memory.md`.
- **SEO skill:** `seo-ai-risk-guard` neexistuje, nahrazují ho `seo-quality-principles` + `seo-technical` + `seo-schema` (části 10, 12, 14).
- **Doplněná pravidla:** kalkulačka při `showPrice: false` (6.6), odkaz na video v heru (6.1), tokeny pro kontrast (3), číslování sekcí (6), patička a místo podnikání (6.11), privacy text jako blokér nasazení (11, 12), CSP pro styly (11).

---

## 0. KRITICKÉ – WEB NESMÍ VYPADAT JAKO AI ŠABLONA

Tohle je nejdůležitější pokyn celého zadání a platí pro každé rozhodnutí níže. Většina webů postavených s AI vypadá stejně. Tenhle web musí působit, jako by ho navrhl zkušený designér pro jeden konkrétní produkt pro účetní, a pak ho desetkrát doladil.

**Vyhni se těmto vzorům:**
- Generický hero „velký vycentrovaný nadpis + podnadpis + dvě tlačítka + gradient vpravo“. Hero má být asymetrický, s živou ukázkou produktu, ne s ilustrací.
- Mřížky stejných karet „ikona nahoře, nadpis, text“ opakované 3–4×. Každá sekce má vlastní kompozici.
- Fialovo-modré gradienty, glassmorphism bez důvodu, 3D ilustrace, neupravené sady ikon.
- Animace „fade-in + slide-up na všem“. Každá animace něco vysvětluje, jinak tam není.
- Fráze typu „Jsme tým profesionálů“, „Kvalita je naše priorita“, „Revoluční řešení“. Každá věta je konkrétní a odpovídá skutečnému produktu.
- Stejné odsazení a šířka kontejneru ve všech sekcích. Sekce dýchají různě.
- Výchozí vzhled shadcn/ui a Tailwindu. Komponenty shadcn jsou jen kostra, vizuál se přestyluje přes vlastní tokeny.
- Vymyšlená čísla, falešná počítadla zpracovaných faktur, „live“ statistiky bez dat, smyšlené reference a loga klientů.

**Místo toho – vlastní vizuální motiv z účetnictví:**
- **Účetní linkování.** Jemné vodorovné linky jako v účetní knize nebo na papírové faktuře, tónem v tónu. Na nich sedí text i ukázky. Je to podpis webu, ne dekorace na každém rohu.
- **Kontrolní fajfka a razítko.** Okamžik, kdy aplikace fakturu zkontroluje, se zobrazí jako drobné „razítko“ (například „Součty sedí“, „DPH ověřeno“). Použít maximálně 3× na celé stránce.
- **Čísla a pojmy v pozadí.** Po stranách stránky tónem v tónu graficky zpracované údaje z faktur: `IČO`, `DIČ`, `VS 2026045`, `DPH 21 %`, `Σ 12 480,00 Kč`, `<isdoc:Invoice>`. Skoro neviditelné, s parallaxou maximálně pár pixelů. Na mobilu vypnuté nebo zjednodušené.
- **Tok vstup → zpracování → výstup** jako hlavní příběh celé stránky (inspirace Alteno, část 2).

Pokud si nejsi jistý, jestli prvek nepůsobí šablonovitě, navrhni originálnější variantu nebo se zeptej. Před dokončením každé sekce si polož otázku: „Vypadá tohle jako práce navržená pro tento produkt, nebo jako šablona?“

---

## 1. KONTEXT PROJEKTU

### Produkt
- **Název produktu a značky:** Prvotka (rozhodnuto 2026-10-03). Všude používej jednu konstantu ze `src/config/site.ts` (`site.name`), aby šel název změnit na jednom místě.
- **Doména:** `[DOMÉNA]`.
- **Co produkt dělá:** Účetní kanceláři nebo firmě postavíme aplikaci přímo pro ni. Aplikace převede faktury v PDF, skenech nebo fotkách do ISDOC/ISDOCX, který firma naimportuje do svého účetního programu (například POHODA). Účetní je tak nemusí ručně přepisovat.
- **Cílová skupina:** účetní firmy a kanceláře, hlavně s vyšším objemem faktur. Stránku budeme posílat konkrétním firmám osobně.
- **Pozice:** startup, který mění práci účetních. Příběh (upřesněno 2026-10-03): při rozjezdu Alteno (AI automatizace) jsme hledali zakázky u účetních, obvolali jich hodně a skoro v každé kanceláři řešili to samé, hodiny přepisování faktur kvůli formátu. Proto vznikl tento startup. Bez počtu kanceláří a bez citací, dokud nejsou doložené. Tváří značky je CEO Kryštof Sobotka.
- **Hodnota (2026-10-03):** neprodáváme software, prodáváme výsledek. Ke každé zakázce přistupujeme individuálně, každá aplikace je postavená pro jednu firmu, přístup do ní má jen ta firma a cíl je pokaždé stejný: ušetřit jí čas a peníze. Zakladatel má zkušenost s weby a aplikacemi na míru (Vizeon) a s automatizací firemních procesů (Alteno).
- **Cíl stránky:** jediná akce – domluvit hovor (formulář v sekci Kontakt). Stránka prodává úsporu času a peněz, ne systém.

### Co aplikace umí (převzato z nabídky, nic nepřidávej)
- Z nahraného souboru vyčte dodavatele, IČO, DIČ, číslo faktury, data, položky, sazby DPH, částky, variabilní symbol a bankovní účet.
- Kromě PDF zpracuje i obrázky a skeny.
- Vytvoří ISDOC/ISDOCX k importu do účetního programu.
- Pokud faktura ISDOC přílohu už obsahuje, jen ji vytáhne a znovu nevytěžuje.
- Před exportem zkontroluje součty a DPH a upozorní na podezřelé hodnoty. Údaje jde opravit.
- Eviduje všechny faktury: originál, vytěžené údaje, datum nahrání, stav, vygenerovaný ISDOC.
- Vyhledávání podle dodavatele, čísla nebo data, opětovné stažení, ochrana proti dvojímu zpracování.
- Přihlášení výhradně pro danou firmu.
- Hromadné nahrávání, nasazení na server, test na reálných fakturách, zaškolení.
- Výstup uživatel před importem kontroluje. Odpovědnost za správnost účetních údajů nese uživatel. Tohle musí být na stránce poctivě řečeno (FAQ).

### Proč „na míru“ (hlavní argument)
- Výstup přesně pro účetní program firmy. Seznam programů (potvrzeno zadavatelem 2026-10-04): POHODA, Money S3, ABRA, HELIOS, PREMIER system.
- Mapování polí podle zvyklostí firmy (střediska, předkontace, číselné řady).
- Vstupní formáty, které firma reálně dostává.
- Přístup jen pro její lidi, u kanceláře lze přístup rozdělit podle klientů (potvrzeno zadavatelem 2026-10-04).
- Žádný poplatek za doklad. Aplikace je její.

### Ochrana dat – POZOR
Slib „vaše faktury neopustí vaši firmu“ **nepoužívej, dokud v `site.ts` není `dataStaysOnPremise: true`**. Zatím není rozhodnuto, jestli vytěžování běží lokálně, nebo přes cloudové AI API. Text o datech napiš ve dvou variantách a přepínej je konstantou.

### Cena (odsouhlaseno)
- 35 000 Kč jednorázově. Zadavatel je OSVČ a neplátce DPH, na stránce tedy „35 000 Kč jednorázově (nejsem plátce DPH)“, nikdy „včetně DPH“.
- Měsíční správa: `[VÝŠE SPRÁVY]`.
- Zda se cena na stránce zobrazí, rozhoduje konstanta `showPrice` (výchozí `false`).

### Čísla pro výpočty (z nabídky TEPO)
| Údaj | Hodnota |
| --- | --- |
| Ruční přepis jedné faktury | 3–7 min |
| 200 faktur měsíčně | cca 17 h práce |
| Náklad na hodinu práce | 300–400 Kč |
| Úspora měsíčně | 5 000–7 000 Kč |
| Čas na fakturu s aplikací | `[ZMĚŘIT NA TEPO]` |

Čas s aplikací není nula, uživatel výstup kontroluje. Dokud není změřený, kalkulačka používá výchozí hodnotu 1 minuta na kontrolu a u výsledku píše, že jde o odhad.

### Tón textů
Lidský, klidný, věcný. Startup, ale ne hype. Stejný styl jako alteno.cz: krátké věty, konkrétní situace z provozu, říct věci na rovinu. Detailní pravidla jsou v části 9.

### Tvrzení k ověření
- „Pod vedením zkušených programátorů“ – použij jen pokud `site.ts` obsahuje `hasTeam: true`. Jinak varianta „Vývoj vede Kryštof Sobotka, autor Alteno a Vizeon.“
- Počet firem, od kterých jsme problém slyšeli: `[POČET NEBO VYNECHAT]`.

---

## 2. INSPIRACE – CO PŘEVZÍT A CO NE

Weby jsou inspirace pro principy, ne předloha ke kopírování. Nekopíruj texty, loga, barvy ani přesné rozložení.

### Claude Sonnet 5.5 (anthropic.com/claude-sonnet-5-5)
- **Převzít:** teplý světlý podklad a téměř černý text (ne čistě černý), hodně prostoru, klidná typografie. Číslovaný obsah stránky ve tvaru „(1) Úvod (2) Jak to funguje…“. Odstavce začínající tučným slovem („**Rychlost.** …“). Přepínač „před a po“ se stejnou úlohou ve dvou verzích. Graf „výsledek proti nákladům“ s přepínáním scénářů. Řada log, kde klik na logo přepne citaci. Poznámky pod čarou u čísel, odkud pochází.
- **Nepřebírat:** tabulky benchmarků a technický žargon. Účetní tomu nerozumí.

### Chase AI (chaseai.io)
- **Převzít:** blikající kurzor v nadpisu heru. Ukázka produktu přímo v heru (u nich editor kódu, u nás „záznam zpracování“ faktury). Každá výhoda s malou živou ukázkou UI místo ikony. Postup ve 4 krocích s velkými čísly a řádkem „Typicky: …“. Kontaktní formulář s ukazatelem vyplnění („2/7“), volbou přes čipy a postranním blokem „Co můžete čekat“.
- **Nepřebírat:** tmavý technický vzhled a příkazovou řádku. Náš „terminál“ je čitelný záznam pro účetní.

### Ben AI (benai.co)
- **Převzít:** stránka vedená zakladatelem, jednoduché logo, sdělení „bez hype“. Plynule běžící pás značek. Citace s fotkou a rolí.
- **Nepřebírat:** zeď cizích log. Máme jen vlastní značky, žádné klienty.

### Alteno – AI agenti a voice agenti (alteno.cz/sluzby/…)
Tohle je hlavní vzor pro animace a interakce.
- **Interaktivní demo „Přijde na stůl → zpracování → Odejde hotové“.** Vlevo seznam případů, uprostřed stav zpracování, vpravo výsledek. Než uživatel něco vybere, je tam text „Vyberte vlevo fakturu. Ukážu vám, co s ní aplikace udělá.“ Převezmi princip, ne kód.
- Číslované problémy „01 Pevný scénář…“, kroky „1 Napojení na vaše data“, výhody s počítadlem „01 / 05“.
- FAQ, které odpovídá na rovinu, včetně nepohodlných otázek.
- Závěrečná výzva „Projdeme spolu… a řeknu vám na rovinu, jestli se to vyplatí.“
- Tón: první osoba, konkrétní provoz, bez superlativů.

---

## 3. DESIGN SYSTÉM

Všechno jako tokeny v CSS proměnných a v `@theme` v `globals.css` (Tailwind 4 nemá `tailwind.config`). Žádné natvrdo zapsané barvy v komponentách.

### Barvy (návrh, schválit ve fázi 2)
| Token | Hodnota | Použití |
| --- | --- | --- |
| `paper` | `#F6F1E8` | hlavní podklad, teplý krémový („tělový“) |
| `paper-deep` | `#EDE5D8` | střídání sekcí, karty |
| `ink` | `#1A1916` | text, téměř černá |
| `ink-muted` | `#5E5A52` | sekundární text |
| `rule` | `#D9CFBF` | účetní linkování, oddělovače |
| `accent` | `#1F5C4A` | jediná akcentní barva: klíčová slova, graf, CTA |
| `accent-soft` | `#DCE8E1` | podtržení klíčových slov, pozadí razítka |
| `warn` | `#B4651E` | jen stav „podezřelá hodnota“: ikona, okraj, podklad. Ne pro běžný text. |
| `warn-ink` | `[NAVRHNOUT ve Fázi 2]` | text varování, tmavší odstín `warn` s kontrastem ≥ 4,5 : 1 na `paper` |
| `field-border` | `[NAVRHNOUT ve Fázi 2]` | okraje formulářových polí, kontrast ≥ 3 : 1 na podkladu (WCAG 1.4.11) |
| `error` | `#A33A2B` | jen chyby formuláře |

Poměr zhruba 85 % neutrální a 15 % akcent. Akcent nikdy nevyplňuje velké plochy. Ověř kontrast WCAG AA u každé kombinace, hlavně `accent` na `paper` a bílý text na `accent`. Tmavý režim teď neřeš.

**Kontrast podle analýzy Fáze 0 (orientačně, ověřit nástrojem ve Fázi 2):** `accent` na `paper` cca 7 : 1, bílá na `accent` cca 7,8 : 1, `ink-muted` na `paper-deep` cca 5,5 : 1, `error` na `paper` cca 5,8 : 1, vše v pořádku. `warn` na `paper` jen cca 3,9 : 1, proto na text nestačí a vzniká `warn-ink`. `rule` je dekorativní a jako okraj inputu nesplní 3 : 1, proto vzniká `field-border`.

### Typografie
- **Nadpisy:** serif s charakterem a plnou podporou češtiny, například `Fraunces` nebo `Instrument Serif`. Ověř, že písmo má `latin-ext` a správně vykreslí ř, ů, ě.
- **Text:** čitelný sans, například `Manrope` nebo `Geist`. Ne výchozí Inter bez úprav.
- **Čísla a záznam zpracování:** `JetBrains Mono` s tabulkovými číslicemi (`font-variant-numeric: tabular-nums`).
- Načítat přes `next/font` (self-hosting, žádný požadavek na Google, jednodušší CSP).
- Výrazný kontrast velikostí: hero nadpis `clamp(2.75rem, 6vw, 5.25rem)`, záměrně laděný tracking a line-height.

### Prostor a mřížka
- Mřížka 12 sloupců, ale sekce ji záměrně porušují (asymetrie, přesahy).
- Jemná mřížka a „načrtnuté“ grafy v pozadí vybraných sekcí, ne všude.
- Různé šířky obsahu podle sekce: text max 62ch, ukázky až 1200 px.

### Komponenty
- shadcn/ui jako základ pro Button, Input, Textarea, Checkbox, Form, Accordion, Slider, Tabs, Sheet, Tooltip. Všechny přestylovat přes tokeny.
- Ikony: `lucide-react`, tenká linka (strokeWidth 1.5), střídmě. Ikony dokumentů PDF a ISDOCX ve workflow (6.3) jsou vlastní SVG ve stejné tloušťce linky.
- Zvýraznění klíčových slov: vlastní komponenta `<Mark>`, podtržení v `accent-soft`, které se „dotáhne“ při vstupu do viewportu. Max 1–2 slova na sekci.

---

## 4. TECHNICKÝ STACK

- **Next.js 16 (App Router) + React + TypeScript (strict).** Rozhodnuto ve Fázi 0 místo původní verze 15. Middleware se v Next.js 16 jmenuje `proxy.ts`.
- **Správce balíčků:** npm.
- **Tailwind CSS** s vlastními tokeny.
- **shadcn/ui** (Radix) jako základ komponent.
- **Motion** (`motion/react`, dříve Framer Motion) pro animace.
- **React Hook Form + Zod** pro formulář. Stejné Zod schéma na klientu i serveru.
- **Odesílání formuláře:** Server Action nebo Route Handler + Resend. API klíč jen v proměnné prostředí na serveru, nikdy `NEXT_PUBLIC_`. Adresát: `[E-MAIL PRO POPTÁVKY]`.
- **Grafy:** vlastní SVG komponenta nebo Recharts. Preferuj vlastní SVG kvůli vzhledu „načrtnutého grafu“ a velikosti bundlu.
- **Hosting:** Vercel, tarif Hobby. Rozhodnuto ve Fázi 0. Podmínky Hobby nepovolují komerční použití. Zadavatel to ví a riziko přijímá, zápis patří do `.claude/security/DECISIONS.md`. Žádná funkce webu nesmí záviset na placeném tarifu.
- **Analytika:** zatím žádná. Pokud přibude, musí přibýt i cookie lišta.
- Bez zbytečných knihoven. Každou novou závislost zdůvodni v jedné větě.

Všechna proměnlivá data jsou v `src/config/site.ts`:

```ts
export const site = {
  name: "[NÁZEV]",
  domain: "[DOMÉNA]",
  ceo: "Kryštof Sobotka",
  email: "[E-MAIL]",
  phone: "+420 604 837 333",
  ico: "[IČO]",
  address: "[MÍSTO PODNIKÁNÍ]",       // pravděpodobně povinné podle § 435 OZ, ověřit
  showPrice: false,
  price: 35000,
  monthlyFee: null as number | null,   // [VÝŠE SPRÁVY]
  dataStaysOnPremise: null as boolean | null, // [ROZHODNOUT]
  hasTeam: null as boolean | null,     // [OVĚŘIT]
  caseStudy: null,                     // [TEPO – AŽ PO SOUHLASU]
  videoSrc: null as string | null,     // [VIDEO ZATÍM NENATOČENO]
  accountingPrograms: ["POHODA"],      // [DOPLNIT PO OVĚŘENÍ]
} as const;
```

Sekce s `null` hodnotou se zobrazí v poctivé náhradní podobě (viz část 6), nikdy s vymyšleným obsahem. `null` znamená „nerozhodnuto“ a chová se jako `false`: podmíněný obsah se nevykreslí. Text závislý na přepínači se renderuje podmíněně, ne skrytím přes CSS.

---

## 5. STRUKTURA – JEDNOSTRÁNKOVÁ LANDING PAGE

Jedna dlouhá stránka s kotvami. Odděleně jen právní stránky (`/ochrana-osobnich-udaju`, `/obchodni-podminky`) a vlastní `404`. Přechod na vícestránkový web je změna struktury. Neprováděj ji bez výslovného souhlasu.

### Navbar
- **Vlevo logo** (`[LOGO]` – zatím textové logo s názvem z `site.ts` a drobným znakem faktury s fajfkou, navrhni ve fázi 2).
- **Uprostřed odkazy na sekce:** Úspora (`#kalkulacka`), Jak to funguje (`#jak-to-funguje`), Na míru (`#na-miru`), O nás (`#kdo-za-tim-stoji`), Časté dotazy (`#faq`), Kontakt (`#kontakt`).
- **Vpravo** primární tlačítko „Kontaktní formulář“ → plynulý posun na `#kontakt` a fokus na první pole formuláře.
- **Statický navbar:** je na začátku stránky a při scrollu neputuje s obsahem (`position: static`), žádné „lepení“ ani zmenšování. `[OVĚŘIT – pokud zadavatel myslel pevný navbar nahoře, změní se jedna třída]`. Protože navbar při scrollu není vidět, každá sekce s vlastní výzvou má odkaz na kontakt a na konci stránky je výrazná závěrečná výzva.
- **Mobil:** hamburger otevře `Sheet` zprava se stejnými odkazy a tlačítkem „Kontaktní formulář“ dole. Fokus uzamčený v menu, zavření klávesou Esc.
- Přístupnost: odkaz „Přeskočit na obsah“ jako první prvek, `aria-current` u aktivní sekce není potřeba (navbar je statický).
- Kotvy počítají s `scroll-margin-top`, aby nadpis sekce nebyl nalepený na hranu okna.

### Pořadí sekcí
| # | Sekce | Kotva | Účel |
| --- | --- | --- | --- |
| 1 | Úvod (hero) | `#uvod` | do 3 sekund jasné, o čem stránka je |
| 2 | Proč to řešit | `#proc` | čtenář pozná svůj problém a uvidí, že dostane aplikaci |
| 3 | Kalkulačka úspor | `#kalkulacka` | čtenář si hned spočítá, kolik ho problém stojí |
| 4 | Jak to funguje | `#jak-to-funguje` | interaktivní demo, signature prvek |
| 5 | Co vám to přinese | `#prinos` | porovnání bez aplikace a s aplikací |
| 6 | Postaveno pro vaši firmu | `#na-miru` | individuální přístup, hlavní odlišení |
| 7 | Případová studie | `#pripadova-studie` | jen pokud existuje, jinak vynechat |
| 8 | Kdo za tím stojí | `#kdo-za-tim-stoji` | CEO, příběh, video, pás značek |
| 9 | Časté dotazy | `#faq` | odpovědi na rovinu |
| 10 | Kontakt | `#kontakt` | kontaktní údaje + formulář |
| – | Patička | – | odkazy na Alteno, Vizeon, ZakazIQ, právní stránky, IČO |

Důvod pořadí (změněno na pokyn zadavatele 2026-10-03): čtenář pozná problém, hned si spočítá, kolik ho stojí, pak pochopí řešení, uvidí, co se změní, a nakonec, že je postavené pro něj. Sekce 2 a 3 končí jednou větou s odkazem na další sekci. Odkazy na Alteno, Vizeon a ZakazIQ jsou až v sekci 8 a v patičce, ne v navbaru, aby čtenář neodešel dřív, než dočte nabídku.

---

## 6. SEKCE PODROBNĚ

Každá sekce má vlastní kompozici. Číslování „(01)“ až „(09)“ u štítků sekcí v monospace je převzatý princip ze stránky Sonnet a drží rytmus stránky. Čísla se počítají z pole viditelných sekcí, ne natvrdo. Skrytá případová studie tak nenechá v číslování díru.

### 6.1 Úvod (hero) – `#uvod`
- **Rozložení:** asymetrické, text vlevo na 5–6 sloupcích, vpravo živá ukázka „záznamu zpracování“ přesahující do další sekce.
- **Štítek nad nadpisem:** malý text, například „Startup pro účetní kanceláře“.
- **Nadpis (návrh):** „Faktury, které už nikdo nepřepisuje“ s blikajícím kurzorem na konci (`_`, CSS animace, vypnutá při `prefers-reduced-motion`).
- **Podnadpis (návrh):** „Postavíme vaší kanceláři aplikaci, která převede PDF, skeny i fotky faktur do ISDOC pro váš účetní program. Vy jen zkontrolujete a naimportujete.“
- **Akce:** primární tlačítko „Domluvit hovor“ → `#kontakt`. Vedle textový odkaz „Seznamte se s námi (2 min)“ s náhledem videa, **ale jen při `site.videoSrc !== null`**. Dokud video není, hero má jen tlačítko „Domluvit hovor“, aby nesliboval něco, co se po kliknutí nenaplní. Formulaci „s námi“ při doplnění videa sladit s `hasTeam`. Jen jedna hlavní výzva.
- **Obsah záznamu zpracování** je v initial HTML (SEO), postupně se jen odhaluje. LCP prvkem má být nadpis, ne animovaný záznam.
- **Ukázka vpravo – záznam zpracování:** čitelné řádky, které se postupně vypisují (zhruba 120 ms na řádek):
  ```
  faktura_dodavatel_0425.pdf        načteno
  Dodavatel, IČO, DIČ               vyčteno
  14 položek, 2 sazby DPH           vyčteno
  Součty a DPH                      ✓ sedí
  ISDOC pro POHODA                  připraveno k importu
  ```
  Nad záznamem štítek „Ukázka“. Řádky jsou ilustrativní, ne reálný provoz. Po dokončení se záznam zastaví, žádná nekonečná smyčka.
- **Pozadí:** účetní linkování a čísla tónem v tónu po stranách.

### 6.2 Proč to řešit – `#proc` (přepracováno 2026-10-03)
Jeden příběh ve čtyřech krocích. **Záměrně bez čísel**, „17 h“ ani „3–7 minut“ tu nejsou (nejde o změřená data). Hodiny a koruny si návštěvník spočítá v kalkulačce hned pod tím.
1. **Jak jsme na to přišli:** hlas zakladatele (rozjezd Alteno, obvolané účetní kanceláře, skoro všude to samé), s podpisem „Kryštof Sobotka, CEO“.
2. **Co se děje dnes:** nadpis „Každou fakturu dnes někdo přepisuje ručně.“ a tři krátké body ve velkém písmu (formáty, ISDOC, překlep). Vedle živá ukázka ručního přepisu: naskenovaná faktura a formulář účetního programu, kam se údaje vypisují znak po znaku. U částky se přehodí dvě číslice (12 480 → 12 840), doklad se uloží i s chybou. Bez razítka.
3. **Obrat:** „Proto vznikla Prvotka.“ a věta o individuálním přístupu a cíli ušetřit čas a peníze.
4. **Okno aplikace ve stylu Docker Desktop:** postranní menu (Faktury, Ke kontrole, Export ISDOCX, Archiv), do okna dopadne šest souborů a každý řádek ukáže jednu skutečnou funkci: vytěžení z PDF, skenu i fotky, převzetí přílohy ISDOC, upozornění „součet nesedí“, ochrana proti dvojímu zpracování. Po doběhnutí se dá filtrovat a klikem otevřít vytěžené údaje. Štítek „Ukázka s vymyšlenými daty“.
- Obě ukázky běží jednou při vstupu do viewportu, do 5 s, s tlačítkem „Přehrát znovu“. Při `prefers-reduced-motion` rovnou koncový stav.
- Na konci věta „Kolik hodin to stojí vaši kancelář? Spočítejte si to.“ s odkazem na kalkulačku.

### 6.3 Jak to funguje – `#jak-to-funguje` (SIGNATURE PRVEK)
Sekce má dvě části. Nahoře workflow, které jedním pohledem ukáže celý tok. Pod ním interaktivní demo, kde si návštěvník vyzkouší konkrétní případy.

#### Workflow „Od PDF faktury do účetnictví“
Napodobuje skutečný tok produktu: PDF faktura projde systémem, změní se na ISDOCX a skončí v účetním programu. Forma podle n8n: uzly (karty s ikonou a popiskem) spojené plynulými křivkami, po kterých putuje dokument. Z n8n se přebírá princip (uzly, spoje, stavy běhu), ne vzhled. Místo tmavého plátna s tečkovanou mřížkou je `paper` s účetním linkováním.

| # | Uzel | Ikona | Co se v uzlu ukáže |
| --- | --- | --- | --- |
| 1 | **PDF faktura** | vlastní SVG ikona dokumentu se štítkem „PDF“ | miniatura faktury, která vstoupí do workflow |
| 2 | **Prvotka** (systém) | logo produktu, do té doby textový znak z navbaru | vytěžení: pole se jedno po druhém vyplní (dodavatel, IČO, číslo faktury, datum, částka), pak stav „zkontrolováno“ |
| 3 | **ISDOCX** | vlastní SVG ikona dokumentu se štítkem „ISDOCX“, uvnitř strukturované řádky ve stylu `<isdoc:Invoice>` (navazuje na čísla v pozadí) | vznik strukturovaného dokumentu, PDF se v něj vizuálně promění |
| 4 | **Účetní program** | ikona z `lucide-react`, název programu jako text z `site.accountingPrograms` (POHODA, Money S3, ABRA, HELIOS, PREMIER system) | stav „připraveno k importu“. Žádné cizí logo. |

**Průběh:** uzel 1 se aktivuje → dokument putuje po spoji do uzlu 2 → vyplnění polí → z uzlu 2 vyjede ISDOCX (uzel 3) → putuje do uzlu 4 → „připraveno k importu“. Aktivní úsek spoje se dotáhne v `accent` (`pathLength`), putující dokument je miniatura ikony.

**Poctivost uzlu 4:** import provádí účetní (část 1: „Vy jen zkontrolujete a naimportujete“). Workflow nesmí vyznít jako automatické zaúčtování. Popisek u uzlu 4 to řekne, například „Vy zkontrolujete a naimportujete“.

**Spouštění:** jeden běh při vstupu sekce do viewportu, pak se zastaví na výsledku (všechny uzly „hotovo“). Znovu se spustí tlačítkem „Spustit znovu“ nebo při dalším vstupu do viewportu. Žádná nekonečná smyčka (část 7). Běh je řízený stavovým automatem (`idle → pdf → extracting → isdocx → ready`) jako demo.

**Interaktivita:** hover, fokus nebo klik na uzel zobrazí krátký popis kroku (texty v `src/content/cs.ts`, přes `humanize-text-cs`). Klik během běhu běh pozastaví. Pokud běh trvá déle než 5 s, je u workflow i tlačítko „Pauza“ (WCAG 2.2.2).

**Data:** hodnoty v polích jsou vymyšlené jako v demu („Dodavatel s.r.o.“, IČO 12345678) se štítkem „Ukázka“. Žádný čas zpracování ani počet faktur.

**Přístupnost a responzivita:** kroky jsou v HTML jako `<ol>`, uzly jsou jeho položky. Spoje a putující dokument mají `aria-hidden`. Od 1024 px vodorovně, pod 1024 px svisle se spoji shora dolů, na 360 px bez vodorovného scrollu. Pevná výška kontejneru, žádný layout shift. Při `prefers-reduced-motion` rovnou koncový stav se všemi uzly, spoji a popisy.

#### Interaktivní demo
Podle Alteno, převedené na faktury. Tři sloupce, na mobilu pod sebou:

1. **„Přijde na stůl“** – výběr případu (tlačítka, ovladatelná klávesnicí):
   - Faktura v PDF – *běžná faktura od dodavatele*
   - Sken z kanceláře – *naskenovaný papír*
   - Fotka z telefonu – *klient poslal fotku*
   - Faktura s ISDOC přílohou – *data už v ní jsou*
   - Faktura s chybou v DPH – *součet nesedí*
2. **„Aplikace zpracuje“** – stav s kroky, které se postupně odškrtávají. Výchozí text: „Vyberte vlevo fakturu. Ukážu vám, co s ní aplikace udělá.“
3. **„Odejde hotové“** – výsledek:
   - běžné případy: náhled vytěžených polí a „ISDOC připraven k importu“ s razítkem „Součty sedí“,
   - ISDOC příloha: „Data převzata z přílohy, nic se nevytěžovalo znovu“,
   - chyba v DPH: oranžové upozornění „Součet položek nesedí s celkovou částkou. Zkontrolujte před importem.“ Tohle je nejdůležitější případ, ukazuje, že aplikace hlídá.

Pod demem štítek „Ukázka s vymyšlenými daty“. Tři kroky textem pod demem nejsou, celý tok ukazuje workflow nad demem. Všechna data v demu jsou vymyšlená a smyšlené firmy nesmí kolidovat se skutečnými (například „Dodavatel s.r.o.“, IČO 12345678).

### 6.4 Postaveno pro vaši firmu – `#na-miru`
- Nadpis (návrh): „Aplikace navržená přesně pro vaši kancelář“ (2026-10-03).
- Pod úvodem postup ve čtyřech krocích (2026-10-03): projdeme, jak k vám faktury chodí → nastavíme aplikaci na váš program a zvyklosti → vyzkoušíme ji na vašich fakturách → zaškolíme vás. Jen fakta z části 1.
- Pět bodů z části 1 („Proč na míru“) jako výhody s počítadlem „01 / 05“ ve stylu Alteno. U každého bodu malá živá ukázka UI místo ikony (styl Chase AI), například:
  - výstup pro váš program: přepínač programů, který mění štítek exportu,
  - mapování polí: řádek „Středisko → 200 Praha“,
  - žádný poplatek za doklad: počítadlo faktur, u kterého se cena nemění.
- Text o datech podle `dataStaysOnPremise` (část 1). Při `null` tento bod vynech.

### 6.5 Co vám to přinese – `#prinos`
Porovnání bez aplikace a s aplikací jako tabulka se dvěma sloupci. Inspirace přepínačem „před a po“ ze Sonnet: na mobilu přepínač Tabs „Ručně / S aplikací“.

Řádky s časy (3–7 min, cca 17 h) se 2026-10-03 vypustily, časy a peníze počítá kalkulačka nad touto sekcí. Tabulka je kvalitativní.

| | Ruční přepis | S aplikací |
| --- | --- | --- |
| Co s fakturou děláte | přepisujete ji | kontrolujete, co aplikace vyčetla |
| Kontrola součtů a DPH | ručně | automaticky před exportem |
| Dohledání faktury | v e-mailech a složkách | podle dodavatele, čísla nebo data |
| Dvojí zpracování | hrozí | aplikace hlídá |
| Archiv | roztroušený | originál, data a ISDOC na jednom místě |

Řádek s náklady jen při `showPrice: true`.

### 6.6 Kalkulačka úspor – `#kalkulacka`
- Vstupy (shadcn Slider + číselné pole, obě synchronizované):
  - faktur měsíčně: 50–3 000, výchozí 200,
  - minut na ruční přepis: 3–7, výchozí 5,
  - hodinový náklad práce: 250–600 Kč, výchozí 350,
  - minut na kontrolu s aplikací: 0,5–3, výchozí 1 (štítek „odhad, ověřujeme měřením“).
- Výstupy (2026-10-03): velké číslo „Úspora ročně“, přepočet na osmihodinové pracovní dny a výkaz se třemi řádky: ruční přepis dnes, kontrola s aplikací, rozdíl (hodin měsíčně, Kč měsíčně, Kč ročně). Hlavní vstup je počet faktur, ostatní vstupy jsou „Vaše předpoklady“. Pokud `showPrice`, i návratnost v měsících včetně správy.
- Graf (přestavěný 2026-10-03): kumulativní náklad na faktury v čase, dvě čáry „ruční přepis dnes“ a „s aplikací“ (kontrola, při `showPrice` i cena a správa), plocha mezi nimi je úspora. Při `showPrice` je návratnost průsečík obou čar. Nad grafem výkaz pro vybraný měsíc, měsíc se vybírá myší, dotykem i šipkami. Vlastní SVG s rovnými čarami (nepravidelná „načrtnutá“ linka zrušena, u přesného výpočtu vypadala jako šum). Osa Y se přepočítá jen při velké změně, aby bylo vidět, jak čáry rostou.
- Posuvník faktur je nelineární (do 300 po 10, do 1 000 po 25, dál po 100), číselné pole přijme libovolnou hodnotu 50–3 000.
- Volitelný přepínač „Porovnat s poplatkem za doklad“: uživatel zadá cenu za doklad (výchozí 4 Kč) a graf ukáže, od kolika faktur měsíčně vychází aplikace levněji. Konkurenty nejmenuj. Srovnání počítá s viditelně uvedeným časovým horizontem (například 24 měsíců).
- **Při `showPrice: false`** (rozhodnuto ve Fázi 0): čára investice i bod návratnosti by prozradily cenu. Graf proto ukáže jen náklad dnes a s aplikací (kontrola) v čase, bez investice a bez návratnosti, a přepínač „Porovnat s poplatkem za doklad“ se nevykreslí. `savings.ts` počítá obě varianty, rozhoduje jen render.
- **Výchozí výsledek je záměrně nižší než „5 000–7 000 Kč“ z tabulky v části 1.** Při 200 fakturách × (5 min − 1 min kontrola) × 350 Kč/h vyjde cca 4 670 Kč měsíčně, protože kalkulačka odečítá čas na kontrolu a tabulka TEPO ne. Je to správně a poctivě. Neupravovat. Poznámka pod čarou vysvětluje odečet kontroly, rozsah z nabídky TEPO už nezmiňuje (2026-10-03).
- Pokud čas na kontrolu dosáhne času na ruční přepis, úspora je 0, nikdy záporná. Pokud úspora nepokryje měsíční správu, návratnost se nezobrazí.
- Pod kalkulačkou poznámka pod čarou: odkud jsou výchozí hodnoty a že jde o modelový výpočet, ne garanci.
- Výpočet je čistá funkce v `src/lib/savings.ts` s unit testy (Vitest). Žádné zaokrouhlování v průběhu, až na výstupu.

### 6.7 Případová studie – `#pripadova-studie`
- Při `site.caseStudy === null` se sekce **nezobrazí** a odkaz na ni není nikde.
- Až bude: výchozí stav, změřený čas na fakturu před a po, výsledek, citace se souhlasem. Čísla jen změřená.

### 6.8 Kdo za tím stojí – `#kdo-za-tim-stoji`
- **CEO Kryštof Sobotka:** fotka `[FOTO – placeholder]`, role, 2–3 věty příběhu v první osobě: volání účetním při rozjezdu Alteno, skoro všude stejný problém, zkušenost z Vizeonu a Alteno, cíl ušetřit kanceláři čas a peníze.
- **Video (2 min):** klikací náhled s plakátem a délkou „2:00“, přehrání až po kliknutí, nikdy automaticky. Při `videoSrc === null` placeholder rámeček s textem „Video připravujeme“. Formát: self-hosted MP4/WebM s titulky (`<track>`), nebo YouTube přes `youtube-nocookie.com` načtený až po kliknutí. Zvolenou variantu zapiš do CSP.
- **Pás značek:** plynule běžící pás (CSS animace, pauza při najetí myší, při `prefers-reduced-motion` statický řádek). Nadpis „Značky za produktem“, nikdy „S kým spolupracujeme“. Obsah:
  - Alteno – automatizace firemních procesů → alteno.cz
  - Vizeon – weby a aplikace na míru → vizeon.cz
  - ZakazIQ – klientský rezervační systém → zakaziq.cz
  - U každé značky její logo (lokální SVG v `public/brands/`, doplněno 2026-10-03).
- Loga značek Alteno, Vizeon a ZakazIQ jsou v `public/brands/` (převzatá z webů značek, 2026-10-03). Loga klientů jen se souhlasem, zatím žádná.

### 6.9 Časté dotazy – `#faq`
shadcn Accordion, přestylovaný. Odpovídej na rovinu. Kde odpověď neznáme, nech placeholder a otázku zobraz až po doplnění (`published: false`).

| Otázka | Odpověď / stav |
| --- | --- |
| Co je ISDOC a proč ho potřebuji? | Český formát elektronické faktury, který účetní programy jako POHODA umí naimportovat. |
| Funguje to i se skeny a fotkami? | Ano, kromě PDF zpracuje i obrázky a skeny. |
| Co když faktura ISDOC už obsahuje? | Aplikace ho jen vytáhne a znovu nevytěžuje. |
| Co když aplikace údaj přečte špatně? | Před exportem kontroluje součty a DPH a upozorní na podezřelé hodnoty. Výstup vždy kontrolujete vy, odpovědnost za účetní údaje zůstává u vás. |
| Kam odchází data mých klientů? | `[podle dataStaysOnPremise]` |
| Které účetní programy podporujete? | `[podle accountingPrograms]` |
| Kolik to stojí? | při `showPrice`: 35 000 Kč jednorázově (nejsem plátce DPH) + správa `[X]` Kč měsíčně, bez poplatku za doklad. Jinak „Cenu řekneme na rovinu v prvním hovoru.“ |
| Jak dlouho trvá nasazení? | `[DOPLNIT]` |
| Co je v ceně? | Nasazení na server, test na vašich reálných fakturách, zaškolení. |
| Co když nás to omezí? Můžeme skončit? | `[DOPLNIT podle smlouvy o správě]` |

FAQ dostane `FAQPage` schema (část 10), ale jen s publikovanými otázkami.

### 6.10 Kontakt – `#kontakt`
Viz část 8.

### 6.11 Patička
Název, krátká věta o produktu, odkazy na sekce, Alteno, Vizeon, ZakazIQ, právní stránky, „Kryštof Sobotka · `[MÍSTO PODNIKÁNÍ]` · IČO 29977231 · nejsem plátce DPH“, rok. Smluvní stranou je OSVČ, to musí být v patičce i v obchodních podmínkách jasné. Místo podnikání je podle § 435 občanského zákoníku pravděpodobně povinný údaj, ověřit.

---

## 7. ANIMACE A INTERAKCE

Zásada: každá animace vysvětluje, co produkt dělá, nebo vede pozornost k jedné akci. Nic jiného se nehýbe.

**Povolené animace:**
- Hero: blikající kurzor, postupné vypisování záznamu zpracování.
- Proč to řešit (6.2, 2026-10-03): ruční přepis znak po znaku s překlepem a okno aplikace, do kterého dopadnou soubory a doběhnou stavy. Obojí jeden běh do 5 s, pak klid, „Přehrát znovu“.
- Čísla a obrysy souborů v pozadí (PDF, ISDOCX, IČO, DIČ, `<isdoc:Invoice>`) v Úvodu, v Proč to řešit a v kalkulačce.
- Workflow v sekci 3 (6.3): jeden běh PDF → systém → ISDOCX → účetní program při vstupu do viewportu, pak zastavení na výsledku. Znovu přes „Spustit znovu“ nebo při dalším vstupu do viewportu. Není to nekonečná smyčka.
- Demo v sekci 3: přechody stavů mezi sloupci (posun „faktury“ zleva doprava, odškrtávání kroků, otisk razítka). Celé řízené stavovým automatem (`idle → reading → checking → done | warning`), ne časovači rozesetými po komponentách.
- Zvýraznění klíčových slov `<Mark>`: podtržení se dotáhne zleva doprava při vstupu do viewportu, jednou.
- Kalkulačka: plynulá změna čísel (tween max 300 ms) a překreslení grafu.
- Pás značek: plynulý běh, pauza při hoveru.
- Hover stavy přizpůsobené obsahu (u tlačítka „Kontaktní formulář“ například jemný posun šipky), ne obecné `scale-105`.
- Čísla v pozadí: parallax max 8 px, jen na desktopu.

**Zakázané:** fade-in + slide-up na každém bloku, nekonečné smyčky (kromě pásu značek), automaticky spouštěné video, animace blokující obsah při načtení, scroll-jacking.

**Technicky:**
- `motion/react` s `LazyMotion` a `domAnimation`, aby animace nenafoukly bundle.
- Respektuj `prefers-reduced-motion`: všechny animace mají statickou variantu, demo funguje bez animací (přímo ukáže výsledek).
- Animuj jen `transform` a `opacity`.
- Interaktivní prvky ovladatelné klávesnicí, stav dema oznamovaný přes `aria-live="polite"`.
- Plynulost na mobilu: žádné pády pod 60 fps na střední třídě telefonů, ověř v DevTools s 4× CPU throttlingem.

---

## 8. KONTAKTNÍ SEKCE A FORMULÁŘ – `#kontakt`

### Rozložení
Dva sloupce (na mobilu pod sebou, formulář první):
- **Vlevo:** nadpis (návrh: „Postavím aplikaci přesně pro vaši kancelář“), bez perexu (na pokyn zadavatele), kontaktní údaje (Kryštof Sobotka, CEO · e-mail · telefon · IČO), fotka `[FOTO]`. Pod tím blok **„Co můžete čekat“** (styl Chase AI). Obsah jen z ověřených faktů: `[DOBA ODPOVĚDI]`, `[DÉLKA ÚVODNÍHO HOVORU]`, „Nezávazně“. Neověřené body nezobrazuj.
- **Vpravo:** formulář na podkladu `paper-deep`, s ukazatelem vyplnění „Vyplněno 3/6“ (počítají se jen povinná pole).

### Pole
| Pole | Typ | Povinné | Validace |
| --- | --- | --- | --- |
| Jméno a příjmení | text | ano | 2–100 znaků |
| Firma / kancelář | text | ano | 2–150 znaků |
| E-mail | email | ano | formát e-mailu |
| Telefon | tel | ano | české i mezinárodní číslo, 9–15 číslic |
| Faktur měsíčně | čipy | ano | do 200 · 200–600 · 600–1 500 · 1 500+ |
| Účetní program | čipy | ano | POHODA · Money S3 · ABRA · Jiný (při „Jiný“ se zobrazí textové pole). Popisek neutrální („Jaký účetní program používáte?“). Čipy jsou otázka na návštěvníka, ne tvrzení o podpoře, podporované programy jsou jen v `site.accountingPrograms`. |
| Zpráva | textarea | ne | max 2 000 znaků |
| Honeypot | skryté pole | – | musí zůstat prázdné |

Pod tlačítkem odeslat je informační věta „Odesláním formuláře berete na vědomí, jak zpracovávám osobní údaje.“ s odkazem na `/ochrana-osobnich-udaju`. Bez zaškrtávátka, zpracování nestojí na souhlasu (čl. 6 odst. 1 písm. b) a f) GDPR).

### Chování
1. Validace na klientu (React Hook Form + Zod) i na serveru (stejné schéma). Server nikdy nevěří klientu.
2. Odeslání přes Server Action nebo Route Handler. Resend API klíč jen v `RESEND_API_KEY` na serveru.
3. Ochrana proti spamu: honeypot + kontrola minimální doby vyplnění (alespoň 3 s) + rate limit na IP. Limit v paměti na Vercelu nefunguje, každá serverless instance má vlastní paměť. Postup: ve Fázi 6 ověřit, co nabízí Vercel Firewall na tarifu Hobby zdarma. Když to nestačí, Upstash Redis na bezplatném tarifu (nová závislost a účet, jen se souhlasem zadavatele). Honeypot a kontrola 3 s běží vždy. Cloudflare Turnstile jen pokud to bude potřeba, protože přidává CSP výjimky.
4. Stavy: výchozí, odesílání (tlačítko zablokované, indikátor), úspěch (poděkování v místě formuláře, ne alert), chyba (srozumitelná hláška + nabídka napsat e-mailem). Po úspěchu reset formuláře.
5. Vstupy z formuláře se v e-mailu escapují. Nikdy je nevykresluj jako HTML.
6. E-mail s poptávkou jde na `[E-MAIL PRO POPTÁVKY]`. Předmět: „Poptávka: {firma} ({faktur měsíčně})“. Odesílatel z ověřené domény `[DOMÉNA PRO RESEND]`.
7. Volitelně potvrzovací e-mail odesílateli `[ROZHODNOUT]`.
8. Formulář je celý ovladatelný klávesnicí, chyby přes `aria-describedby`, fokus po chybě na první chybné pole.
9. Před nasazením formulář **skutečně otestuj** odesláním a ověř, že e-mail dorazil.

Klikem na „Kontaktní formulář“ v navbaru se stránka posune sem a fokus dostane první pole.

---

## 9. PRAVIDLA PRO TEXTY

Texty jsou česky, lidsky a přirozeně. Použij skill `humanize-text-cs` na každý text, než ho dáš do stránky. Hlavní pravidla:
- Žádné pomlčky jako spojka uprostřed věty. Raději tečka nebo čárka.
- Žádné fráze „nicméně“, „v neposlední řadě“, „je důležité poznamenat“, „nejde jen o X, ale i o Y“, „klíčový“, „revoluční“.
- Žádné trojice „rychlé, efektivní a spolehlivé“.
- Střídat krátké a delší věty. Mluvit v první osobě tam, kde mluví zakladatel.
- Tučné písmo uvnitř věty jen jako vědomý stylový prvek („**Rychlost.** …“ na začátku odstavce), ne náhodně.
- Konkrétní situace z kanceláře místo obecných slibů.
- Startupová řeč ano, superlativy ne. „Mění hru“ jen tam, kde to hned podloží konkrétní věc.
- Čísla jen z části 1. Každé číslo má na stránce zdroj nebo poznámku pod čarou.
- Všechny texty v jednom souboru `src/content/cs.ts`, aby je šlo upravit bez sahání do komponent.

---

## 10. SEO

Jako kontrolu před dokončením (část 13) použij skilly `seo-quality-principles`, `seo-technical` a `seo-schema`. Původně zmíněný `seo-ai-risk-guard` neexistuje, náhradu odsouhlasil zadavatel ve Fázi 0. K tomu:

- **Klíčová slova:** zadavatel je zatím nedodal. **Nevymýšlej je.** Až dodá seznam z Collabimu nebo jiného nástroje, použij skill `seo-collabim-keyword-loop` nebo `seo-keyword-cluster-architect`. Do té doby piš title, H1 a description podle produktu a označ je v `memory/memory.md` jako „čeká na klíčová slova“.
- Jedna stránka zatím nesplní víc vyhledávacích záměrů. Pokud seznam slov ukáže potřebu dalších stránek (například návody o ISDOC), navrhni to, ale strukturu neměň bez souhlasu.
- Metadata přes `generateMetadata`/`metadata` v App Routeru: unikátní title (do 60 znaků), description (150–160 znaků), canonical, Open Graph a Twitter karty, `og:image` generovaný přes `opengraph-image.tsx` ve stylu webu, `lang="cs"`, `og:locale` `cs_CZ`. `opengraph-image.tsx` musí načíst font jako soubor s `latin-ext`, jinak rozbije ř, ů, ě.
- `app/sitemap.ts` a `app/robots.ts`.
- JSON-LD: `Organization` (nebo `ProfessionalService`), `SoftwareApplication` popisující produkt, `FAQPage` jen s publikovanými otázkami. Ceny v schématu jen při `showPrice`.
- Přesně jeden `<h1>`, logická hierarchie `h2`/`h3`, popisné `alt` u obrázků i placeholderů.
- Obsah musí být v initial HTML (Server Components). Interaktivní části jako Client Components, ale texty sekcí renderuj na serveru.

---

## 11. BEZPEČNOST, PŘÍSTUPNOST, VÝKON, PRÁVO

### Bezpečnost
Použij skill `web-security-setup` ve fázi 1 a skill `web-security-audit` po nasazení. Zkráceně:
- Kompletní sada bezpečnostních hlaviček (HSTS bez `preload` na začátku, CSP, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP, CORP, X-XSS-Protection 0). `poweredByHeader: false`.
- CSP od prvního dne vynucující (je to nový projekt). `script-src` bez `unsafe-inline` a `unsafe-eval`; pokud je potřeba inline skript, jen přes nonce a `strict-dynamic`. Každá povolená doména (Resend se volá ze serveru, takže v CSP být nemusí; video, Turnstile) má řádek v `.claude/security/CSP-LOG.md`.
- **Nonce CSP v `proxy.ts`** (rozhodnuto ve Fázi 0). Per-request nonce znamená dynamický render stránek, žádné statické HTML na CDN. TTFB bude o něco vyšší, Lighthouse ≥ 90 to neohrozí. Pokud by Performance nevyšla, záloha je `experimental.sri` (hash). Zápis do `DECISIONS.md`.
- **`style-src 'self' 'unsafe-inline'`** je vědomá výjimka: Motion i `next/image` renderují `style=""` atributy už na serveru a nonce na atributy nefunguje. Výjimka jen ve `style-src`, nikdy ve `script-src`. Zápis do `DECISIONS.md`.
- JSON-LD skript dostane nonce.
- `.gitignore` s `.env*`, `security.txt` s platným `Expires`, CI workflow.
- Paměť `.claude/security/` (STATE, DECISIONS, CSP-LOG, AUDIT-LOG), `AGENTS.md` v kořeni a bezpečnostní blok v `CLAUDE.md` (už je připravený).
- DNS (CAA, DNSSEC, SPF, DMARC) jen sepiš jako úkol pro zadavatele, sám je nenastavuj.

### Přístupnost
- WCAG 2.2 AA: kontrast, ovládání klávesnicí, viditelný fokus (vlastní styl v `accent`, ne odstranění outline), `aria-live` u dema a formuláře, popisky polí.
- Všechny animace respektují `prefers-reduced-motion`.

### Výkon
- Lighthouse Performance ≥ 90 a SEO ≥ 95 na mobilu, změřené, ne odhadnuté.
- LCP pod 2,5 s, CLS pod 0,1. Placeholdery a obrázky mají pevný `aspect-ratio`.
- Obrázky přes `next/image` (AVIF/WebP), fonty přes `next/font`, video načtené až po kliknutí.
- Žádné render-blocking skripty třetích stran.

### Právo
- Stránky `/ochrana-osobnich-udaju` a `/obchodni-podminky` jako placeholder s jasným nápisem „Text doplní zadavatel“. **Právní texty negeneruj.**
- **Placeholder stačí jen do produkce.** Formulář sbírá osobní údaje, takže skutečný text ochrany osobních údajů (GDPR, čl. 13) je **blokér Fáze 9**. Bez něj se web s živým formulářem nenasazuje.
- Cookie lišta jen tehdy, pokud přibudou jiné než nezbytné cookies. Teď žádná není potřeba.
- Údaje o podnikateli (jméno, IČO, neplátce DPH) v patičce.

---

## 12. FÁZE IMPLEMENTACE

Každá fáze končí zastavením. Napiš krátké shrnutí (co je hotové, co jsi rozhodl a proč, co čeká na zadavatele), aktualizuj `memory/memory.md` a počkej na „schvaluji“. Bez schválení nepokračuj.

### Fáze 0 – Orientace (bez kódu)
- Přečti `PROJECT-BRIEF.md` a `CLAUDE.md` celé.
- Vypiš všechny `[PLACEHOLDERY]` a rozděl je na blokující pro další fáze a neblokující.
- Polož maximálně 5 otázek, bez kterých nejde začít. Nic nevymýšlej.
- **Výstup:** seznam otázek a potvrzení, že rozumíš zadání. Stop.
- **Stav:** proběhla 2026-10-02. Rozhodnutí jsou v úvodu („Změny ve verzi 1.1“) a v `memory/memory.md`.

### Fáze 1 – Základ projektu a bezpečnost
- `git init` ve složce projektu, `.gitignore`. Soukromé GitHub repo a push až se souhlasem zadavatele.
- `create-next-app` s Next.js 16 (TypeScript, App Router, Tailwind, ESLint, `src/`, npm), shadcn/ui init, Motion, React Hook Form, Zod, `@hookform/resolvers`, `lucide-react`, Vitest.
- Struktura složek: `src/app`, `src/components/sections`, `src/components/ui`, `src/components/motifs`, `src/components/demo`, `src/config/site.ts`, `src/content/cs.ts`, `src/lib`.
- Skill `web-security-setup`: hlavičky, nonce CSP v `proxy.ts` (asset skillu `middleware.ts` přejmenovat), `.gitignore`, `security.txt`, `.claude/security/` (do `DECISIONS.md` hosting Hobby, nonce a dynamický render, `style-src`), `AGENTS.md`, CI.
- **Hotovo, když:** `npm run build` projde bez chyb a varování, lokálně jdou vidět hlavičky.

### Fáze 2 – Design systém a kostra
- Tokeny barev, typografie, prostoru. Fonty přes `next/font`.
- Motivy: účetní linkování, čísla v pozadí, razítko, `<Mark>`.
- Navbar (logo vlevo, odkazy, tlačítko „Kontaktní formulář“ vpravo, mobilní Sheet) a patička.
- Interní stránka `/styleguide` (v produkci `noindex`, nebo odstranit před nasazením) se všemi tokeny a komponentami.
- **Hotovo, když:** zadavatel schválí barvy, písma, logo a motiv na `/styleguide`. Tohle je nejdůležitější schválení celého projektu.

### Fáze 3 – Hero, Proč to řešit, Jak to funguje
- Sekce 6.1–6.3 včetně záznamu zpracování, workflow PDF → ISDOCX → účetní program a interaktivního dema se stavovým automatem.
- **Hotovo, když:** workflow i demo fungují myší, klávesnicí, na mobilu i se sníženými animacemi a návštěvník do 3 sekund pozná, o čem stránka je.

### Fáze 4 – Na míru, Přínos, Kalkulačka
- Sekce 6.4–6.6. Výpočty v `src/lib/savings.ts` s unit testy.
- **Hotovo, když:** testy kalkulačky prochází a čísla odpovídají tabulce v části 1 (200 faktur × 5 min = cca 17 h).

### Fáze 5 – Kdo za tím stojí, FAQ, případová studie
- Sekce 6.7–6.9 a patička. Video placeholder, pás značek, FAQ s `published` příznaky.
- **Hotovo, když:** žádná sekce neukazuje vymyšlený obsah a všechny placeholdery jsou viditelně označené.

### Fáze 6 – Kontakt a formulář
- Sekce 6.10 podle části 8, serverové odeslání, ochrana proti spamu, všechny stavy.
- **Hotovo, když:** formulář na náhledovém nasazení skutečně odešle e-mail, server odmítne nevalidní data a honeypot funguje.

### Fáze 7 – Doladění
- Mikrointerakce, rytmus sekcí, typografické detaily, responzivita na 360 / 768 / 1024 / 1440 px.
- Kontrola proti části 0: projdi stránku sekci po sekci a u každé napiš jednou větou, proč nepůsobí šablonovitě. Kde to neumíš obhájit, přepracuj.
- Texty přes `humanize-text-cs`.
- **Hotovo, když:** zadavatel schválí celkový dojem na náhledovém nasazení.

### Fáze 8 – SEO, přístupnost, výkon
- Skilly `seo-quality-principles`, `seo-technical` a `seo-schema` bod po bodu, metadata, sitemap, robots, JSON-LD.
- Lighthouse na mobilu, kontrola klávesnicí, čtečka obrazovky na demu a formuláři.
- **Hotovo, když:** Definition of Done (část 13) je splněná, nebo jsou výjimky výslovně vypsané.

### Fáze 9 – Nasazení a audit
- **Předpoklady (blokery):** text ochrany osobních údajů, IČO, místo podnikání, e-mail pro poptávky a pro `security.txt`, doména, ověřená doména v Resend (SPF, DKIM, DMARC jako úkol pro zadavatele).
- Nasazení na Vercel (Hobby), proměnné prostředí, doména.
- Skill `web-security-audit` proti produkční URL, výsledek do `AUDIT-LOG.md`.
- Odstranit nebo zneplatnit `/styleguide`.
- Aktualizovat `memory/memory.md` a `.claude/security/STATE.md`.
- **Výstup:** produkční URL, výsledek auditu, seznam otevřených bodů (typicky HSTS preload, DNS, klíčová slova).

---

## 13. DEFINITION OF DONE

Stránka je hotová, až když platí všechno:

1. `curl -s <url> | grep -i "<title>"` vrací správný title, obsah sekcí je v initial HTML.
2. `sitemap.xml` a `robots.txt` jsou dostupné na produkční URL.
3. Title, description, canonical a Open Graph jsou nastavené, `og:image` se vykreslí.
4. Lighthouse na mobilu: SEO ≥ 95, Performance ≥ 90, Accessibility ≥ 95. Změřeno.
5. JSON-LD validní v Rich Results Test.
6. Jeden `<h1>`, žádný obrázek bez `alt`.
7. Formulář na produkci skutečně doručil testovací e-mail.
8. V konzoli žádné chyby ani porušení CSP, a to v Chrome i Safari.
9. Bezpečnostní audit bez chyb, varování vypsaná v `AUDIT-LOG.md`.
10. Žádný vymyšlený údaj. Každý `[PLACEHOLDER]` je buď doplněný, nebo viditelně označený a zapsaný v `memory/memory.md`.
11. Stránka funguje bez animací (`prefers-reduced-motion`) a celá jde ovládat klávesnicí.

Pokud něco z toho splněné není, řekni to zadavateli výslovně. Neschovávej to jako drobnost.

---

## 14. JAK TENHLE BRIEF POUŽÍVAT

1. Vytvoř prázdný repozitář, do kořene dej `PROJECT-BRIEF.md` a `CLAUDE.md`.
2. Ověř, že má Claude Code k dispozici skilly `web-security-setup`, `web-security-audit`, `seo-quality-principles`, `seo-technical`, `seo-schema`, `seo-keyword-cluster-architect` a `humanize-text-cs` (případně `frontend-design` a `design-taste-frontend`).
3. První zpráva pro Claude Code:
   > Přečti PROJECT-BRIEF.md a CLAUDE.md. Proveď fázi 0 a zastav se.
4. Každá další zpráva:
   > Schvaluji fázi N. [případné připomínky] Pokračuj fází N+1 a zastav se.
5. Když se změní zadání (název, cena, rozhodnutí o datech), uprav `src/config/site.ts` a napiš to Claude Code. Brief přepisuj jen při velké změně a pak zkontroluj, jestli změna nekoliduje s jinou částí dokumentu.

---

**Poznámka pro Claude Code:** Piš čistý, okomentovaný kód s konzistentním pojmenováním. Struktura musí umožnit doplnit fotky, video, logo, název a texty bez zásahu do komponent. Když narazíš na rozpor mezi tímto briefem a pokynem zadavatele, upozorni na něj dřív, než cokoli změníš.