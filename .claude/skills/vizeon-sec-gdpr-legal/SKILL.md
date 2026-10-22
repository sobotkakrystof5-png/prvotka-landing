---
name: vizeon-sec-gdpr-legal
description: Právně-bezpečnostní rámec pro aplikace s osobními a účetními daty v ČR/EU – role správce a zpracovatele, zpracovatelská smlouva (čl. 28 GDPR), záznamy o zpracování, právní základ, práva subjektů (přístup, výmaz, přenositelnost), retence vs. zákonné archivační lhůty (účetnictví, DPH, AML), předávání mimo EHP a subdodavatelé (Supabase, Vercel, AI poskytovatelé), hlášení porušení do 72 h, DPIA, NIS2 / zákon o kybernetické bezpečnosti a požadavky na dodavatele, AI Act transparentnost, offboarding klienta. Použij při zahájení zakázky, při návrhu ukládání osobních údajů, mazání a exportu, při volbě dodavatele/AI služby a při incidentu. Pokrývá sekci U. Nejde o právní poradenství – sporné body konzultuj s právníkem.
---

# GDPR, smlouvy a regulace (sekce U)

> Tento skill shrnuje technicko-organizační požadavky, které musí aplikace podporovat. **Není to právní rada.** Konkrétní lhůty a povinnosti ověřuj v aktuálním znění předpisů a s právníkem/daňovým poradcem klienta.

## 1. Role a smlouvy (#226, #227, #233)
- Klient (účetní kancelář, firma) = obvykle **správce**. VIZEON jako provozovatel/vývojář s přístupem k datům = **zpracovatel**. Supabase, Vercel, Resend, AI poskytovatel = **podzpracovatelé**.
- **Zpracovatelská smlouva (DPA, čl. 28 GDPR)** mezi klientem a VIZEON: předmět, doba, povaha a účel, typy údajů a subjektů, pokyny, mlčenlivost, TOMs (odkaz na `SECURITY.md`), podzpracovatelé + postup schvalování změn, součinnost u práv subjektů a incidentů, výmaz/vrácení dat po skončení, audity.
- DPA s podzpracovateli: Supabase, Vercel, Resend, Sentry, AI poskytovatel – uzavřít (obvykle online v dashboardu) a archivovat.
- Seznam podzpracovatelů v `docs/security/subprocessors.md` (název, služba, data, lokalita, mechanismus předání, DPA odkaz).

