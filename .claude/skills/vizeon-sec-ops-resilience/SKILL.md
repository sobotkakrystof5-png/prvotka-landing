---
name: vizeon-sec-ops-resilience
description: Logování, monitoring, detekce útoků, zálohy, obnova a reakce na incidenty – append-only audit log v Postgres, bezpečnostní události a alerty (neúspěšná přihlášení, odepřené přístupy k cizím datům, hromadné stahování, změny oprávnění), log drains, Sentry bez PII, honeytokeny, zálohy DB (PITR) i Supabase Storage (nejsou v DB záloze!), offsite neměnné kopie, RPO/RTO, test obnovy, incident runbook, uchování důkazů, komunikace a cvičení. Použij při návrhu audit logu, nastavování monitoringu a záloh, před spuštěním do produkce a vždy při podezření na incident. Pokrývá sekce Q, S, T.
---

# Logování, monitoring, zálohy, incidenty (sekce Q, S, T)

Předpoklad: **jednou k incidentu dojde**. Rozhoduje, za jak dlouho ho zjistíš, jak rychle ho zastavíš a zda máš z čeho obnovit.

## 1. Audit log (Q, N-22)

Dvě vrstvy:
- **Bezpečnostní/aplikační audit v DB** (`references/audit-log.sql`): schéma `audit` (neexponované), tabulka `audit.events` jen pro INSERT, triggery blokující UPDATE/DELETE, hash řetězec pro detekci manipulace, čtení pro ownera firmy přes kontrolovanou funkci.
- **Provozní logy**: Vercel runtime logy + Supabase logy (API, Auth, Postgres, Storage) → **log drain** do externího úložiště s delší retencí a omezeným přístupem (#186, #190).

Co logovat (#187, #188):
| Událost | Data |
|---|---|
| auth.login.success/failure, MFA, reset, změna hesla/e-mailu | user_id/e-mail hash, IP, UA, výsledek |
| authz.denied (DAL vrátil Forbidden/NotFound pro existující cizí záznam) | user, org, zdroj, ID |
| member.invite/accept/change_role/disable | actor, target, role |
| data.export, document.download (citlivé), bulk operace | actor, org, rozsah, počet |
| admin.* , impersonace | actor, impersonated, důvod |
| config.change (integrace, webhooky, API klíče) | actor, co |
| agent.tool_call (AI) | user, nástroj, výsledek, schválení |
| billing.* , webhook.payment | event id, org |

Zakázané v logu: hesla, tokeny, cookies, celé dokumenty, rodná čísla, čísla karet (#191). Logy obsahující osobní údaje mají retenci a omezený přístup (#190).

## 2. Detekce a alerty (#189, #192–#195)
Minimální sada alertů (cron funkce každých 5–15 min nad `audit.events` + Supabase/Vercel logy, výstup e-mail/Slack/SMS):
- ≥ 10 `authz.denied` od jednoho uživatele za 10 min → možná enumerace IDOR.
- ≥ 20 neúspěšných přihlášení na účet / ≥ 100 z IP za 10 min.
- Stažení > N dokumentů nebo export > N řádků za hodinu od jednoho uživatele (#192).
- Změna role na owner/manager, nový člen ve firmě mimo pracovní dobu, vypnutí MFA (#193).
- Použití secret key z nečekaného zdroje (Supabase API logy podle `apikey` role a IP), změny env proměnných ve Vercelu, nový deploy mimo CI.
- Chyby 5xx / spike invokací / spend alerty.
- **Honeytokeny** (N-21): kanárkový kontakt s unikátním e-mailem na monitorované doméně v každé firmě (pokud na něj přijde e-mail, data unikla); falešný „AWS klíč“ z canarytokens v neprodukčním repu/konfiguraci.

Každý alert má **vlastníka** a postup v runbooku (#195). Alert, na který nikdo nereaguje, neexistuje.

Sentry/APM: `sendDefaultPii: false`, scrubbing, sampling; nepřenášej request body.

## 3. Zálohy a obnova (S)

### Co Supabase dělá a nedělá (#206, #207)
- Databáze: denní zálohy podle plánu; **PITR** jako doplněk – pro účetní/fakturační aplikace doporučeno (RPO minuty).
- **Objekty ve Storage nejsou součástí databázových záloh.** Smazaný/přepsaný soubor bez vlastní zálohy je pryč.
- Zálohy jsou ve stejném účtu – kompromitace účtu nebo chyba v organizaci je může ohrozit (#209, #210).

### Náš standard
| Co | Jak | Frekvence | Retence |
|---|---|---|---|
| DB | Supabase daily + PITR | průběžně | dle plánu |
| DB offsite | `pg_dump` (custom format) → šifrování `age` → S3-kompatibilní úložiště v EU s **versioningem a Object Lock** (compliance mode) | denně | 35 dní + měsíční 12 měs. |
| Storage | `rclone copy` přes Supabase S3 protokol → stejné offsite úložiště (versioning, Object Lock), nikdy `sync` (propaguje smazání) | denně | 35 dní + dle retence dokladů |
| Konfigurace | migrace v gitu, `docs/security/`, export nastavení Auth/Storage/API | při změně | git |

Šablona: `assets/backup.yml` (GitHub Actions s environmentem `backup`, oddělené přístupové údaje – backup účet umí jen zapisovat, ne mazat; dešifrovací klíč `age` offline u odpovědné osoby, ne v CI) (#208).

### RPO/RTO (#211, #212, #215)
Zapiš do `SECURITY.md` s klientem, např.: RPO 15 min (PITR) / 24 h (offsite), RTO 4 h. Retence záloh musí sedět s GDPR (smazaná data zmizí ze záloh do N dní – uvést v informacích pro subjekty).

### Test obnovy (#213, #214, #283)
Minimálně **kvartálně a před spuštěním**:
1. Obnov offsite dump do čistého Supabase projektu (nebo `supabase start` lokálně), aplikuj Storage objekty.
2. Ověř: počty řádků klíčových tabulek, kontrolní součty dokumentů (`documents.sha256`), přihlášení, RLS testy.
3. Změř čas → porovnej s RTO.
4. Scénáře: smazání dat uživatelem, chybná migrace (PITR), kompromitace účtu (obnova z offsite do nového projektu s novými klíči), ransomware (Object Lock kopie).
5. Zápis `docs/security/restore-test-<datum>.md` = důkaz pro release gate.

## 4. Reakce na incident (T)
Runbook: `assets/incident-runbook.md` – zkopíruj do `docs/security/` a vyplň kontakty (#216, #217).
Klíčové schopnosti, které musí existovat **před** incidentem:
- zablokovat účet/relace uživatele (deaktivace membership + `auth.admin.signOut`) (#218),
- zneplatnit klíče (runbook rotace v `vizeon-sec-secrets-data`) (#218),
- vypnout funkci/agenta feature flagem, zapnout Attack Challenge Mode, rollback (#219, #220),
- maintenance režim (read-only) přes flag,
- export logů a audit tabulky pro důkazy (#221).

Cvičení (#225): 1× ročně table-top (např. „uniklý secret key“, „zaměstnanec exportoval všechny kontakty“, „prompt injection agent poslal data ven“).

## Kontroly: #186–#195, #206–#225, #283, #284, N-21, N-22, N-23
Soubory: `references/audit-log.sql`, `assets/backup.yml`, `assets/incident-runbook.md`
