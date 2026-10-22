# Předávací protokol – <projekt>

Datum: · Předává: VIZEON · Přebírá: <klient>

## 1. Účty a vlastnictví
| Služba | Vlastník účtu (organizace) | Admin(i) klienta | Přístup VIZEON (role, do kdy) | MFA ověřeno |
|---|---|---|---|---|
| Doména / registrátor | | | | |
| DNS | | | | |
| Vercel team | | | | |
| Supabase organizace (prod projekt) | | | | |
| GitHub repozitář/organizace | | | | |
| Stripe | | | | |
| Resend / e-mail | | | | |
| AI poskytovatel | | | | |
| Monitoring (Sentry, log drain) | | | | |
| Offsite zálohy | | | | |
| Správce hesel (trezor projektu) | | | | |

## 2. Secrets
Seznam v `docs/security/secrets-inventory.md` (bez hodnot). Po předání rotovány: ☐ ano (datum: )

## 3. Dokumentace
- [ ] `docs/security/` kompletní (SECURITY, threat model, data inventory, access matrix, runbooky)
- [ ] Poslední release gate a pentest report
- [ ] Postup obnovy ze záloh + poslední test obnovy
- [ ] Kontakty pro incidenty

## 4. Odpovědnosti (RACI)
| Činnost | Klient | VIZEON | Poznámka / SLA |
|---|---|---|---|
| Aktualizace závislostí a patche | | | |
| Kritické CVE (24–48 h) | | | |
| Monitoring a reakce na alerty | | | |
| Incident response | | | |
| Správa uživatelů aplikace | | | |
| Revize přístupů (kvartálně) | | | |
| Test obnovy (kvartálně) | | | |
| Pentest (ročně) | | | |
| GDPR žádosti subjektů | | | |

## 5. Podpisy
Předal: ____________ Převzal: ____________
