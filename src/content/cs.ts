import { site } from "@/config/site";
import { deepTypo } from "@/lib/typography";

/**
 * Všechny texty webu v jednom souboru (brief, část 9).
 *
 * Pravidla pro úpravy:
 * - Čísla jen z briefu (část 1). Každé číslo má na stránce zdroj nebo poznámku.
 * - Žádné pomlčky jako spojka uprostřed věty, žádné „nicméně“, „klíčový“, „revoluční“.
 * - Neznámý údaj zůstává jako `[PLACEHOLDER]` a na stránce je vidět.
 * - Texty závislé na přepínačích v `site` se vybírají tady, komponenty je jen vykreslí.
 * - Nové texty projdou skillem `humanize-text-cs`.
 */

const programs = site.accountingPrograms.join(", ");
const mainProgram = site.accountingPrograms[0] ?? "[ÚČETNÍ PROGRAM]";

const teamLine = site.hasTeam
  ? "Pod vedením zkušených programátorů."
  : "Vývoj vede Kryštof Sobotka, autor Alteno a Vizeon.";

const priceLine = `${new Intl.NumberFormat("cs-CZ").format(site.price)} Kč jednorázově (nejsem plátce DPH)`;
const feeLine =
  site.monthlyFee === null
    ? "správa [VÝŠE SPRÁVY] Kč měsíčně"
    : `správa ${new Intl.NumberFormat("cs-CZ").format(site.monthlyFee)} Kč měsíčně`;

/** Text o datech ve dvou variantách (brief, část 1). Při `null` se bod nevykreslí. */
const dataPromise =
  site.dataStaysOnPremise === true
    ? {
        title: "Faktury neopustí vaši firmu",
        text: "Aplikace běží na vašem serveru a faktury zpracovává u vás. Data vašich klientů nikam neposíláme.",
        faq: "Nikam. Aplikace běží na vašem serveru a faktury zpracovává u vás.",
      }
    : site.dataStaysOnPremise === false
      ? {
          title: "Víte, kudy data tečou",
          text: "Údaje z faktur čte AI služba [NÁZEV SLUŽBY A UMÍSTĚNÍ SERVERŮ]. Přesně vám ukážu, co se kam posílá a co se ukládá.",
          faq: "Údaje z faktur čte AI služba [NÁZEV SLUŽBY A UMÍSTĚNÍ SERVERŮ]. Co se kam posílá a jak dlouho se to drží, vám ukážu v prvním hovoru.",
        }
      : null;

