# Bezpečnostní rozhodnutí

> Jen se přidává. Každý vědomý kompromis s důvodem a datem revize.
> Přijaté riziko bez data revize je zapomenuté riziko.

Formát:

```
## NNN – krátký název
Datum: RRRR-MM-DD
Rozhodnutí: co se rozhodlo
Důvod: proč, konkrétně
Zvažované alternativy: co dalšího bylo na stole a proč prohrálo
Přijaté riziko: co je teď možné, co by jinak nebylo
Revize: RRRR-MM-DD nebo „když <podmínka>“
```

---

## 001 – Hosting Vercel Hobby
Datum: 2026-10-02
Rozhodnutí: Web poběží na Vercel Hobby, ne na Pro.
Důvod: Rozhodnutí zadavatele ve Fázi 0. Pro nechce.
Zvažované alternativy: Vercel Pro (placené), jiný hosting (mimo stack).
Přijaté riziko: Podmínky Hobby nepovolují komerční použití. Zadavatel to ví a riziko přijímá vědomě. Žádná funkce webu nesmí záviset na placeném tarifu (týká se hlavně rate limitu formuláře).
Revize: když Vercel projekt omezí nebo zadavatel změní názor.

## 002 – Nonce CSP v `proxy.ts` a dynamický render
Datum: 2026-10-02
Rozhodnutí: CSP s per-request nonce a `strict-dynamic` v `src/proxy.ts` (Next.js 16 nahrazuje `middleware.ts`). Root layout volá `connection()`, takže se každá stránka renderuje dynamicky.
Důvod: Nejsilnější varianta CSP. Injektovaný skript nemá nonce a neprovede se. Next.js nonce přečte z hlavičky a připojí ho ke svým skriptům sám.
Zvažované alternativy: statická CSP v `next.config.ts` bez inline skriptů (Next.js inline skripty potřebuje), `experimental.sri` s hashi (záloha, pokud by výkon nevyšel).
Přijaté riziko: Žádné bezpečnostní. Výkon: žádné statické HTML na CDN, TTFB o něco vyšší. Lighthouse ověřit na náhledovém nasazení.
Revize: Fáze 8/9, když mobilní Lighthouse Performance klesne pod 90.

## 003 – `style-src 'unsafe-inline'`
Datum: 2026-10-02
Rozhodnutí: Povolit inline styly. Nonce se do `style-src` záměrně nedává.
Důvod: Motion i `next/image` renderují `style=""` atributy už na serveru a nonce na atributy nefunguje. Kdyby `style-src` obsahovalo nonce, prohlížeč by `unsafe-inline` ignoroval a atributy zablokoval.
Zvažované alternativy: nonce na `<style>` prvky (neřeší atributy), odstranit Motion (je ve schváleném stacku).
Přijaté riziko: Exfiltrace dat přes CSS a UI redressing jsou teoreticky možné. Skripty zůstávají plně zamčené, injekci skriptu to neotevírá.
Revize: když Motion a Next.js přestanou renderovat inline styly na serveru.

## 004 – `upgrade-insecure-requests` jen pro HTTPS požadavky
Datum: 2026-10-02
Rozhodnutí: Direktiva se posílá jen tehdy, když požadavek přišel přes HTTPS (`nextUrl.protocol` nebo `x-forwarded-proto`).
Důvod: Safari (WebKit) přepisuje na https i `http://localhost`, takže lokální test `next start` přestal načítat skripty. Na Vercelu je každý požadavek HTTPS, v produkci se direktiva posílá vždy.
Zvažované alternativy: direktivu vynechat úplně (HSTS přesměrování řeší většinu případů).
Přijaté riziko: Žádné pro produkci.
Revize: po nasazení ověřit `security-check.sh`, že direktiva v produkci je.

## 005 – Rate limit formuláře zatím jen honeypot a minimální doba
Datum: 2026-10-02
Rozhodnutí: Formulář chrání honeypot a kontrola minimální doby vyplnění (3 s). Rate limit na IP v kódu zatím není.
Důvod: Limit v paměti na Vercelu nefunguje, každá serverless instance má vlastní paměť a dávalo by to falešný pocit bezpečí. Vercel Firewall na Hobby jde ověřit až s projektem na Vercelu. Upstash je nová závislost a účet, potřebuje souhlas zadavatele.
Zvažované alternativy: limit v paměti (nefunkční), Upstash Redis (souhlas), Cloudflare Turnstile (výjimky v CSP).
Přijaté riziko: Do nasazení rate limitu může bot posílat poptávky opakovaně, pokud obejde honeypot a 3s kontrolu. Dopad: spam ve schránce a spotřeba kvóty Resend.
Revize: Fáze 6 na náhledovém nasazení, před spuštěním živého formuláře.

## 006 – HSTS bez `preload`
Datum: 2026-10-02
Rozhodnutí: HSTS `max-age=63072000; includeSubDomains`, bez `preload`.
Důvod: Preload je téměř nevratný. Doplní se po měsíci bezchybného HTTPS provozu.
Přijaté riziko: První návštěva přes http není chráněná, než prohlížeč HSTS uvidí.
Revize: měsíc po spuštění.
