---
name: web-externi-audit-oprava
description: Zpracuje výstup externího auditu webu (scannery typu "analýza webu zdarma" se skóre po kategoriích - Analýza obsahu, Sociální sítě, Načítání zdrojů, Zabezpečení, Doména a e-mail, AI viditelnost, Právní náležitosti, Kvalita kódu, PageSpeed) a také studený e-mail od cizího web designéra s výčtem chyb. Od A do Z ho zanalyzuje, rozliší skutečné chyby od falešných poplachů a rozdílu mezi scannerem a realitou, spustí bundlovaný skript audit-check.sh proti živé doméně, opraví v kódu vše, co v kódu opravit jde, a zbytek (DNS, registrátor, Google Admin, nastavení hostingu) předá majiteli jako přesné kroky. Použij, kdykoli uživatel vloží výpis kontroly webu (SPF, DMARC, DKIM, DNSSEC, security.txt, llms.txt, CSP, PageSpeed, W3C validita, "souhlas s cookies", "vizitka firmy ve strukturovaných datech") a řekne "oprav", "analyzuj", "co s tím", nebo když chce web před předáním/po nasazení zkontrolovat zvenčí. Také při slovech "audit webu", "skóre webu", "scanner", "kontrola domény". NEPOUŽÍVEJ pro konfiguraci bezpečnostních hlaviček od nuly (web-security-setup), kontrolu hlaviček po nasazení (web-security-audit), review kódu (web-security-review) ani kontrolu placeholderů před předáním (web-predani-checklist) - ty se s tímto skillem doplňují, ne nahrazují.
---

# Externí audit webu: analýza a oprava od A do Z

Vzniklo z reálného případu (landing page Prvotka, 2026-10-22): zadavatel vložil dva výpisy z externích scannerů s desítkami "chyb". Po rozboru se ukázalo, že asi třetina nálezů měla **jednu společnou příčinu** (apex doména přesměrovávala na `www`), další třetina byla **falešný poplach nebo nesouhlasila s realitou** (Google Analytics na webu nebylo, `unsafe-eval` v CSP nebylo, PageSpeed 62/77 vs. skutečných 90/99) a zbytek byly skutečné drobnosti. Cíl skillu: nepřepisovat web podle slepých nálezů, ale každý nález ověřit, zařadit a opravit jen to, co je pravda.

Scanner ukazuje jen titulek nálezu, detail je za registrací. Proto **vždy ověř sám** (část 1) a neopravuj naslepo.

## Postup

### 0. Kontext projektu
Přečti paměť projektu a bezpečnostní stav (`CLAUDE.md`, `memory/`, `.claude/security/STATE.md`, `DECISIONS.md`), pokud existují. Nález, který koliduje s odůvodněným rozhodnutím (např. `style-src 'unsafe-inline'` kvůli Motion, nezveřejněná adresa podnikání, bez cookie banneru, protože není měření), **nepřepisuj potichu**. Řekni to a zeptej se. Nikdy neslab CSP, aby se zlepšilo skóre. Přísnější úprava je ok, ale jen po otestování v prohlížeči.

### 1. Ověř zvenčí (skript)
```bash
bash ".claude/skills/web-externi-audit-oprava/scripts/audit-check.sh" <doména> [--lighthouse]
```
Zkontroluje: přesměrování apex/www a shodu s canonical, OG meta a načtení og:image, security.txt/llms.txt/robots/sitemap bez přesměrování, CSP a ostatní hlavičky, cache, DNS (SPF, DMARC, DKIM, DNSSEC, CAA, AAAA, MTA-STS), JSON-LD, GA/GTM, informace u formuláře, W3C chyby. Volitelně Lighthouse (mobil + desktop). Nic nemění.

Skript je výchozí bod. Co hlásí jako CHYBA, ověř ručně (`curl -sI`, `dig`). Co scanner tvrdí a skript nepotvrdí, ber jako podezřelé.

### 2. Roztřiď každý nález
Použij tabulku v `reference/nalezy.md`. Každý nález skončí v jedné ze čtyř skupin:

| Skupina | Význam | Akce |
|---|---|---|
| **Kořenová příčina** | jedna věc způsobuje víc nálezů (typicky apex→www) | oprav ji nejdřív, ostatní znovu změř |
| **Oprava v kódu** | skutečná chyba v repu | oprav, otestuj, zapiš do paměti |
| **Mimo kód** | DNS, registrátor, Google Admin, nastavení hostingu | přesné kroky a hodnoty pro majitele (část 4) |
| **Falešný poplach / vědomé rozhodnutí** | scanner se mýlí nebo je to schválená výjimka | neopravuj, zdůvodni jednou větou |

Scanner má **vlastní vážení**. Nepočítá se do skóre ≠ není chyba, ale ani není důvod to dělat hned. "k řešení" neznamená "rozbité".

### 3. Oprav v kódu
Nejčastější skutečné opravy a jak na ně (podrobnosti a ověřené příklady v `reference/opravy-v-kodu.md`):

