---
name: vizeon-sec-threat-model
description: Bezpečnostní návrh a threat model před psaním kódu – architektura, datové toky, klasifikace a inventura dat, matice rolí a oprávnění, model izolace tenantů, oddělení prostředí, sdílená odpovědnost s cloudem, rozhodnutí o pokročilé ochraně (ASVS L3, šifrování, DLP). Použij při zakládání nového projektu, před velkou novou funkcí (platby, AI agent, nová role, export dat, integrace), při změně architektury a při každém „jak to navrhnout bezpečně“. Pokrývá sekce A a Y checklistu.
---

# Threat model a bezpečný návrh (sekce A, Y)

Výstupem tohoto skillu nejsou úvahy v chatu, ale **soubory v `docs/security/`**, na které se odkazují všechny ostatní skills.
Bez `access-matrix.md` se nepíše žádný endpoint ani RLS politika.

## Kdy

- Nový projekt (povinně, před prvním řádkem kódu).
- Nová funkce, která přidává: novou roli, nový typ dat, export, platbu, integraci, AI agenta, veřejný endpoint, upload.
- Kvartální revize (`vizeon-sec-release-gate`, provoz).

## Postup

### Krok 1 – Architektura a datové toky (#1, #9)
Vytvoř v `docs/security/threat-model.md` diagram (Mermaid) se všemi komponentami a **hranicemi důvěry**:
prohlížeč → Vercel (Next.js server) → Supabase (Auth, PostgREST, Postgres, Storage, Realtime, Edge Functions) → externí služby (Stripe, Resend, AI poskytovatel, n8n/Make, banka, ARES…).
U každé šipky: co teče, jak je autentizováno, zda přes TLS, kdo může volat.

Zapiš **sdílenou odpovědnost**: co řeší Vercel/Supabase (fyzická bezpečnost, patch OS, šifrování disku, DDoS L3/L4) a co **vždy řešíš ty** (RLS, GRANT, autorizace v kódu, klíče, konfigurace, zálohy Storage, testy obnovy, MFA na účtech).

### Krok 2 – Inventura a klasifikace dat (#3, #108)
Šablona `assets/data-inventory.template.md`. Pro každý datový prvek: klasifikace, osobní údaj ano/ne (zvláštní kategorie?), kde všude leží (tabulka, Storage, logy, cache, exporty, zálohy, e-maily, AI poskytovatel, integrace), retence a právní důvod.

Klasifikace:
- **Veřejné** – web, ceník.
- **Interní** – konfigurace, interní poznámky.
- **Důvěrné** – zákazníci, kontakty, faktury, smlouvy.
- **Přísně důvěrné** – rodná čísla, čísla účtů, mzdy, zdravotní údaje, doklady totožnosti, AML dokumentace, přístupové údaje k bankám/datovým schránkám, tokeny integrací.

Přísně důvěrná data → automaticky zvaž aplikační šifrování (`vizeon-sec-secrets-data`), užší přístup, podrobnější audit, kratší retenci.

### Krok 3 – Matice rolí a oprávnění (#4, #5, #29)
Šablona `assets/access-matrix.template.md`. Řádky = operace nad zdroji (`invoice.read`, `invoice.create`, `invoice.void`, `member.invite`, `org.export_all`, `billing.manage`…), sloupce = role. Výchozí buňka = **zakázáno**.
Explicitně vyřeš:
- kdo smí měnit role a komu (nikdo nesmí zvýšit sám sebe ani udělit vyšší roli, než má),
- kdo smí exportovat všechna data firmy,
- kdo smí mazat (soft delete vs. hard delete),
- platformní superadmin (VIZEON) – má přístup k datům klientů? Jen přes auditovanou impersonaci (N-13), ideálně vůbec.

### Krok 4 – Model izolace tenantů (#32)
Rozhodni a zapiš jednu variantu:
1. **Sdílená DB + `org_id` na každém řádku + RLS** (výchozí pro naše CRM). Povinné: `org_id NOT NULL`, FK, index, RLS přes membership, neměnnost `org_id`.
2. **Schéma na tenanta** – složitější migrace, nevystavuj přes Data API bez kontroly.
3. **Projekt Supabase na klienta** – nejsilnější izolace pro účetní kanceláře s velmi citlivými daty nebo smluvním požadavkem. Vyšší náklady, ale únik je omezen na jednoho klienta.

