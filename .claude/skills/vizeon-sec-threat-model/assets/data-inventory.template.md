# Inventura dat – <projekt>

| Datový prvek | Klasifikace | Osobní údaj | Zvl. kategorie | Tabulka/bucket | Další kopie (logy, cache, exporty, zálohy, e-mail, AI, integrace) | Šifrování navíc | Retence | Právní základ | Mazání/anonymizace |
|---|---|---|---|---|---|---|---|---|---|
| Jméno a e-mail kontaktu | důvěrné | ano | ne | `contacts` | export CSV, Resend logy, zálohy 30 d | ne | po dobu smlouvy + 3 r | oprávněný zájem / smlouva | soft delete → hard delete job |
| IBAN dodavatele | přísně důvěrné | částečně | ne | `suppliers.iban_enc` | – | ano (Vault/aplikační) | 10 let (DPH) | zákonná povinnost | po uplynutí lhůty |
| Faktura PDF | důvěrné | ano | ne | bucket `invoices` | e-mail příloha, záloha Storage | ne | 10 let | zákonná povinnost | |
| Rodné číslo | přísně důvěrné | ano | ne | ? (vyhnout se!) | | ano | | | |
| Přepis hovoru AI agenta | důvěrné | ano | možná | `call_transcripts` | AI poskytovatel | | 90 dní | | |

## Kde data NESMÍ skončit
- aplikační logy, Sentry, analytika, URL parametry, AI prompt bez posouzení, preview/staging prostředí, lokální disk vývojáře.

## Předávání třetím stranám

| Příjemce | Data | Účel | DPA | Lokalita (EU/mimo) | Mechanismus předání |
|---|---|---|---|---|---|
