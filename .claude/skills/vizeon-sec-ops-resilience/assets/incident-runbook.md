# Incident runbook – <projekt>

> Vytiskni / ulož offline. Během incidentu nemusí být dostupné vše online.

## Kontakty
| Role | Jméno | Telefon | Zástup |
|---|---|---|---|
| Incident lead (VIZEON) | | | |
| Technický zásah | | | |
| Klient – odpovědná osoba | | | |
| Klient – DPO / právník | | | |
| Supabase support / Vercel support | ticket přes dashboard | | |

## 0. Detekce a založení (0–15 min)
- [ ] Založ záznam `docs/security/incidents/<datum>-<název>.md`, piš časovou osu (UTC + místní čas).
- [ ] Určí se incident lead. Jeden komunikační kanál.
- [ ] Prvotní klasifikace: **SEV1** (únik/manipulace dat, kompromitace účtu/klíče, výpadek produkce) / **SEV2** / **SEV3**.

## 1. Zadržení (containment)
Podle typu:
| Situace | Okamžitý krok |
|---|---|
| Kompromitovaný uživatelský účet | `memberships.status='disabled'`, `auth.admin.signOut(user)`, reset hesla/MFA, revokace tokenů |
| Uniklý klíč | runbook rotace (`vizeon-sec-secrets-data/references/key-rotation-runbook.md`) |
| Zneužívaná funkce/endpoint | feature flag OFF, WAF pravidlo, Attack Challenge Mode |
| Chybný deploy otevřel data | Vercel Instant Rollback; pokud migrace → oprava politiky hotfix migrací |
| AI agent dělá neautorizované akce | kill-switch agenta, revokace klíče AI poskytovatele |
| Kompromitace Vercel/Supabase/GitHub účtu | odhlásit všechny relace, změnit hesla, MFA, revokovat tokeny, zkontrolovat členy, deploy klíče, webhooky, env proměnné |
| Ransomware / smazání dat | zastavit zápisy (maintenance flag), NEMAZAT nic, připravit obnovu z PITR/offsite |

**Neničit důkazy**: nemazat logy, neodstraňovat záznamy, nerestartovat zbytečně.

## 2. Uchování důkazů (#221)
- [ ] Export Supabase logů (API, Auth, Postgres, Storage) za relevantní období.
- [ ] Export Vercel runtime/firewall logů, audit logu týmu.
- [ ] `select * from audit.events where at > ...` → CSV, hash souboru.
- [ ] GitHub audit log, seznam deployů.
- [ ] `audit.verify_chain()` – byl audit log manipulován?
- [ ] Uložit do odděleného úložiště s omezeným přístupem.

## 3. Analýza rozsahu (#222)
- Jaké údaje, kterých firem/osob, kolik záznamů, v jakém období?
- Vstupní vektor (kořenová příčina), jak dlouho útočník měl přístup?
- Existují další kopie dat (exporty, integrace, AI poskytovatel)?

## 4. Právní povinnosti (do 72 h)
- [ ] Jde o porušení zabezpečení osobních údajů? → **zpracovatel (VIZEON) informuje správce (klienta) bez zbytečného odkladu**.
- [ ] Správce posoudí ohlášení ÚOOÚ (do 72 h od zjištění, pokud je riziko pro práva osob) a oznámení subjektům (vysoké riziko).
- [ ] Spadá klient pod zákon o kybernetické bezpečnosti (NIS2)? → hlášení NÚKIB dle režimu (časné varování v řádu 24 h).
- [ ] Smluvní povinnosti vůči klientovi (SLA, DPA).
Viz `vizeon-sec-gdpr-legal`.

## 5. Odstranění a obnova (#223)
- [ ] Oprava příčiny (kód, politika, konfigurace) + regresní test (N-40).
- [ ] Rotace všech potenciálně dotčených klíčů.
- [ ] Obnova dat (PITR / offsite) do ověřeného prostředí; kontrola integrity.
- [ ] Před obnovením provozu: security review opravy, audit SQL, testy, monitoring zvýšené citlivosti.

## 6. Komunikace (#224)
- Klient: první zpráva do 24 h (co víme, co děláme, další update kdy).
- Dotčené osoby: text připraví správce; srozumitelně, co se stalo, jaké údaje, co mají udělat.
- Nikdy nespekulovat, nesdělovat neověřené informace.

## 7. Po incidentu
- [ ] Post-mortem bez hledání viníka do 5 pracovních dnů: časová osa, příčina, co fungovalo, co ne, akční body s vlastníky a termíny.
- [ ] Aktualizovat threat model, testy, runbook, alerty.

## Cvičení (#225)
Datum posledního cvičení: ____ · Scénář: ____ · Zjištění: ____
