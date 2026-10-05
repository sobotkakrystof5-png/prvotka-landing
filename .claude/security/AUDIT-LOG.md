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

## 2026-10-05 – review (před nasazením)
Spouštěč: commit a nasazení (formulář bez zaškrtávátka souhlasu, právní texty, doména).
Rozsah: diff proti `c247360`: `contactSchema.ts`, `ContactForm.tsx`, `site.ts`, `security.txt`, `.env.example`. Hledání tajných údajů a HTML sinků v diffu, lint, typy, 41 testů, `next build`.
Výsledek: 0 nálezů.
Nálezy: žádné. Server Action dál validuje Zod schématem s limity délky. Pole `consent` zmizelo jen ze schématu, neznámé klíče Zod zahodí. V diffu nejsou tajné údaje, `NEXT_PUBLIC_` ani `dangerouslySetInnerHTML`.
Opraveno: `security.txt` má platný `Canonical` (`https://prvotka.cz`).
Zůstává otevřené: rate limit formuláře, primární doména ve Vercelu je zatím `www`.
Po nasazení (`3696f40`, `dpl_48Ffnrw2FTtcWyhrVjFP1LRQQPW7`, READY): Playwright Chromium + WebKit, 360 a 1440 px, `/`, obě právní stránky: 0 chyb v konzoli, 0 porušení CSP, bez vodorovného scrollu. `security-check.sh www.prvotka.cz` napoprvé 28 prošlo / 4 varování / 1 chyba. Chyba „certifikát“ a varování „TLS 1.3“ jsou falešná (ověřeno `openssl s_client`: TLS 1.3, Let's Encrypt do 2027-01-02). Druhý běh dostal 403 `x-vercel-mitigated: challenge`, automatická ochrana Vercelu proti série dotazů, vlastní firewall projekt nemá. DNS: CAA a DNSSEC ok, DMARC `p=none` na `_dmarc.prvotka.cz` existuje (skript ho hledal u `www`), SPF je jen na `send.prvotka.cz` (Resend), na apexu chybí.

## 2026-10-02 – review (lokálně, před prvním nasazením)
Spouštěč: Fáze 1–8, založení kódu.
Rozsah: hlavičky přes `curl` na `next start`, CSP v Chromiu a WebKitu (Playwright, `securitypolicyviolation`), Server Action formuláře (unit testy), `npm audit --omit=dev`.
Výsledek: hlavičky kompletní, 0 porušení CSP, 0 chyb v konzoli, 0 nálezů v auditu závislostí.
Nálezy: (1) Zod 4 zkoušel `new Function` a CSP to hlásila jako porušení `script-src eval`. (2) `upgrade-insecure-requests` rozbil lokální test v Safari.
Opraveno: (1) `z.config({ jitless: true })`. (2) direktiva jen u HTTPS (DECISIONS.md #004).
Zůstává otevřené: rate limit formuláře, DNS, `security.txt` s platným kontaktem, `security-check.sh` proti produkci (web ještě neběží). Viz STATE.md.

## 2026-10-03 – review (první běh CI na GitHubu)
Spouštěč: první push do veřejného repa `sobotkakrystof5-png/prvotka-landing`.
Rozsah: workflow `security` (lint, typecheck, testy, build, `npm audit --omit=dev`, gitleaks).
Výsledek: gitleaks bez nálezu, 2 joby selhaly.
Nálezy: (1) `npm audit --omit=dev` hlásil 7× high (`braces` přes `micromatch` a `fast-glob`), vše v závislostech CLI `shadcn`, které bylo omylem v `dependencies`. Do runtime se nedostává. (2) typecheck v CI neznal globální typ `LayoutProps`, protože se generuje do `.next/` až při buildu.
Opraveno: (1) `shadcn` přesunut do `devDependencies`, audit produkčních závislostí hlásí 0. (2) skript `typecheck` spouští nejdřív `next typegen`. Ověřeno na čistém klonu přes `npm ci`.
Zůstává otevřené: zranitelnost v dev nástroji `shadcn` zůstává, dokud ji upstream neopraví. Riziko je jen při lokálním spuštění CLI.

## Incidenty

Zatím žádné.
