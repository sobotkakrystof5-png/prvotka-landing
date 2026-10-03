# Log auditů a incidentů

> Jen historie. Audity, code review, incidenty, rotace klíčů.

Formát:

```
## RRRR-MM-DD – audit | review | incident
Spouštěč: nasazení / měsíční / hlášení / alert
Rozsah: co se kontrolovalo
Výsledek: X prošlo / Y varování / Z chyb, nebo popis
Nálezy: ty skutečné
Opraveno: co se změnilo
Zůstává otevřené: co a proč
```

---

## 2026-10-02 – review (lokálně, před prvním nasazením)
Spouštěč: Fáze 1–8, založení kódu.
Rozsah: hlavičky přes `curl` na `next start`, CSP v Chromiu a WebKitu (Playwright, `securitypolicyviolation`), Server Action formuláře (unit testy), `npm audit --omit=dev`.
Výsledek: hlavičky kompletní, 0 porušení CSP, 0 chyb v konzoli, 0 nálezů v auditu závislostí.
Nálezy: (1) Zod 4 zkoušel `new Function` a CSP to hlásila jako porušení `script-src eval`. (2) `upgrade-insecure-requests` rozbil lokální test v Safari.
Opraveno: (1) `z.config({ jitless: true })`. (2) direktiva jen u HTTPS (DECISIONS.md #004).
Zůstává otevřené: rate limit formuláře, DNS, `security.txt` s platným kontaktem, `security-check.sh` proti produkci (web ještě neběží). Viz STATE.md.

## Incidenty

Zatím žádné.
