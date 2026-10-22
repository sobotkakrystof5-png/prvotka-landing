---
name: vizeon-sec-nextjs-api
description: Bezpečný backend a frontend v Next.js (App Router) a React – Server Actions, Route Handlers, Data Access Layer, server-only, úniky do klientského bundlu a NEXT_PUBLIC proměnných, cache mezi uživateli, CSP s nonce a bezpečnostní hlavičky, CSRF, XSS a dangerouslySetInnerHTML, validace vstupů Zod, SQL/command injection, SSRF, open redirect, webhooky (podpis, replay, idempotence), platby Stripe, integrace, business-logic útoky a souběh, chybové odpovědi. Použij při psaní jakéhokoli serverového kódu, API, formuláře, webhooku, platby nebo integrace. Pokrývá sekce E, F, G a L.
---

# Next.js, API, validace a integrace (sekce E, F, G, L)

Mentální model: **každá Server Action a každý Route Handler je veřejný HTTP endpoint**, který může kdokoli zavolat s libovolnými daty – i když tlačítko v UI nevidí (#65, #66). Server Actions mají ID v klientském bundlu a lze je volat přímo.

## P0 pravidla

1. Každá Server Action / Route Handler začíná: **validace (Zod `.strict()`) → `requireUser()` → `authorize(orgId, perm)` → dotaz se scope na `org_id`** (vzor v `vizeon-sec-authz-tenancy`).
2. **Middleware/proxy (`middleware.ts`, v Next 16 `proxy.ts`) není autorizační vrstva** (N-03, CVE-2025-29927). Slouží k refresh session a přesměrování; ochrana dat je v DAL + RLS.
3. **Server-only kód** (`src/server/**`) začíná `import 'server-only'`. Secret key, DB helpery a integrace se nikdy nesmí dostat do `"use client"` stromu (#67).
4. **`NEXT_PUBLIC_*` = veřejné.** Smí obsahovat jen URL Supabase, publishable key, Sentry DSN apod. Nikdy `SECRET`, `SERVICE_ROLE`, `KEY` jiných služeb (#68).
5. **Klientovi se nevěří** `userId`, `orgId`, `role`, `price`, `amount`, `status`, `isPaid` (#57, #132).
6. **Webhooky ověřují podpis nad raw body** a jsou idempotentní (#59, #60, #133).
7. **Žádné `dangerouslySetInnerHTML` s nedůvěryhodným obsahem** bez sanitizace (DOMPurify) a CSP (#73, #79).
8. **Udržuj Next.js a React na opravených verzích** – kritické CVE (např. CVE-2025-29927 middleware bypass, CVE-2025-55182 RCE v React Server Components) se patchují do 24–48 h (N-04, `vizeon-sec-supply-chain-cicd`).

## Server Actions a Route Handlers

- Neexportuj z `"use server"` souborů pomocné funkce, které nemají být endpointem – **každý export je volatelná akce**.
- Neposílej do Server Action closures s tajnými hodnotami; argumenty i bound hodnoty jsou serializované přes klienta (N-33).
- Pro citlivé objekty použij React Taint API (`experimental_taintObjectReference`, `experimental_taintUniqueValue`) – zabrání omylem předat token/řádek do klientské komponenty, kde je to podporováno.
- Route Handler: povol jen potřebné metody (export jen `GET`/`POST`), kontroluj `Content-Type` a velikost těla (#55); vracej `401/403/404` bez dat (#56).
- Server Actions mají vestavěnou kontrolu `Origin` vs `Host`; za proxy nastav `serverActions.allowedOrigins` jen na vlastní domény. Route Handlery s cookie autentizací, které mění stav, potřebují **vlastní CSRF ochranu**: kontrola `Origin`/`Sec-Fetch-Site`, `SameSite=Lax` cookies a žádné state-changing `GET` (#74).

## Úniky dat do klienta a cache (#69, #70, N-32)
- Server Components předávají do client komponent jen DTO s potřebnými poli – nikdy celý řádek z DB (`select('*')` → explicitní sloupce).
- Stránky a Route Handlery s uživatelskými daty: dynamické renderování (čtou `cookies()`), žádné `export const revalidate`/`force-static`, žádné `unstable_cache`/`'use cache'` bez `userId`+`orgId` v klíči. Hlavička `Cache-Control: private, no-store` u API s citlivými daty.
- Nikdy necachuj odpovědi se `Set-Cookie` na CDN.
- Chybové stránky a `error.tsx` nesmí zobrazovat `error.message` ze serveru v produkci (#85).

## Validace vstupů (sekce G)
- Zod schéma pro každý vstup (form, JSON, query, params, headers, webhook payload), `.strict()` proti mass assignment (#76, #83).
- Limity: délka stringů (`.max()`), rozsahy čísel, `z.uuid()`, enumy, max počet prvků pole, max velikost těla (#84, #201).
- Částky jako celé číslo v haléřích (`bigint`), nikdy float; `nonnegative()`, horní limit.
- SQL: jen supabase-js/PostgREST nebo parametrizované dotazy. Pokud `rpc` s dynamickým SQL uvnitř (`execute format(...)`), používej `%I`/`%L` a nikdy neskládej uživatelský vstup (#77, #78).
- PostgREST filtry: nikdy nepředávej uživatelský string do `.or()` / `.filter()` bez escapování – lze jím injektovat další filtry. Používej typované metody (`.eq`, `.ilike` s escapovanými `%`/`_`).
- OS příkazy: nepoužívej `exec` se stringem; jen `execFile`/`spawn` s polem argumentů a allowlistem (#80).
- Žádné `eval`, `new Function`, `vm` s uživatelským obsahem, žádné uživatelské šablony vykonávané na serveru, žádná nebezpečná deserializace (#81).
- Prototype pollution: neslučuj nedůvěryhodné objekty `Object.assign`/deep merge; Zod `.strict()` zahodí `__proto__`. ReDoS: žádné uživatelem řízené regexy, pozor na vnořené kvantifikátory (N-34).
- SSRF (#82): pokud server stahuje uživatelem zadanou URL (logo, webhook URL, import), použij `references/code-patterns.md` → `safeFetch` (allowlist schémat, DNS resolve + blokace privátních/link-local/metadata IP, žádné redirecty, timeout, limit velikosti).
- Open redirect (#64): `redirect(next)` jen pro relativní cesty začínající `/` a ne `//`.
- XSS (#79): React escapuje; rizika jsou `dangerouslySetInnerHTML`, `href={userUrl}` (blokuj `javascript:`), markdown renderery, SVG uploady, `window.location = userInput`. Uživatelské URL validuj na `https?:`.
- E-mail: uživatelský vstup nikdy do hlaviček (`to`, `subject` bez CR/LF) – header injection (N-28).

## Bezpečnostní hlavičky a CSP (#71, #72, N-15, N-37)
Vzor CSP s nonce v `references/code-patterns.md`. Minimum:
- `Content-Security-Policy` s `script-src 'self' 'nonce-…' 'strict-dynamic'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, `connect-src` jen Supabase a nutné API.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimální, `Cross-Origin-Opener-Policy: same-origin`.
- Žádné skripty třetích stran (chat widgety, heatmapy, tag managery) na přihlášených stránkách aplikace. Pokud nutné: jen na marketingovém webu, nebo s SRI a v CSP allowlistu po review.
- Pro marketingový web viz skill `web-security-setup`.

## Webhooky a integrace (#59, #60, #130–#137)
- Raw body (`await req.text()`), ověření podpisu knihovnou poskytovatele (Stripe `constructEvent`), kontrola timestampu (tolerance ≤ 5 min).
- Idempotence: tabulka `webhook_events(provider, event_id unique)`, zpracování v transakci; duplicitní událost = 200 bez akce.
- **Stav platby nikdy z redirectu/prohlížeče** – jen z ověřeného webhooku nebo serverového dotazu na Stripe API (#132).
- Webhook nikdy nepoužívá `org_id` z payloadu bez ověření proti vlastní DB (metadata nastavená serverem při vytvoření checkout session).
- Každá integrace má vlastní klíč s minimem scopes (Stripe restricted key, Resend sending-only key) (#130, #131) – správa v `vizeon-sec-secrets-data`.
- Odchozí volání: timeout (5–10 s), omezený retry s backoffem, circuit breaker; selhání integrace nesmí vést k „zaplaceno“, „odesláno“ ani částečnému zápisu (#63, #137).
- Odpojení integrace = revokace tokenu u poskytovatele + smazání uloženého tokenu (#135).
- Evidence předávaných dat (#136) → `data-inventory.md`.

## Business logika a souběh (#62, N-14)
- Operace „zkontroluj a změň“ (čerpání kreditu, vystavení faktury s číslem, změna stavu) atomicky: v jedné SQL transakci / RPC s `select ... for update` nebo unikátním omezením, ne dvěma voláními z Node.
- Číselné řady faktur: sekvence/tabulka čítačů per `org_id` s `for update`; unikátní index `(org_id, number)`.
- Validuj přechody stavů (`draft → issued → paid|void`), záporné částky, měnu, limity slev, data splatnosti.
- Idempotency-Key pro POST, které vytváří platby/faktury/e-maily.

## Výpis chyb (#85)
Do klienta jen obecná zpráva + `requestId`. Detail (stack, SQL chyba, Supabase error) do serverového logu bez citlivých dat. Nikdy nevracej `error` objekt z Supabase přímo.

## Inventura endpointů (#53, #54)
Udržuj `docs/security/endpoints.md` (generuj: `grep -rn "'use server'" src` + `find app -name 'route.ts'`): cesta, metoda, auth, oprávnění, rate limit, veřejné ano/ne. Debug/test endpointy (`/api/test`, `/api/debug`, seed routy) v produkci nesmí existovat – kontroluj v CI.

## Negativní testy
- Volání každé Server Action bez session → odmítnuto.
- Volání s `orgId` cizí firmy → 404, 0 změn.
- Payload s extra poli (`role`, `org_id`, `status`) → zamítnut nebo ignorován.
- Webhook se špatným podpisem / starým timestampem / duplicitní → bez efektu.
- `next=//evil.com` → ignorováno. SSRF na `http://169.254.169.254`, `http://localhost`, `http://[::1]` → zablokováno.
- Souběžné 2× „zaplať/vyčerpej“ → jen jedna úspěšná.

## Kontroly: #53–#87, #130–#137, N-03, N-04, N-14, N-15, N-32, N-33, N-34, N-37
Kód: `references/code-patterns.md`
