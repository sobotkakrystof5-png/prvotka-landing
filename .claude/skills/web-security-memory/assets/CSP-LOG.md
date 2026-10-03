# CSP changelog

> Every change to the Content-Security-Policy, with the feature that required it.
> The point of this file: being able to remove a stale entry with confidence.

Format:

```
## vN — YYYY-MM-DD
Change: <directive + value added/removed>
Required by: <the concrete feature>
Verified: <pages walked, browsers, console clean yes/no>
```

---

## v1 — YYYY-MM-DD
Change: Initial policy, report-only.
```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none';
form-action 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; connect-src 'self'; upgrade-insecure-requests
```
Required by: baseline.
Verified: all pages, Chrome + Safari, console clean.

## v2 — YYYY-MM-DD
Change: added `style-src 'unsafe-inline'`, `font-src https://fonts.gstatic.com`,
`style-src https://fonts.googleapis.com`.
Required by: Google Fonts on every page; Next.js inline critical CSS.
See: DECISIONS.md #002.
Verified: homepage + contact, Chrome + Safari, console clean.

## v3 — YYYY-MM-DD
Change: added `frame-src https://challenges.cloudflare.com`,
`script-src https://challenges.cloudflare.com`.
Required by: Turnstile captcha on the contact form (added after spam wave).
Verified: contact page, form submits, console clean.

## Removed

## YYYY-MM-DD — removed `connect-src https://old-analytics.example`
Reason: analytics provider replaced in March. Tested on staging, nothing broke.
