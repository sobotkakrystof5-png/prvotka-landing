---
name: vizeon-sec-release-gate
description: Produkční bezpečnostní brána a provozní údržba – 12 povinných bran před nasazením firemního systému, sběr důkazů ke každé bráně, registr zbytkových rizik, výjimky, formální schválení odpovědnou osobou, předání aplikace klientovi (vlastnictví účtů, přístupy, dokumentace, odpovědnosti), pravidelné měsíční/kvartální/roční bezpečnostní kontroly, správa přístupů zaměstnanců a externistů, patch management a re-assessment nových funkcí. Použij před prvním ostrým spuštěním, před každým větším releasem, při předání projektu klientovi a při plánování provozu. Pokrývá sekce X a Z.
---

# Produkční brána, předání a provoz (sekce X, Z)

**Hlavní pravidlo:** aplikace nesmí zpracovávat skutečná citlivá data klientů, dokud neprojde touto bránou a nejsou vyřešena nepřijatelná rizika. Brána se posuzuje podle **důkazů**, ne podle prohlášení.

## Postup
1. Vytvoř `docs/security/release-gate-<YYYY-MM-DD>.md` ze šablony `assets/release-gate.md`.
2. Definuj rozsah (#276): verze/commit, prostředí, komponenty, co je mimo rozsah.
3. U každé brány doplň důkaz (odkaz na CI běh, výstup SQL, report, screenshot nastavení, zápis testu obnovy). Bez důkazu = **neprošlo**.
4. Nálezy: P0 = stop. P1 = oprava, nebo výjimka se schválením, kompenzačním opatřením a termínem (#279). Vše otevřené → `risk-register.md` (`assets/risk-register.md`) (#285).
5. Odpovědná osoba (VIZEON) a zástupce klienta podepíší (#286).

## 12 povinných bran
| # | Brána | Minimální důkaz | Kontroly |
|---|---|---|---|
| G1 | Autentizace, MFA administrátorů, bezpečné relace | `auth-config.md` (screenshot/export nastavení), test AAL2 v RLS | #11–#22, #111–#118 |
| G2 | Autorizace všech API, Server Actions a datových operací | `endpoints.md` 100 % s auth sloupcem, authz-matrix testy zelené, sec-scan bez P0 | #23–#34, #53–#75 |
| G3 | Supabase RLS, GRANT a izolace firem otestované | `audit-gate.sh` bez P0, Security Advisor bez neřešených chyb, pgTAP testy cizí firmy | #35–#52, #280 |
| G4 | Žádné uniklé klíče, žádný běžný přístup přes secret key | gitleaks celé historie, `secrets-inventory.md`, grep admin klienta jen v admin modulu, Vercel env Sensitive | #100–#110, #281 |
| G5 | Dokumenty bezpečně uložené, přístupové odkazy ověřené | privátní buckety (audit 15), testy cizího dokumentu, expirace signed URL | #88–#99 |
| G6 | Zranitelnosti, závislosti a zdrojový kód | CI: SAST, SCA bez High/Critical, CodeQL, sec-scan | #165–#174, #249, #251 |
| G7 | Bezpečná konfigurace prostředí | oddělené projekty, Preview protection, MFA na účtech, žádné debug, hlavičky (securityheaders A/A+) | #7–#8, #119–#129 |
| G8 | Ochrana proti zneužití API a monitoring | rate limity na citlivých cestách (test 429), alerty nastavené a vyzkoušené (test alert doručen) | #186–#205 |
| G9 | Zálohy a obnova DB i dokumentů otestované | `restore-test-<datum>.md` s naměřeným RTO, offsite záloha Storage funguje | #206–#215, #283 |
| G10 | Automatické bezpečnostní testy prošly | odkaz na zelený CI běh commitu, který se nasazuje | #236–#248, #282 |
| G11 | Nezávislý penetrační test (citlivé firemní systémy) | report + retest opravených nálezů | #250, #255–#258 |
| G12 | Zbývající rizika zdokumentovaná a provoz schválen | `risk-register.md`, incident runbook s kontakty, podpisy | #284–#286 |

Navíc pro aplikace s AI agenty: prompt injection testy, kill-switch vyzkoušený, limity nákladů (#153–#164). Pro aplikace s osobními údaji: DPA, subprocessors, záznamy o zpracování (#226–#235).

## Předání klientovi (#266, N-42)
- **Klient vlastní** produkční účty: doménu, Vercel team, Supabase organizaci, Stripe, Resend, AI poskytovatele. VIZEON má delegovaný přístup s minimální rolí. Pokud účty zatím vlastní VIZEON, převod je součástí předání a zapisuje se.
- Předávací protokol (`assets/handover.md`): seznam účtů a rolí, kde jsou secrets (bez hodnot), dokumentace (`docs/security/`), RPO/RTO, runbooky, kontakty, rozdělení odpovědností (kdo patchuje, kdo monitoruje, kdo reaguje na incident, SLA), plán pravidelných kontrol.
- Po předání: rotace všech secrets, ke kterým měli přístup lidé, kteří už přístup mít nemají.

## Provozní údržba (sekce X)
Určená osoba odpovědná za bezpečnost provozu (#259) – jménem v `SECURITY.md`.

| Frekvence | Činnost | Kontroly |
|---|---|---|
| Průběžně | Dependabot/advisories; kritické CVE frameworku do 24–48 h, ostatní High do 7 dní | #260, #261 |
| Týdně | Přehled alertů, neúspěšných přihlášení, authz.denied; security workflow (cron) | #194 |
| Měsíčně | Aktualizace závislostí; Supabase Security Advisor; kontrola nových členů a integrací | #260, #264 |
| Kvartálně | Revize přístupů (Vercel, Supabase, GitHub, registrátor, správce hesel, aplikace – admin role) a odebrání nepotřebných; test obnovy ze zálohy; revize threat modelu; audit SQL na produkci (read-only) | #262, #264, #213 |
| Ročně | Pentest (citlivé systémy), table-top cvičení incidentu, rotace dlouhodobých klíčů, revize DPA a subprocessors, kontrola pracovních stanic | #255, #225, #265 |
| Při odchodu člověka | Okamžité odebrání přístupů, rotace sdílených secrets, předání odpovědností | #263 |
| Nová významná funkce | Mini threat model (`vizeon-sec-threat-model`), aktualizace matice a testů | #267 |

Externisté (#262): vlastní účty (nikdy sdílené), minimální role, časově omezený přístup, NDA + DPA, odebrání po skončení.

## Kontroly: #259–#267, #276–#286, N-42
Šablony: `assets/release-gate.md`, `assets/risk-register.md`, `assets/handover.md`
