---
name: web-predani-checklist
description: Pre-launch / pre-handover checklist for client websites that catches what outsiders see in view-source — leftover template placeholders (REPLACE-WITH-DOMAIN, TODO, lorem, example.com) in canonical, og:url, robots.txt, sitemap.xml and JSON-LD, headings with no text under them, a domain that was guessed instead of confirmed, and a "deployed" claim that was never verified against the real hosting account and live URL. Use before every deploy, push to production, handover to a client, or when the user says "zkontroluj web před předáním", "je to nasazené?", "deploy hotový?", "push na vercel", "předání webu", or pastes a cold-outreach e-mail from another web developer pointing out flaws on a client site. Also trigger when finishing any client website session where a domain, canonical URL or placeholder is still open. Do NOT use for security headers (web-security-audit) or full SEO audits (seo-audit).
---

# Web: kontrola před předáním a nasazením

Vzniklo z reálného případu (web malíře Varchola): v kódu zůstala doména `REPLACE-WITH-DOMAIN.cz` v canonical, `og:url`, `robots.txt` a `sitemap.xml`, čtyři `<h3>` neměly pod sebou žádný text, doména byla "kandidát z Firmy.cz" a ukázala se jako špatná, a "push na Vercel" se tvářil jako hotový, ale Vercel projekt v dostupném účtu vůbec neexistoval a živá URL vracela 404. Na všechno upozornil až cizí web designér studeným e-mailem. Všechno to šlo chytit za pár minut.

## 1. Spusť skript

```bash
bash "/Users/krystofsobotka/Documents/claude skills/web-predani-checklist/scripts/predani-check.sh" <kořen-projektu>
```

Hledá zbytky placeholderů (`REPLACE-WITH`, `TODO`, `FIXME`, `lorem`, `example.com`, `XXX`, `000 000`, `TBD`, `doplnit`) v `*.html, *.xml, *.txt, *.json, *.js, *.css` a hlásí nadpisy `h1–h6` bez textu pod sebou (do dalšího nadpisu je jen ikona/prázdno). Ignoruje `node_modules`, `.git`, `.claude`. Nenulový výstup = nejdřív oprav, pak teprve nasazuj.

Nadpis, který je čistě dekorativní štítek, má být `<p>`/`<span>`, ne `<h3>`. Jinak mu doplň jednu krátkou větu, jen z faktů, které už na webu nebo v briefu jsou.

## 2. Doména: nikdy nehádej

- Skutečnou doménu musí potvrdit klient/uživatel. Adresa z Firmy.cz, Google profilu nebo podobného seznamu je jen vodítko, ne fakt (u Varchola se lišila: `malirske-prace-…` vs. skutečná `malirske-nateracske-prace-…`).
- Dokud není potvrzená, drž placeholder jako **viditelný blokátor** v paměti projektu (index/memory) a při každém předání ho vyjmenuj. Nenahrazuj ho tiše odhadem.
- Po potvrzení sjednoť na jedno místo pravdy a nahraď všude naráz: canonical, `og:url`, `og:image` (absolutní URL), `robots.txt` (`Sitemap:`), `sitemap.xml` (`<loc>`), JSON-LD (`url`, `@id`, `image`), případně hreflang. Rozhodni a drž `www` vs. bez `www` jednotně.
- Po změně spusť `grep -rn "<stará-doména>"` na nulu.

## 3. "Nasazeno" platí jen po ověření

Push na GitHub není deploy. Před tvrzením "hotovo":

1. `git push` výstup: sedí cílový repozitář? (Hláška "This repository moved" znamená změnu vlastníka/účtu.)
2. Existuje hostingový projekt? U Vercelu: `list_teams` → `list_projects` v účtu, ke kterému máme přístup. Projekt může být pod jiným účtem (typicky klientův), smazaný, nebo odpojený od repa.
3. Živá URL: `curl -sS -o /dev/null -w "%{http_code}"` musí dát 200 a `curl -s URL | grep -c "<něco z poslední změny>"` musí najít novou věc. 404, SSL chyba nebo stará verze = nenasazeno.
4. Pokud se projekt nenajde, **neřeš to vytvořením nového projektu na vlastní pěst**. Řekni, co jsi zjistil, a nabídni: znovu propojit repo v správném účtu, nebo založit nový projekt (pak je nutné znovu nastavit env proměnné, např. `RESEND_API_KEY`, a doménu + DNS).
5. Po připojení vlastní domény ověř, že `https://<doména>/` vrací 200, canonical odpovídá adrese, a `/robots.txt` + `/sitemap.xml` se načtou.

## 4. Ostatní věci viditelné zvenčí (rychlá kontrola)

- `<title>` a meta description unikátní a vyplněné, `lang="cs"`.
- Telefon, e-mail, adresa, IČO/DIČ shodné všude (patička, kontakt, JSON-LD). Nevymýšlej chybějící údaje (rok založení, IČO), nech placeholder a zapiš do otevřených otázek.
- Kontaktní formulář je opravdu odzkoušený na produkci (klíč je nastavený v hostingu, ne jen v `.env.example`).
- Žádné chyby v konzoli, horizontální přetečení na ~360 px.

## 5. Studený e-mail od cizího webaře

Když uživatel vloží takový e-mail: ověř každé tvrzení v kódu (grep, view-source), ne podle e-mailu. Často jsou pravdivá, protože jde o věci vidět ve zdrojáku. Uživateli řekni, co sedí a co ne, a opravit nabídni bez reakce na nabídku služeb. Zapiš problém do paměti projektu jako poučení, ať se nevrací.

## 6. Na konci

Pokud se v projektu něco změnilo, aktualizuj paměť projektu (`.claude/memory/memory.md` + `index.md`) a výslovně napiš, co zůstává otevřené (doména, deploy, env proměnné).