const raw = {
  meta: {
    title: `Faktury z PDF, skenů a fotek do ISDOC | ${site.name}`,
    description:
      "Aplikace na míru pro účetní kanceláře. Převede faktury v PDF, skenech i fotkách do ISDOC pro váš účetní program. Vy jen zkontrolujete a naimportujete.",
    ogAlt: `${site.name}: faktury, které už nikdo nepřepisuje`,
    ogSubtitle: "PDF, skeny i fotky faktur do ISDOC",
  },

  skipLink: "Přeskočit na obsah",

  nav: {
    label: "Hlavní navigace",
    home: `${site.name}, na úvod stránky`,
    links: {
      "jak-to-funguje": "Jak to funguje",
      "na-miru": "Na míru",
      kalkulacka: "Úspora",
      "kdo-za-tim-stoji": "O nás",
      faq: "Časté dotazy",
      kontakt: "Kontakt",
    },
    cta: "Kontaktní formulář",
    openMenu: "Otevřít menu",
    closeMenu: "Zavřít menu",
    menuTitle: "Menu",
    menuDescription: "Odkazy na části stránky",
  },

  /** Názvy sekcí ve štítcích „(02) Proč to řešit“. */
  sectionNames: {
    uvod: "Úvod",
    proc: "Proč to řešit",
    "jak-to-funguje": "Jak to funguje",
    "na-miru": "Na míru",
    prinos: "Co vám to přinese",
    kalkulacka: "Kalkulačka úspor",
    "pripadova-studie": "Případová studie",
    "kdo-za-tim-stoji": "Kdo za tím stojí",
    faq: "Časté dotazy",
    kontakt: "Kontakt",
  },

  /** Jedna výzva v celé stránce, všude stejný popisek. */
  cta: "Domluvit hovor",
  sample: "Ukázka",

  hero: {
    eyebrow: "Startup pro účetní kanceláře",
    title: "Faktury, které už nikdo *nepřepisuje*",
    lead: "Postavíme vaší kanceláři aplikaci, která převede PDF, skeny i fotky faktur do ISDOC pro váš účetní program.",
    // Pointa perexu, v heru vykreslená výrazněji.
    leadPoint: "Vy jen zkontrolujete a naimportujete.",
    // Jen při `site.videoSrc`. Formulaci „s námi“ sladit s `hasTeam`.
    videoLink: "Seznamte se s námi (2 min)",
    log: {
      title: "Záznam zpracování",
      caption: "Řádky jsou ilustrativní, nejde o záznam ze skutečného provozu.",
      rows: [
        { label: "faktura_dodavatel_0425.pdf", status: "načteno" },
        { label: "Dodavatel, IČO, DIČ", status: "vyčteno" },
        { label: "14 položek, 2 sazby DPH", status: "vyčteno" },
        { label: "Součty a DPH", status: "sedí", ok: true },
        { label: `ISDOC pro ${mainProgram}`, status: "připraveno k importu", final: true },
      ],
    },
  },

  proc: {
    // Příběh podle zadavatele (2026-10-03). Bez počtu kanceláří a bez citací, nemáme je doložené.
    story:
      "Když jsme rozjížděli Alteno, hledali jsme práci u účetních. Obvolali jsme jich hodně a skoro v každé kanceláři řešili to samé.",
    title: "Každou fakturu dnes někdo přepisuje *ručně*.",
    items: [
      "Faktury chodí v PDF, jako sken i fotka z mobilu.",
      "Účetní program chce ISDOC. Tak se to přepisuje.",
      "Překlep v částce se najde až při kontrole. Pokud vůbec.",
    ],
    retype: {
      label: "Ruční přepis jedné faktury",
      source: "Faktura, sken",
      target: "Účetní program, nový doklad",
      invoice: {
        heading: "Faktura č. 2026045",
        lines: [
          ["Dodavatel", "Dodavatel A s.r.o."],
          ["IČO", "12345678"],
          ["DIČ", "CZ12345678"],
          ["Vystaveno", "15. 9. 2026"],
        ],
        total: ["Celkem k úhradě", "12 480,00 Kč"],
      },
      // `typed` je to, co účetní skutečně napíše. U částky přehodí dvě číslice.
      fields: [
        { label: "Dodavatel", typed: "Dodavatel A s.r.o." },
        { label: "IČO", typed: "12345678" },
        { label: "Číslo faktury", typed: "2026045" },
        { label: "Celkem", typed: "12 840,00 Kč", correct: "12 480,00 Kč" },
      ],
      saved: "Doklad uložen",
      note: "Přehozené číslice. Nikdo si jich nevšiml.",
      screenReader: "Ukázka: při ručním přepisu faktury se z částky 12 480,00 Kč stalo 12 840,00 Kč a nikdo si toho nevšiml.",
      replay: "Přehrát znovu",
    },
    turn: {
      title: `Proto vznikl ${site.name}.`,
      text: "Pro každou kancelář stavíme aplikaci zvlášť, podle toho, jak k vám faktury chodí a v čem účtujete. Cíl je pokaždé stejný: ať vás přepisování nestojí čas ani peníze. Aplikace faktury přečte, zkontroluje a připraví ISDOC. Vám zůstane kontrola a import.",
    },
    app: {
      label: "Takhle vypadá aplikace, kterou dostanete",
      sample: "Ukázka s vymyšlenými daty",
      title: site.name,
      search: "Hledat dodavatele, číslo nebo datum",
      drop: "Přetáhněte faktury sem",
      nav: [
        { key: "all", label: "Faktury" },
        { key: "review", label: "Ke kontrole" },
        { key: "export", label: "Export ISDOCX" },
        { key: "archive", label: "Archiv" },
      ],
      columns: { file: "Soubor", supplier: "Dodavatel", status: "Stav" },
      status: {
        uploaded: "Nahráno",
        extracting: "Vytěžuje se",
        checking: "Kontrola součtů",
        ready: "ISDOCX připraveno",
        attachment: "Převzato z přílohy",
        warning: "Součet nesedí",
        duplicate: "Už zpracováno",
      },
      // Data jako v demu sekce Jak to funguje (Dodavatel A až E), vymyšlená.
      rows: [
        {
          id: "a",
          file: "faktura_2026045.pdf",
          kind: "PDF",
          supplier: "Dodavatel A s.r.o.",
          outcome: "ready",
          fields: [
            ["IČO", "12345678"],
            ["Číslo faktury", "2026045"],
            ["Vystaveno", "15. 9. 2026"],
            ["Celkem", "12 480,00 Kč"],
          ],
        },
        {
          id: "b",
          file: "sken_0003.pdf",
          kind: "Sken",
          supplier: "Dodavatel B s.r.o.",
          outcome: "ready",
          fields: [
            ["IČO", "87654321"],
            ["Číslo faktury", "2026112"],
            ["Vystaveno", "3. 9. 2026"],
            ["Celkem", "5 082,00 Kč"],
          ],
        },
        {
          id: "c",
          file: "IMG_2214.jpg",
          kind: "Fotka",
          supplier: "Dodavatel C s.r.o.",
          outcome: "ready",
          fields: [
            ["IČO", "11111111"],
            ["Číslo faktury", "20260871"],
            ["Vystaveno", "8. 9. 2026"],
            ["Celkem", "2 072,00 Kč"],
          ],
        },
        {
          id: "d",
          file: "faktura_2026318.pdf",
          kind: "ISDOC",
          supplier: "Dodavatel D s.r.o.",
          outcome: "attachment",
          fields: [
            ["IČO", "23456789"],
            ["Číslo faktury", "2026318"],
            ["Vystaveno", "11. 9. 2026"],
            ["Celkem", "30 976,00 Kč"],
          ],
        },
        {
          id: "e",
          file: "faktura_2026207.pdf",
          kind: "PDF",
          supplier: "Dodavatel E s.r.o.",
          outcome: "warning",
          fields: [
            ["IČO", "34567890"],
            ["Číslo faktury", "2026207"],
            ["Vystaveno", "12. 9. 2026"],
            ["Celkem", "10 796,00 Kč"],
          ],
        },
        {
          id: "f",
          file: "faktura_2026045.pdf",
          kind: "PDF",
          supplier: "Dodavatel A s.r.o.",
          outcome: "duplicate",
          fields: [
            ["IČO", "12345678"],
            ["Číslo faktury", "2026045"],
            ["Vystaveno", "15. 9. 2026"],
            ["Celkem", "12 480,00 Kč"],
          ],
        },
      ],
      notes: {
        ready: "Údaje sedí. ISDOCX je připravený k importu.",
        attachment: "Faktura už ISDOC přílohu měla. Aplikace ji jen převzala a nic znovu nevytěžovala.",
        warning: "Součet položek je 10 769,00 Kč, na faktuře stojí 10 796,00 Kč. Zkontrolujte ji před importem.",
        duplicate: "Tuhle fakturu už aplikace jednou zpracovala, takže ji podruhé nepustí do exportu.",
      },
      detailTitle: "Vytěžené údaje",
      empty: "Klikněte na fakturu v seznamu a uvidíte, co z ní aplikace vyčetla.",
      emptyFilter: "Tady teď nic není.",
      replay: "Přehrát znovu",
      live: {
        running: "Aplikace zpracovává nahrané faktury.",
        done: "Hotovo. Čtyři faktury jsou připravené, jedna čeká na kontrolu a jedna duplicita se přeskočila.",
      },
    },
    next: {
      question: "Kolik hodin to stojí vaši kancelář?",
      link: "Spočítejte si to",
    },
  },

  howItWorks: {
    title: "Od PDF faktury do účetnictví",
    lead: "Nahoře vidíte, kudy jedna faktura projde. Pod tím si vyzkoušíte pět typů faktur, které účetním chodí na stůl.",
    workflow: {
      label: "Průběh zpracování jedné faktury",
      controls: { pause: "Pauza", resume: "Pokračovat", replay: "Spustit znovu" },
      hint: "Najeďte na krok nebo ho vyberte a řeknu vám, co se v něm děje.",
      status: { waiting: "čeká", active: "běží", done: "hotovo" },
      nodes: [
        {
          key: "pdf",
          title: "PDF faktura",
          caption: "Přijde e-mailem, jako sken nebo fotka",
          file: "faktura_2026045.pdf",
          detail:
            "Faktura vstoupí do aplikace tak, jak ji klient poslal. Hodí se PDF, sken i fotka z telefonu, nahrát jich můžete víc najednou.",
        },
        {
          key: "system",
          title: site.name,
          caption: "Vytěží údaje a zkontroluje součty",
          engine: "vytěžení",
          detail:
            "Aplikace vyčte dodavatele, IČO, číslo faktury, data a částky. Pak přepočítá součty a DPH a podezřelé hodnoty označí.",
          fields: [
            { label: "Dodavatel", value: "Dodavatel s.r.o." },
            { label: "IČO", value: "12345678" },
            { label: "Číslo faktury", value: "2026045" },
            { label: "Datum", value: "15. 9. 2026" },
            { label: "Částka", value: "12 480,00 Kč" },
          ],
          stamp: "DPH ověřeno",
        },
        {
          key: "isdocx",
          title: "ISDOCX",
          caption: "Soubor připravený k importu",
          detail:
            "Z vytěžených údajů vznikne ISDOCX. Když faktura ISDOC přílohu už měla, aplikace ji jen převezme a nic znovu nevytěžuje.",
          lines: [
            "<isdoc:Invoice>",
            "  <ID>2026045</ID>",
            "  <IssueDate>2026-09-15</IssueDate>",
            "  <PayableAmount>12480.00</PayableAmount>",
            "</isdoc:Invoice>",
          ],
        },
        {
          key: "program",
          title: "Účetní program",
          caption: "Vy zkontrolujete a naimportujete",
          programs,
          ready: "připraveno k importu",
          detail: `Soubor je připravený k importu do programu ${programs}. Import děláte vy, nic se nezaúčtuje samo.`,
        },
      ],
    },
    demo: {
      title: "Vyzkoušejte si to na pěti fakturách",
      columns: { input: "Přijde na stůl", process: "Aplikace zpracuje", output: "Odejde hotové" },
      idle: "Vyberte vlevo fakturu. Ukážu vám, co s ní aplikace udělá.",
      idleMobile: "Vyberte nahoře fakturu. Ukážu vám, co s ní aplikace udělá.",
      idleOutput: "Tady se objeví výsledek.",
      sampleNote: "Ukázka s vymyšlenými daty",
      fieldsTitle: "Vytěžené údaje",
      ready: "ISDOC připraven k importu",
      stampOk: "Součty sedí",
      stampWarn: "Zkontrolovat",
      attachment: "Data převzata z přílohy, nic se nevytěžovalo znovu.",
      warning: "Součet položek nesedí s celkovou částkou. Zkontrolujte před importem.",
      warningFix: "Údaj můžete před exportem opravit.",
      flaggedNote: (sum: string) => `Součet položek: ${sum}`,
      /*
       * Případy dema. Vymyšlená data: IČO záměrně nemají platný kontrolní
       * součet a kód banky 0000 neexistuje, takže nemůžou kolidovat se
       * skutečnou firmou. `checkFrom` = index kroku, kdy začíná kontrola.
       */
      cases: [
        {
          id: "pdf",
          title: "Faktura v PDF",
          hint: "běžná faktura od dodavatele",
          file: "faktura_2026045.pdf",
          steps: ["Načítám PDF", "Čtu dodavatele, IČO a DIČ", "Čtu položky a sazby DPH", "Kontroluji součty a DPH", "Připravuji ISDOC"],
          checkFrom: 3,
          outcome: "done",
          fields: [
            ["Dodavatel", "Dodavatel A s.r.o."],
            ["IČO", "12345678"],
            ["DIČ", "CZ12345678"],
            ["Číslo faktury", "2026045"],
            ["Vystaveno", "15. 9. 2026"],
            ["Splatnost", "29. 9. 2026"],
            ["Účet", "1234567890/0000"],
            ["Celkem", "12 480,00 Kč"],
          ],
        },
        {
          id: "scan",
          title: "Sken z kanceláře",
          hint: "naskenovaný papír",
          file: "sken_0003.pdf",
          steps: ["Načítám sken", "Čtu text z naskenované stránky", "Čtu dodavatele, položky a DPH", "Kontroluji součty a DPH", "Připravuji ISDOC"],
          checkFrom: 3,
          outcome: "done",
          fields: [
            ["Dodavatel", "Dodavatel B s.r.o."],
            ["IČO", "87654321"],
            ["DIČ", "CZ87654321"],
            ["Číslo faktury", "2026112"],
            ["Vystaveno", "3. 9. 2026"],
            ["Splatnost", "17. 9. 2026"],
            ["Účet", "9876543210/0000"],
            ["Celkem", "5 082,00 Kč"],
          ],
        },
        {
          id: "photo",
          title: "Fotka z telefonu",
          hint: "klient poslal fotku",
          file: "IMG_2214.jpg",
          steps: ["Načítám fotku", "Čtu text z fotky", "Čtu dodavatele, položky a DPH", "Kontroluji součty a DPH", "Připravuji ISDOC"],
          checkFrom: 3,
          outcome: "done",
          fields: [
            ["Dodavatel", "Dodavatel C s.r.o."],
            ["IČO", "11111111"],
            ["DIČ", "CZ11111111"],
            ["Číslo faktury", "20260871"],
            ["Vystaveno", "8. 9. 2026"],
            ["Splatnost", "22. 9. 2026"],
            ["Účet", "1111111111/0000"],
            ["Celkem", "2 072,00 Kč"],
          ],
        },
        {
          id: "isdoc",
          title: "Faktura s ISDOC přílohou",
          hint: "data už v ní jsou",
          file: "faktura_2026318.pdf",
          steps: ["Načítám PDF", "Hledám přílohu ISDOC", "Příloha nalezena", "Přebírám údaje z přílohy"],
          checkFrom: 99,
          outcome: "attachment",
          fields: [
            ["Dodavatel", "Dodavatel D s.r.o."],
            ["IČO", "23456789"],
            ["DIČ", "CZ23456789"],
            ["Číslo faktury", "2026318"],
            ["Vystaveno", "11. 9. 2026"],
            ["Splatnost", "25. 9. 2026"],
            ["Účet", "2222222222/0000"],
            ["Celkem", "30 976,00 Kč"],
          ],
        },
        {
          id: "vat",
          title: "Faktura s chybou v DPH",
          hint: "součet nesedí",
          file: "faktura_2026207.pdf",
          steps: ["Načítám PDF", "Čtu dodavatele, IČO a DIČ", "Čtu položky a sazby DPH", "Kontroluji součty a DPH"],
          checkFrom: 3,
          outcome: "warning",
          flagged: "Celkem",
          itemsSum: "10 769,00 Kč",
          fields: [
            ["Dodavatel", "Dodavatel E s.r.o."],
            ["IČO", "34567890"],
            ["DIČ", "CZ34567890"],
            ["Číslo faktury", "2026207"],
            ["Vystaveno", "12. 9. 2026"],
            ["Splatnost", "26. 9. 2026"],
            ["Účet", "3333333333/0000"],
            ["Celkem", "10 796,00 Kč"],
          ],
        },
      ],
      live: {
        processing: (title: string) => `Zpracovávám: ${title}.`,
        done: "Hotovo. ISDOC je připravený k importu.",
        attachment: "Hotovo. Data převzata z přílohy ISDOC.",
        warning: "Upozornění: součet položek nesedí s celkovou částkou. Zkontrolujte před importem.",
      },
    },
  },

  custom: {
    title: "Aplikace postavená pro *vaši kancelář*, ne pro všechny",
    lead: "Každou aplikaci stavíme pro jednu firmu. Nekupujete krabicový program, na který si musíte zvyknout. Postavíme ho kolem toho, jak u vás s fakturami opravdu pracujete.",
    stepsTitle: "Jak spolu postupujeme",
    steps: [
      "Projdeme, jak k vám faktury chodí a v čem účtujete.",
      "Aplikaci nastavíme na váš program a vaše zvyklosti.",
      "Vyzkoušíme ji na vašich skutečných fakturách.",
      "Zaškolíme vás a necháme vás pracovat.",
    ],
    counterLabel: (current: number, total: number) => `Bod ${current} z ${total}`,
    items: [
      {
        key: "program",
        title: "Výstup přesně pro váš program",
        text: "Export odpovídá tomu, co váš účetní program umí naimportovat. Nic nepřevádíte ručně.",
        demo: {
          label: "Účetní program",
          exportLabel: "Export",
          pending: "[DALŠÍ PROGRAMY PO OVĚŘENÍ]",
        },
      },
      {
        key: "mapping",
        title: "Pole podle vašich zvyklostí",
        text: "Střediska, předkontace a číselné řady nastavíme tak, jak je používáte vy. Ne tak, jak si je vymyslel někdo jiný.",
        demo: {
          label: "Nastavení pro",
          offices: [
            {
              name: "Kancelář A",
              rows: [
                { field: "Středisko", value: "200 Praha" },
                { field: "Předkontace", value: "Nákup materiálu" },
                { field: "Číselná řada", value: "FP-2026-" },
              ],
            },
            {
              name: "Kancelář B",
              rows: [
                { field: "Středisko", value: "10 Brno" },
                { field: "Předkontace", value: "Služby" },
                { field: "Číselná řada", value: "PF26" },
              ],
            },
          ],
        },
      },
      {
        key: "formats",
        title: "Formáty, které vám opravdu chodí",
        text: "PDF, skeny i fotky z telefonu. Když faktura ISDOC už obsahuje, aplikace ho jen vytáhne.",
        demo: {
          label: "Co přišlo",
          formats: [
            { name: "PDF", result: "vytěží údaje" },
            { name: "Sken", result: "vytěží údaje" },
            { name: "Fotka", result: "vytěží údaje" },
            { name: "PDF s ISDOC", result: "jen převezme přílohu" },
          ],
        },
      },
      {
        key: "access",
        title: "Přístup jen pro vaše lidi",
        text: "Aplikace je jen vaše. Přihlásí se do ní jen lidé z vaší firmy. U kanceláře oddělení podle klientů [OVĚŘIT, ZDA NABÍZÍME].",
        demo: {
          label: "Kdo se přihlašuje",
          insider: { who: "Kolegyně z kanceláře", result: "Přihlášena" },
          outsider: { who: "Někdo zvenku", result: "Přístup odepřen" },
        },
      },
      {
        key: "fee",
        title: "Žádný poplatek za doklad",
        text: "Aplikace je vaše. Ať zpracujete sto faktur, nebo tři tisíce, za doklad neplatíte.",
        demo: {
          invoices: "Faktur tento měsíc",
          add: "Přidat 100 faktur",
          reset: "Začít znovu",
          fee: "Poplatek za doklady",
        },
      },
    ],
    data: dataPromise ? { key: "data", title: dataPromise.title, text: dataPromise.text } : null,
  },

  // Bez čísel: „kolikrát víc faktur“ ani hodiny nejsou změřené, čísla ukazuje jen kalkulačka.
  // Tvary názvu („s Prvotkou“) jsou psané ručně, `site.name` se neskloňuje.
  benefits: {
    title: "Víc faktur za den, víc času na *podnikání*",
    lead: "Faktury i lidé zůstanou stejní. Jen je už nikdo nepřepisuje. Podívejte se, co se tím ve vaší firmě změní.",
    columns: { label: "Co se změní", manual: "Dnes, ručně", app: "S Prvotkou" },
    manualShort: "Dnes",
    rows: [
      {
        label: "Čas",
        manual: "Každou fakturu přepisujete pole po poli.",
        app: {
          title: "Fakturu jen zkontrolujete",
          text: "Údaje vyčte Prvotka. Hodiny, které padly na přepis, máte na klienty a na podnikání.",
        },
      },
      {
        label: "Faktur za den",
        manual: "Tolik, kolik stihnete přepsat.",
        app: {
          title: "Zvládnete jich víc",
          text: "Se stejným počtem lidí, protože přepisování odpadne.",
        },
      },
      {
        label: "Peníze",
        manual: "Platíte hodiny strávené opisováním.",
        app: {
          title: "Neplatíte za přepis",
          text: "Ani za zpracovaný doklad. Aplikace je vaše, ať projde sto faktur, nebo tři tisíce.",
        },
      },
      {
        label: "Chyby",
        manual: "Součty a DPH počítáte ručně. Překlep se snadno přehlédne.",
        app: {
          title: "Součty a DPH se přepočítají samy",
          text: "Podezřelou fakturu označí a duplicitu nepustí do exportu.",
        },
      },
      {
        label: "Přehled",
        manual: "Faktury hledáte v e-mailech a ve složkách.",
        app: {
          title: "Všechny faktury firmy na jednom místě",
          text: "Najdete je podle dodavatele, čísla nebo data. Originál, vytěžené údaje i ISDOC leží u sebe.",
        },
      },
      {
        label: "Bezpečnost",
        manual: "Faktury leží v e-mailech, přílohách a na sdílených discích.",
        // Slib „neopustí vaši firmu“ jen při `site.dataStaysOnPremise === true`.
        app:
          site.dataStaysOnPremise === true && dataPromise
            ? { title: dataPromise.title, text: dataPromise.text }
            : {
                title: "Přístup mají jen vaši lidé",
                text: "Aplikace patří jen vaší firmě. Nikdo zvenku se do ní nepřihlásí.",
              },
      },
    ],
    // Jen při `site.showPrice`.
    costRow: {
      label: "Cena",
      manual: "Hodiny práce každý měsíc.",
      app: { title: priceLine, text: `K tomu ${feeLine}.` },
    },
    footnote: {
      before: "Kolik hodin a korun to dělá právě u vás, ukazuje ",
      link: "kalkulačka",
      after: ". Čas na kontrolu s Prvotkou zatím měříme.",
    },
  },

  calculator: {
    title: "Spočítejte si, kolik vás přepisování stojí",
    lead: "Zadejte, kolik faktur měsíčně zpracujete. Zbytek jsme předvyplnili, klidně ho přepište podle sebe. Počítá se jen ve vašem prohlížeči, nic se neodesílá.",
    assumptions: "Vaše předpoklady",
    inputs: {
      invoicesPerMonth: { label: "Kolik faktur měsíčně zpracujete?", unit: "faktur" },
      manualMinutes: { label: "Minut na ruční přepis jedné faktury", unit: "min" },
      hourlyCost: { label: "Hodinový náklad práce", unit: "Kč/h" },
      checkMinutes: { label: "Minut na kontrolu s aplikací", unit: "min", badge: "odhad, ověřujeme měřením" },
    },
    ledger: {
      title: "Výkaz pro vaši kancelář",
      columns: { item: "Položka", hours: "Hodin měsíčně", monthly: "Kč měsíčně", yearly: "Kč ročně" },
      manual: "Ruční přepis dnes",
      check: "Kontrola s aplikací",
      saved: "Ušetříte",
      // Skloňování podle počtu: 1 den, 2–4 dny, desetinné číslo „dne“, jinak „dní“.
      workDays: (value: string, count: number) => {
        const word =
          !Number.isInteger(count)
            ? "pracovního dne"
            : count === 1
              ? "pracovní den"
              : count >= 2 && count <= 4
                ? "pracovní dny"
                : "pracovních dní";
        return `To je zhruba ${value} ${word} ročně, kdy už nikdo nepřepisuje faktury.`;
      },
      workDaysNote: "Počítáme s osmihodinovou směnou.",
    },
    outputs: {
      hours: "Ušetřené hodiny měsíčně",
      monthly: "Úspora měsíčně",
      yearly: "Úspora ročně",
      payback: "Návratnost včetně správy",
      paybackUnit: "měsíců",
      paybackNone: "Úspora nepokryje měsíční správu.",
      paybackUnknown: "[VÝŠE SPRÁVY]",
      estimate: "odhad",
    },
    chart: {
      title: (months: number) => `Kumulativní úspora za ${months} měsíců`,
      titleWithPrice: (months: number) => `Úspora proti investici za ${months} měsíců`,
      savings: "Ušetřená práce",
      investment: "Cena a správa",
      perDocument: "Poplatek za doklad",
      payback: "návratnost",
      month: "měsíc",
      axisMonths: "měsíce",
      description: (months: number, total: string) =>
        `Graf: za ${months} měsíců ušetříte podle zadaných hodnot ${total}. Úspora roste každý měsíc o stejnou částku.`,
    },
    perDocument: {
      toggle: "Porovnat s poplatkem za doklad",
      feeLabel: "Cena za doklad",
      result: (invoices: string, months: number) =>
        `Při horizontu ${months} měsíců vychází aplikace levněji od ${invoices} faktur měsíčně.`,
    },
    cta: "Chcete čísla projít se mnou?",
    next: {
      question: "Jak k té úspoře přijdete?",
      link: "Ukážu vám to na jedné faktuře",
    },
    footnotes: [
      "Předvyplněné hodnoty vycházejí z nabídky, kterou jsme připravili pro účetní kancelář: 3 až 7 minut na ruční přepis faktury a 300 až 400 Kč za hodinu práce. Čas na kontrolu s aplikací je náš odhad, dokud ho nezměříme.",
      "Od ušetřeného času odečítáme čas, který strávíte kontrolou výstupu. Jde o modelový výpočet, ne o garanci.",
    ],
  },

  caseStudy: {
    title: "Případová studie",
    before: "Výchozí stav",
    after: "Po zavedení",
    result: "Výsledek",
  },

  about: {
    title: "Skoro všude jsem slyšel to samé. Tak to řeším.",
    role: "CEO",
    story: [
      "Když jsme rozjížděli Alteno a hledali zakázky, volal jsem hodně účetním kancelářím. Skoro v každé jsem narazil na stejnou věc. Faktury chodí v PDF, naskenované nebo vyfocené mobilem a někdo je musí přepsat do účetního programu.",
      "Je to hodiny práce, kterou nikdo nechce dělat, a chyba se v ní schová snadno. Ve Vizeonu stavím weby a aplikace na míru, v Alteno automatizuji firemní procesy. Tady obojí spojuju. Každá kancelář dostane aplikaci postavenou pro sebe a s jedním cílem: ušetřit jí čas a peníze.",
    ],
    team: teamLine,
    photoPlaceholder: "[FOTO CEO]",
    photoAlt: "Místo pro fotku Kryštofa Sobotky, CEO",
    video: {
      placeholder: "Video připravujeme",
      tag: "[VIDEO 2 MIN]",
      play: "Přehrát video (2:00)",
      duration: "2:00",
    },
    brands: {
      title: "Značky za produktem",
      pause: "Pozastavit pás značek",
    },
  },

  faq: {
    title: "Časté dotazy",
    lead: "Odpovídám na rovinu, i na nepohodlné otázky. Kde odpověď ještě nemám, otázku sem nedávám.",
    more: "Nenašli jste svou otázku?",
    items: [
      {
        q: "Co je ISDOC a proč ho potřebuji?",
        a: "ISDOC je český formát elektronické faktury. Účetní programy jako POHODA ho umí naimportovat, takže údaje z faktury nemusí nikdo přepisovat ručně.",
        published: true,
      },
      {
        q: "Funguje to i se skeny a fotkami?",
        a: "Ano. Kromě PDF aplikace zpracuje i obrázky a skeny.",
        published: true,
      },
      {
        q: "Co když faktura ISDOC už obsahuje?",
        a: "Aplikace ho jen vytáhne a znovu nevytěžuje.",
        published: true,
      },
      {
        q: "Co když aplikace údaj přečte špatně?",
        a: "Před exportem kontroluje součty a DPH a upozorní na podezřelé hodnoty. Údaje jde opravit. Výstup ale vždycky kontrolujete vy a odpovědnost za účetní údaje zůstává u vás.",
        published: true,
      },
      {
        q: "Kam odchází data mých klientů?",
        a: dataPromise?.faq ?? "[PODLE dataStaysOnPremise]",
        published: dataPromise !== null,
      },
      {
        q: "Které účetní programy podporujete?",
        a: `Teď máme ověřený import do programu ${programs}. Další programy doplníme, až import otestujeme na reálných fakturách.`,
        published: true,
      },
      {
        q: "Kolik to stojí?",
        a: site.showPrice
          ? `${priceLine} a ${feeLine}. Žádný poplatek za doklad.`
          : "Cenu řeknu na rovinu v prvním hovoru.",
        published: true,
      },
      {
        q: "Jak dlouho trvá nasazení?",
        a: "[DOPLNIT]",
        published: false,
      },
      {
        q: "Co je v ceně?",
        a: "Nasazení na server, test na vašich reálných fakturách a zaškolení.",
        published: true,
      },
      {
        q: "Co když nás to omezí? Můžeme skončit?",
        a: "[DOPLNIT PODLE SMLOUVY O SPRÁVĚ]",
        published: false,
      },
    ],
  },

  contact: {
    title: "Projdeme spolu, jestli se vám to vyplatí",
    lead: "Napište mi pár údajů o vaší kanceláři. Ozvu se a domluvíme hovor. Projdeme, co by vám aplikace ušetřila, a řeknu vám *na rovinu*, jestli se vyplatí, nebo ne.",
    detailsTitle: "Kontakt",
    role: "CEO",
    emailLabel: "E-mail",
    phoneLabel: "Telefon",
    icoLabel: "IČO",
    photoAlt: "Místo pro fotku Kryštofa Sobotky",
    photoPlaceholder: "[FOTO]",
    expect: {
      title: "Co můžete čekat",
      responseTime: (value: string) => `Odpovím do ${value}.`,
      introCall: (value: string) => `Úvodní hovor trvá ${value}.`,
      honest: "Nezávazně. Když pro vás aplikace nedává smysl, řeknu vám to.",
    },
    form: {
      title: "Poptávka hovoru",
      loading: "Načítám formulář…",
      noscript: "Formulář potřebuje zapnutý JavaScript. Napište mi prosím přímo na e-mail:",
      progress: (filled: number, total: number) => `Vyplněno ${filled}/${total}`,
      required: "povinné",
      optional: "nepovinné",
      name: "Jméno a příjmení",
      company: "Firma nebo kancelář",
      email: "E-mail",
      phone: "Telefon",
      invoiceVolume: "Kolik faktur měsíčně zpracujete?",
      program: "Jaký účetní program používáte?",
      programOther: "Název programu",
      message: "Zpráva",
      messageHint: "Třeba s čím teď nejvíc bojujete.",
      messageCounter: (count: number) => `${count} / 2 000 znaků`,
      consent: "Souhlasím se zpracováním osobních údajů pro odpověď na poptávku.",
      consentLink: "Jak s údaji zacházím",
      honeypot: "Toto pole nevyplňujte",
      submit: "Odeslat poptávku",
      sending: "Odesílám…",
      success: {
        title: "Děkuji, poptávka dorazila.",
        text: "Ozvu se vám e-mailem nebo telefonem a domluvíme termín hovoru.",
        again: "Poslat další poptávku",
      },
      errors: {
        title: "Odeslání se nepovedlo.",
        invalid: "Některé údaje nejsou v pořádku. Opravte prosím zvýrazněná pole.",
        tooFast: "Formulář jste odeslali hodně rychle. Počkejte prosím pár sekund a zkuste to znovu.",
        server: "Na mé straně se něco pokazilo. Zkuste to prosím znovu, nebo mi napište přímo na",
      },
    },
  },

  footer: {
    tagline: "Aplikace na míru, která převádí faktury z PDF, skenů a fotek do ISDOC pro účetní program.",
    sectionsTitle: "Na stránce",
    brandsTitle: "Značky",
    legalTitle: "Právní informace",
    privacy: "Ochrana osobních údajů",
    terms: "Obchodní podmínky",
    vat: "nejsem plátce DPH",
    icoPrefix: "IČO",
  },

  legal: {
    placeholder: "Text doplní zadavatel.",
    back: "Zpět na úvod",
    operator: `Provozovatel: ${site.ceo}, fyzická osoba podnikající (OSVČ), IČO ${site.ico}, ${site.address}. Nejsem plátce DPH.`,
    privacy: {
      title: "Ochrana osobních údajů",
      description: "Informace o zpracování osobních údajů z kontaktního formuláře.",
    },
    terms: {
      title: "Obchodní podmínky",
      description: "Obchodní podmínky pro dodání aplikace na míru.",
    },
  },

  notFound: {
    code: "404",
    title: "Tahle stránka tu není",
    text: "Adresa možná obsahuje překlep, nebo stránka zmizela. Faktury i kontakt najdete na úvodní stránce.",
    back: "Zpět na úvod",
  },
} as const;

export const cs = deepTypo(raw);
export type Content = typeof cs;
