# Bezpečnostní stav

> Aktuální stav. Přepisuje se, historie je v ostatních souborech.
> Čti na začátku každé session, která se týká tohoto projektu.

**Naposledy aktualizováno:** 2026-10-02, Claude Code (Fáze 1–8, lokálně, bez nasazení)

## Projekt

- Web: `prvotka.cz` (`site.domain` od 2026-10-05). Doména je připojená ve Vercelu, primární musí být `prvotka.cz` (zatím `www`, zadavatel přepne)
- Hosting: Vercel Hobby (rozhodnutí v DECISIONS.md #001)
- Framework: Next.js 16.3.8 (App Router), React 19, Turbopack
- Repo: lokální git ve složce projektu, GitHub repo zatím nezaložené (čeká na souhlas zadavatele)
- Hlavičky: CSP v `src/proxy.ts`, ostatní v `next.config.ts` (`headers()`)

## Model hrozeb

- [x] Kontaktní formulář → spam do schránky, zneužití odesílání e-mailů
- [ ] Nahrávání souborů → nemáme
- [ ] Přihlášení a účty → nemáme
- [ ] Platby → nemáme
- [x] Osobní údaje (jméno, e-mail, telefon, firma) → povinnosti podle GDPR
- [x] Statický obsah → poškození reputace (defacement)

Realistický útočník: automatické skenery a spamboti. Nejhorší případ: zahlcená schránka
poptávek nebo doména zneužitá k phishingu, pokud chybí SPF/DKIM/DMARC.

## Hlavičky (ověřeno lokálně přes `next start`, 2026-10-02)

| Hlavička | Stav | Poznámka |
|---|---|---|
| Strict-Transport-Security | ✅ max-age=63072000; includeSubDomains | bez preload, viz otevřené body |
| Content-Security-Policy | ✅ vynucující, nonce + strict-dynamic | v2, viz CSP-LOG.md |
| X-Content-Type-Options | ✅ nosniff | |
| X-Frame-Options | ✅ DENY | |
| Referrer-Policy | ✅ strict-origin-when-cross-origin | |
| Permissions-Policy | ✅ vše zakázané | web nic z toho nepoužívá |
| Cross-Origin-Opener-Policy | ✅ same-origin | |
| Cross-Origin-Resource-Policy | ✅ same-origin | |
| X-XSS-Protection | ✅ 0 | |
| X-Powered-By | ✅ odstraněno | `poweredByHeader: false` |
| Zdrojové mapy v produkci | ✅ vypnuté | `productionBrowserSourceMaps: false` |

## CSP

- Verze: v2 (CSP-LOG.md)
- Režim: vynucující od prvního dne (nový projekt)
- Třetí strany: žádné. Písma přes `next/font` (self-hosting), Resend jen ze serveru.
- Výjimky: `style-src 'unsafe-inline'` (DECISIONS.md #003), `upgrade-insecure-requests` jen u HTTPS požadavků (#004)
- Zod běží v režimu `jitless`, jinak jeho test `new Function` hlásí porušení `script-src`.
- Ověřeno: Chromium i WebKit (Playwright), šířky 360/768/1024/1440 px, i s `prefers-reduced-motion`. 0 porušení, 0 chyb v konzoli.

## DNS a e-mail (úkol pro zadavatele, nic nenastaveno)

| Položka | Stav |
|---|---|
| DNSSEC | ❌ doména zatím není |
| CAA | ❌ doména zatím není (doporučení: `0 issue "letsencrypt.org"` pro Vercel) |
| SPF | ⚠️ odesílací doména pro Resend `prvotka.cz`, v Resendu ověřená 2026-10-04. Záznam ověřit v DNS |
| DKIM | ❌ nastaví se při ověření domény v Resend |
| DMARC | ❌ začít `p=quarantine`, cíl `p=reject` |

## Aplikace

- Validace na serveru: Zod schéma `src/lib/contactSchema.ts`, stejné na klientu i serveru, limit délky u každého pole ✅
- Honeypot (`website`) + minimální doba vyplnění 3 s ✅ (unit testy v `src/app/actions/contact.test.ts`)
- Rate limit na IP: ❌ záměrně zatím ne, viz otevřené body a DECISIONS.md #005
- Captcha: ne (Turnstile jen při potřebě, přidává výjimky do CSP)
- Výstup z formuláře v e-mailu escapovaný (`src/lib/escapeHtml.ts`), předmět bez konců řádků ✅
- Tajemství: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` jen v proměnných prostředí serveru, žádné `NEXT_PUBLIC_` ✅
- Logy bez osobních údajů (jen typ chyby) ✅
- JSON-LD: data jen ze `site.ts`/`cs.ts`, `<` escapované, skript s nonce ✅
- Audit závislostí: `npm audit --omit=dev` 0 nálezů (2026-10-02)

## Otevřené body

| Bod | Proč | Kdo | Kdy |
|---|---|---|---|
| Rate limit formuláře | paměť serverless instance se nesdílí | ověřit Vercel Firewall na Hobby, případně Upstash se souhlasem | Fáze 6 na náhledovém nasazení |
| HSTS preload | až po měsíci bezchybného HTTPS | já | měsíc po spuštění |
| DNS (CAA, DNSSEC, SPF, DKIM, DMARC) | bez nich jde doménu zneužít k podvrženým e-mailům | zadavatel | před nasazením |
| GitHub repo + CI | workflow `.github/workflows/security.yml` je připravené, běží až po pushi | zadavatel (souhlas) | Fáze 1/9 |
| `security-check.sh` proti produkci | web ještě neběží | já | po nasazení, výsledek do AUDIT-LOG.md |
| `/styleguide` | interní stránka, v produkci nemá být | já | Fáze 9 |

## Neměnit bez dotazu

- Nonce CSP v `src/proxy.ts` a dynamický render všech stránek (`connection()` v layoutu). Bez toho Next.js skripty bez nonce CSP zablokuje.
- `z.config({ jitless: true })` v `src/lib/contactSchema.ts`.
- `frame-ancestors 'none'` + `X-Frame-Options: DENY`: web se nesmí vkládat do iframe.