1. **JSON-LD vizitka**: `telephone`, `email`, `contactPoint`, `sameAs` ze skutečných údajů webu. **Adresu a profily nevymýšlej.** Chybí-li podklad (adresu majitel nezveřejňuje, profily neexistují), nech pole mimo a řekni to. Konfigurovatelné pole (`site.profiles`) se vykreslí jen když není prázdné.
2. **llms.txt**: route handler, text jen z existujících dat webu (popis, kontakt, odkazy). Žádná cena ani slib o datech, pokud je web nepublikuje.
3. **Cache statiky**: `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` pro soubory z `public/` bez hashe. HTML s CSP nonce se necachuje, to je správně. Hashované `/_next/static/` už cache mají.
4. **Nepoužitý JS**: zjisti, který chunk to je (stáhni a podívej se do obsahu). Typicky formulář s Zodem a React Hook Form (~100 kB). Řešení: načíst až při přiblížení sekce (IntersectionObserver, `rootMargin` cca 800 px), zástupný blok stejné výšky kvůli CLS.
5. **W3C chyby**: nejčastěji Radix slider bez `aria-valuenow` v SSR (doplň `aria-valuenow` na Thumb), `aria-label` na `div` bez role, lomítka u void prvků jsou jen `info`, ne chyba.
6. **Informace u formuláře**: když se formulář načítá klientsky, dej informaci o zpracování osobních údajů s odkazem na zásady i do zástupného bloku v HTML ze serveru.
7. **Kontrast, dotykové plochy, odkazy jen barvou**: změř Lighthouse sám. Pokud vychází přístupnost 100, nález scanneru (PSI s jiným stavem stránky) neopravuj naslepo.

Po opravách: lint, typecheck, testy, build. Chování ověř v prohlížeči (puppeteer-core + Chrome, nebo Lighthouse proti `next start`). Změny zapiš do paměti projektu a do `.claude/security/AUDIT-LOG.md`, pokud se týkají bezpečnosti.

### 4. Mimo kód: předej majiteli přesně
Nikdy netvrď, že je hotovo, když to vyžaduje DNS nebo hosting. Změny DNS a domén zamítá i bezpečnostní vrstva Claude Code, nesnaž se je obejít. Dej majiteli hotové hodnoty:

- **Primární doména (Vercel)**: Settings → Domains → u apexu zrušit přesměrování, u `www` nastavit 308 na apex (nebo naopak, podle canonical). Tohle je nejčastější kořenová příčina.
- **SPF** (TXT na apex): Google Workspace `v=spf1 include:_spf.google.com ~all`. Pozor, SPF smí být na doméně jen jeden. Odesílání přes Resend má vlastní SPF na subdoméně `send.`
- **DKIM**: Google Admin → Aplikace → Google Workspace → Gmail → Ověřování e-mailů → vygenerovat, TXT `google._domainkey` do DNS, pak zapnout podpis. Selektor `resend` patří jen Resendu.
- **DMARC**: nejdřív `v=DMARC1; p=quarantine; rua=mailto:<adresa>`, na `p=reject` až po týdnu či dvou hlášení. Hned `reject` hrozí zahozením legitimní pošty.
- **DNSSEC, CAA**: u registrátora / DNS poskytovatele. CAA pro Vercel: `0 issue "letsencrypt.org"`.
- **AAAA (IPv6)**: Vercel pro apex AAAA nenabízí, ignoruj. **MTA-STS**: volitelné, nepočítá se do skóre.
- **Google Admin / Search Console / profily**: URL na LinkedIn, Facebook doplňuje majitel.

Zjisti, kde DNS běží (`dig NS`), ať jsou kroky pro správného poskytovatele (WEDOS, Cloudflare, Active24 aj.).

### 5. Zopakuj měření a reportuj
Po opravách a po nasazení spusť skript znovu (`--lighthouse`). Report majiteli stručně, česky, **nejdřív to nejdůležitější**:
1. Kořenová příčina a co s ní (pokud je).
2. Co jsem opravil v kódu.
3. Co musí udělat majitel (kroky).
4. Co jsem schválně neopravoval a proč (falešné poplachy, vědomá rozhodnutí, nepotvrzené skóre).
5. Co ještě není nasazeno ani commitnuto.

Nehlas "opraveno", dokud to není ověřené na živé URL. Lokálně ověřené řekni jako lokálně ověřené.

## Pravidla

- **Neověřený nález neopravuj.** Nejdřív změř.
- **Nevymýšlej údaje** kvůli skóre: žádná adresa, profil, reference ani číslo, které nemáš od majitele.
- **Nesliž z bezpečnosti ani ze souhlasu s cookies**, aby se zlepšilo skóre. Cookie banner patří jen tam, kde se skutečně měří.
- **Scanner ≠ pravda.** Skóre PageSpeed ze scanneru bývá nižší než vlastní Lighthouse (throttling, přesměrování, jiný čas). Dvě měření, žádná panika.
- **Zapiš do paměti** každou změnu, i rozhodnutí "neopravovat".
- Texty pro majitele česky, věcně, bez vaty. Pokud skill vyrábí text určený veřejnosti (llms.txt, meta popisy), vyhýbej se rodově vázaným formulacím a vycpávkám.
