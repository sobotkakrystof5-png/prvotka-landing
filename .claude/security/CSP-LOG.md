# Changelog CSP

> Každá změna Content-Security-Policy a funkce, která ji vyžádala.
> Smysl: zastaralý záznam jde pak s jistotou odstranit.

Formát:

```
## vN – RRRR-MM-DD
Změna: direktiva a přidaná/odebraná hodnota
Vyžaduje: konkrétní funkce
Ověřeno: stránky, prohlížeče, konzole čistá ano/ne
```

Politika žije v `src/proxy.ts`. Vývoj (`NODE_ENV=development`) navíc přidává `'unsafe-eval'` do `script-src` a `ws: wss:` do `connect-src` kvůli React debug a HMR. Do produkce se to nedostane.

---

## v1 – 2026-10-02
Změna: Výchozí politika, rovnou vynucující (nový projekt).
```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none';
form-action 'self'; script-src 'self' 'nonce-{per-request}' 'strict-dynamic';
style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self';
connect-src 'self'; media-src 'self'; frame-src 'none'; worker-src 'self';
manifest-src 'self'; upgrade-insecure-requests
```
Vyžaduje: základ. `style-src 'unsafe-inline'` kvůli Motion a `next/image` (DECISIONS.md #003). `img-src data: blob:` pro SVG data URI a budoucí náhledy. `media-src 'self'` pro budoucí self-hosted video.
Ověřeno: `/`, právní stránky, 404, Chromium (Playwright). Nalezeno porušení `script-src eval` od Zodu, řeší se v aplikaci (`z.config({ jitless: true })`), politika se kvůli tomu neoslabila.

## v2 – 2026-10-02
Změna: `upgrade-insecure-requests` jen u HTTPS požadavků.
Vyžaduje: lokální test v Safari (WebKit přepisoval `http://localhost` na https). DECISIONS.md #004.
Ověřeno: Chromium i WebKit, šířky 360/768/1024/1440 px, `prefers-reduced-motion`, 0 porušení, 0 chyb v konzoli. `curl` s `x-forwarded-proto: https` direktivu vrací.

## Odebrané

Zatím nic.