## 2. Lokalita dat a předávání mimo EHP (#232)
- Supabase projekt v EU regionu (např. Frankfurt `eu-central-1`); Vercel Functions region v EU (`fra1`) – nastav v `vercel.json`/projektu, protože výchozí region může být mimo EU.
- U dodavatelů z USA: ověř účast v EU-US Data Privacy Framework nebo standardní smluvní doložky (SCC) + posouzení předání. Zapiš do `subprocessors.md`.
- AI poskytovatel: region zpracování, retence promptů, zákaz tréninku na datech; bez toho žádné osobní údaje do promptu (#164).

## 3. Záznamy, účel, právní základ (#228)
- Podklad pro záznamy o činnostech zpracování (čl. 30): z `data-inventory.md` – kategorie údajů, subjektů, účel, právní základ, příjemci, lhůty, TOMs.
- Minimalizace: neukládej údaje „pro jistotu“ (rodná čísla, kopie OP, datum narození) bez jasného účelu a právního základu.

## 4. TOMs – technická a organizační opatření (#229, čl. 32)
Odkaz na celý balík `vizeon-sec-*`: šifrování, řízení přístupu, izolace, audit, zálohy a test obnovy, testování, incidenty, školení, MFA. Dokument `SECURITY.md` slouží jako příloha DPA.

## 5. Práva subjektů (#230)
Aplikace musí umět (pro správce, ideálně v admin rozhraní s auditem):
- **Přístup/export** všech údajů o osobě (strojově čitelně – JSON/CSV) – napříč tabulkami, Storage, logy s PII.
- **Opravu**.
- **Výmaz/omezení** – s ohledem na zákonné lhůty (viz níže): údaje, které musí zůstat (účetní doklady), se omezí (skryjí, zablokují) místo výmazu; ostatní smazat nebo anonymizovat.
- **Námitku / odvolání souhlasu** (marketingové kontakty v CRM).
- Ověření totožnosti žadatele; lhůta 1 měsíc; vše auditovat.

## 6. Retence vs. archivace (#231, N-25)
Typické zákonné lhůty v ČR, které **mají přednost před žádostí o výmaz** (ověř aktuální znění a s daňovým poradcem klienta):
| Data | Typická lhůta | Zdroj |
|---|---|---|
| Účetní doklady, účetní knihy | 5 let od konce účetního období | zákon o účetnictví (563/1991 Sb., § 31) |
| Účetní závěrka, výroční zpráva | 10 let | zákon o účetnictví |
| Daňové doklady DPH | 10 let od konce zdaňovacího období | zákon o DPH (235/2004 Sb., § 35) |
| Mzdové listy, podklady důchodového pojištění | až 30 let (dle typu) | zákon o organizaci a provádění sociálního zabezpečení |
| AML identifikace klientů (účetní jsou povinné osoby) | 10 let od ukončení vztahu | AML zákon (253/2008 Sb.) |
| CRM kontakty, obchodní komunikace | po dobu vztahu + promlčení (obvykle 3–4 roky) | oprávněný zájem |
| Logy s osobními údaji | 90–365 dní | oprávněný zájem (bezpečnost) |
| Zálohy | dle RPO, typicky 35 dní – 12 měsíců | – |

Implementace: retenční pravidlo per tabulka/typ dokumentu v DB (`retention_policies`), plánovaná úloha s auditem; „legal hold“ příznak, který mazání blokuje.

## 7. Porušení zabezpečení (#234)
- Zpracovatel → správce: **bez zbytečného odkladu** (ve DPA dohodni konkrétní lhůtu, např. 24 h).
- Správce → ÚOOÚ: bez zbytečného odkladu, pokud možno **do 72 h** od zjištění, ledaže porušení pravděpodobně nepředstavuje riziko. Subjektům, pokud je riziko vysoké.
- Každé porušení (i neohlašované) se dokumentuje.
- Postup v `vizeon-sec-ops-resilience/assets/incident-runbook.md`.

## 8. DPIA (#235)
Zvaž posouzení vlivu (čl. 35) u: rozsáhlého zpracování zvláštních kategorií (zdravotní údaje ve mzdách), systematického monitorování zaměstnanců, AI hodnocení osob, kombinace datových sad, nahrávání a přepisu hovorů AI agentem. Podklad: threat model + data inventory.

## 9. NIS2 / zákon o kybernetické bezpečnosti (N-24)
- Od 1. 11. 2025 platí v ČR nový zákon o kybernetické bezpečnosti (č. 264/2025 Sb.) implementující NIS2. Regulované subjekty (dle odvětví a velikosti) musí řídit rizika **dodavatelského řetězce**.
- Pokud je klient regulovaný, přenese na VIZEON smluvní požadavky: bezpečnostní opatření, hlášení incidentů (časné varování řádově do 24 h), právo auditu, řízení zranitelností, součinnost s NÚKIB. Ptej se na to při zahájení zakázky a zapiš do `SECURITY.md`.
- Tento balík (threat model, řízení přístupu, logování, incident response, zálohy, supply chain, testování) pokrývá většinu technických očekávání, ale neověřuje splnění vyhlášky – to musí posoudit klient/specialista.

## 10. AI Act (N-26)
- Systémy komunikující s lidmi (chatboti, voice agenti) musí informovat, že jde o AI (transparentní povinnosti). Generovaný obsah označovat dle požadavků. Ověř aktuální harmonogram účinnosti jednotlivých povinností.
- AI pro hodnocení zaměstnanců, úvěruschopnosti apod. může být vysoce riziková → mimo běžný rozsah našich projektů, vyžaduje samostatné posouzení.

## 11. Offboarding klienta (N-39)
Při ukončení smlouvy: export všech dat klientovi v dohodnutém formátu → potvrzení převzetí → výmaz z DB, Storage, offsite záloh (nebo doložená expirace), logů, integrací (n8n/Make běhy), AI poskytovatele, lokálních kopií → písemné potvrzení výmazu. Pokud data musí zůstat (archivace), je to výslovně ve smlouvě.

## Kontroly: #164, #226–#235, N-24, N-25, N-26, N-39
