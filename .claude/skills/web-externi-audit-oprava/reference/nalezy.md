# Tabulka nálezů externích scannerů: příčina → ověření → oprava

Sloupec "Skutečná příčina" vychází z reálného případu Prvotka (2026-10-22). U nového webu to ověř, nepředpokládej.

## Kategorie scanneru a typické nálezy

| Nález (jak ho hlásí scanner) | Skutečná příčina / zda je pravda | Ověření | Oprava |
|---|---|---|---|
| **Soubor security.txt: chybí** | Apex doména přesměrovává 308 na www, scanner přesměrování nesleduje. Soubor v repu byl. | `curl -sI https://apex/.well-known/security.txt` → 308? | Přepnout primární doménu. Navíc zkontroluj `Expires` a `Canonical` |
| **Soubor llms.txt: chybí** | Skutečně chyběl (a navíc stejné přesměrování) | `curl -sI https://apex/llms.txt` | route `src/app/llms.txt/route.ts`, text z existujících dat |
| **Rozměry titulního obrázku: nepodařilo se načíst** | `og:image` míří na apex, ten přesměrovává. Meta `og:image:width/height` byla v pořádku | `curl -sI` na URL z `og:image` → 308 | Přepnout primární doménu |
| **Nastavení jazyku: chybí** (Sociální sítě) | `<html lang>` i `og:locale` byly. Pravděpodobně scanner viděl jen odpověď 308 bez těla | grep na lang a og:locale | Přepnout primární doménu, pak znovu |
| **Síla pravidel CSP: unsafe-inline, unsafe-eval** | `unsafe-eval` v produkci nebyl. `unsafe-inline` jen v `style-src` (Motion/next/image styly atributy) | `curl -sI` a rozdělit CSP po direktivách | Neslabit. Zpřísnění `style-src` jen s testem v prohlížečích, jde o vědomou výjimku |
| **Skripty blokující vykreslení: 1** | `nomodule` polyfill z Next.js, v kódu nevypnutelný | `<script ... noModule>` bez `async` | Ignorovat |
| **Počet obrázků** | Obsahová věc (málo obrázků) | – | Jen s podklady od majitele, žádné fotobanky |
| **Souhlas s cookies: měření Google Analytics 4** | Falešný poplach. Na webu žádné GA nebylo (scanner zachytil CSS třídy `g-*` nebo cizí data) | `grep -i "googletagmanager\|gtag(" ` v HTML | Nic. Banner jen při skutečném měření |
| **Informace u formuláře: 1 z 1 bez informace** | Formulář se renderuje jen na klientu (`ssr:false`), informace o údajích byla až uvnitř něj | HTML ze serveru: je tam odkaz na zásady? | Info s odkazem do zástupného bloku v SSR |
| **Validita W3C: N chyb** | Radix slider bez `aria-valuenow` v SSR (4×). `aria-label` na `div` bez role scanner uvádí jako příklad, ověř validátorem | `validator.w3.org/nu/?out=json` | `aria-valuenow` na Thumb; `aria-label` jen na prvky s rolí |
| **DNSSEC nepodepsaná** | Nastavuje se u registrátora. (Skript může DS vidět a scanner ne, ověř u registrátora) | `dig +short DS apex` | Registrátor |
| **SPF chybí** | Pravda. Subdoména `send.` má SPF pro Resend, apex ne | `dig +short TXT apex` | Majitel: TXT v DNS |
| **DMARC: chybí / jen p=none** | Pravda (p=none = jen sledování) | `dig +short TXT _dmarc.apex` | Majitel: quarantine → reject |
| **DKIM nenalezen** | Pravda pro Google, selektor `google` není. `resend` patří Resendu | `dig +short TXT google._domainkey.apex` | Majitel: Google Admin |
| **IPv6 AAAA chybí** | Vercel pro apex AAAA nenabízí | – | Ignorovat |
| **MTA-STS, CAA** | "nepočítá se do skóre" | – | Volitelné, CAA snadné |
| **Vizitka firmy: neuvádí adresu ani telefon** | Pravda (telefon, e-mail); adresu majitel nezveřejňuje | JSON-LD v HTML | Doplnit telefon, e-mail, contactPoint; `sameAs` jen se skutečnými profily; adresu neuvádět bez souhlasu |
| **Výkon mobil 62/100, desktop 77/100** | Vlastní Lighthouse vyšel 90/99. Rozdíl dělá throttling PSI a přesměrování apex→www | `npx lighthouse` mobil + desktop | Přepnout doménu, změřit znovu; nehonit číslo |
| **Odstraňte nepoužívaný JavaScript (~105 kB)** | Chunk formuláře (Zod + RHF), načítaný hned po hydrataci | stáhnout chunk, `grep -o zod` | Načítat při přiblížení sekce |
| **Starší JavaScript** | Polyfily v chunku frameworku (`Array.prototype.at` ap.) | Lighthouse legacy-javascript | Většinou neovlivnitelné z kódu |
| **Odstraňte nepoužívané CSS** | Sdílené Tailwind CSS, jeden soubor ~15 kB | Lighthouse | Zanedbatelné |
| **Kontrastní poměr / odkazy jen barvou / dotykové plochy** | Vlastní Lighthouse přístupnost 100 | Lighthouse accessibility | Neopravovat naslepo, ověřit konkrétní prvek |
| **Minimalizujte práci v hlavním podprocesu / Strom síťových závislostí** | Důsledek JS a řetězu požadavků | Lighthouse | Hlavní vliv má odložení JS a přesměrování |

## Kořenové příčiny (zkontroluj jako první)
1. Apex↔www přesměrování nesouhlasí s canonical/og:url/sitemap/JSON-LD.
2. Placeholdery v kódu (viz skill `web-predani-checklist`).
3. Klientsky renderované části (formulář), které scanner v HTML ze serveru nevidí.
4. Scanner měří jiný stav než ty (cache, A/B, jiný čas): změř vlastním nástrojem.

## Jak scanner vypadá
Skóre po kategoriích a "k řešení" za sebou, detail zamčený za registrací. Titulky nálezů jsou jediné, co máš, takže si je přelož na konkrétní kontrolu (sloupec Ověření) a jdi z reality.