Kritérium: pokud by únik dat jedné firmy k jiné firmě znamenal pro klienta existenční nebo regulatorní problém (účetní, mzdy, AML), zvaž variantu 3 nebo minimálně L3 kontroly izolace.

### Krok 5 – Hrozby (#2) – STRIDE + zneužití
Pro každý zdroj/tok projdi:
- **S**poofing – lze se vydávat za jiného uživatele/službu/webhook?
- **T**ampering – lze změnit cenu, stav, `org_id`, roli, cizí záznam?
- **R**epudiation – lze akci popřít (chybí audit)?
- **I**nformation disclosure – IDOR, výpis přes view/RPC, cache, logy, chybové hlášky, Realtime, signed URL?
- **D**enial of service – drahé dotazy, uploady, AI náklady (denial of wallet)?
- **E**levation of privilege – změna role, pozvánka, metadata, SECURITY DEFINER, agent?

Plus aktéři: anonymní útočník, přihlášený uživatel jiné firmy, zlomyslný zaměstnanec klienta, odcházející zaměstnanec, kompromitovaný vývojářský stroj, kompromitovaný npm balíček, prompt injection přes dokument/e-mail, kompromitovaný účet Vercel/Supabase/GitHub, chybný AI agent.

Každá hrozba v tabulce: `ID | hrozba | dopad | pravděpodobnost | opatření | kde ověřeno (test/SQL) | stav`.

### Krok 6 – Prostředí a blast radius (#6, #7, #8, #10)
- Samostatné Supabase projekty pro staging a produkci (ne jen schémata). Samostatné klíče pro každé prostředí a každou integraci.
- Preview deploymenty se nikdy nepřipojují k produkční DB.
- Každá komponenta má vlastní identitu s minimem práv: Next.js server (anon/publishable + JWT uživatele), admin modul (secret key – jen pro úzce vymezené operace), cron/jobs (vlastní klíč/role), Edge Functions (ověřují JWT), integrace (scoped tokeny).
- Zapiš: „Pokud útočník získá X, dostane se k Y.“ pro X ∈ {publishable key, JWT uživatele, secret key, Vercel účet, GitHub token, vývojářský notebook, AI agent}. Pokud je Y = „všechno“, návrh je špatný → segmentuj.

### Krok 7 – Pokročilá ochrana (sekce Y, #268–#275)
Rozhodni a zapiš ANO/NE s důvodem:
- 4-eyes schválení privilegovaných operací (#268) – např. export všech dat, změna bankovního účtu, hromadné mazání.
- Oddělené servisní identity a segmentace (#269).
- DLP / limity exportů a watermark exportů (#270).
- Detekce neobvyklých admin operací (#271).
- Aplikační šifrování a správa klíčů (#272).
- Oddělené privilegované účty pro správu produkce (#273) – běžný účet ≠ admin účet.
- Podrobný audit a nezávislá kontrola vysoce rizikových operací (#274).
- Potřeba ASVS L3 nebo oborového standardu (#275).

### Krok 8 – Bezpečnostní požadavky a plán testů
Z hrozeb vygeneruj seznam testovatelných požadavků („Uživatel firmy B nesmí číst fakturu firmy A přes REST, RPC, Storage, Realtime ani export“) a zapiš je do `docs/security/test-plan.md` → implementace v `vizeon-sec-testing`.

## Definice hotovo
- [ ] `threat-model.md` s diagramem, hranicemi důvěry, STRIDE tabulkou
- [ ] `data-inventory.md` vyplněné včetně „kde všude leží kopie“
- [ ] `access-matrix.md` s deny-by-default
- [ ] zvolený a zdůvodněný model izolace
- [ ] blast-radius tabulka bez řádku „všechno“
- [ ] rozhodnutí sekce Y
- [ ] `test-plan.md`
- [ ] cílová úroveň ASVS v `SECURITY.md`

## Šablony
- `assets/threat-model.template.md`
- `assets/data-inventory.template.md`
- `assets/access-matrix.template.md`
