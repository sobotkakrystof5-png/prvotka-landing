# CSP cookbook

## Base policy

Start here and add only what the project actually uses.

```
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
form-action 'self';
script-src 'self';
style-src 'self';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
upgrade-insecure-requests
```

What each of the less obvious ones buys you:

- `base-uri 'self'` — blocks an injected `<base>` tag that would redirect every relative
  script path to an attacker's host. Cheap, and almost always missing.
- `object-src 'none'` — kills the `<object>`/`<embed>` legacy attack surface.
- `form-action 'self'` — stops an injected form from posting the user's data elsewhere.
- `frame-ancestors 'none'` — the modern anti-clickjacking directive. Keep
  `X-Frame-Options: DENY` alongside it for older browsers.
- `upgrade-insecure-requests` — silently upgrades stray http URLs, which saves you from
  mixed-content breakage after migrating a site.

## Integration additions

Add only the lines needed. Never a wildcard.

**Google Fonts**
```
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
```
Better still: self-host the fonts. Faster, no third party, no CSP entry, and no
GDPR question about visitor IPs going to Google.

**Google Analytics 4 / GTM**
```
script-src 'self' https://www.googletagmanager.com;
connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com;
```
GTM with custom HTML tags effectively demands `unsafe-inline` in `script-src`. If the
client insists on GTM, use a nonce-based policy or accept that the CSP no longer stops
script injection, and write that down in `DECISIONS.md`.

**Google Maps embed**
```
frame-src https://www.google.com;
```
A plain `<iframe>` embed needs nothing else. The JS Maps API needs
`script-src https://maps.googleapis.com` and `img-src` for tile hosts.

**Stripe**
```
script-src 'self' https://js.stripe.com;
frame-src https://js.stripe.com https://hooks.stripe.com;
connect-src 'self' https://api.stripe.com;
```

**Supabase**
```
connect-src 'self' https://<project-ref>.supabase.co wss://<project-ref>.supabase.co;
img-src 'self' data: https://<project-ref>.supabase.co;
```
The websocket entry is only needed for realtime subscriptions.

**Cloudflare Turnstile**
```
script-src 'self' https://challenges.cloudflare.com;
frame-src https://challenges.cloudflare.com;
```

**YouTube embed**
```
frame-src https://www.youtube-nocookie.com;
img-src 'self' https://i.ytimg.com;
```
Use `youtube-nocookie.com`, not the regular domain.

**Vercel Analytics / Speed Insights**
```
script-src 'self' https://va.vercel-scripts.com;
connect-src 'self' https://vitals.vercel-insights.com;
```

## Framework realities

**Tailwind** compiled into a CSS file needs nothing. The Tailwind CDN script needs
`unsafe-eval` — keep it out of production.

**Next.js** injects critical CSS inline, so `style-src 'unsafe-inline'` is effectively
required. Acceptable: styles cannot exfiltrate data the way scripts can. Scripts stay
locked down.

**Framer Motion, Emotion, styled-components** all inject styles at runtime. Same
conclusion as above.

**Astro and Vite** in dev mode need `unsafe-inline`/`unsafe-eval` and websocket
`connect-src`. Branch on the environment.

## The nonce pattern

The only clean way to allow genuinely necessary inline scripts:

```
script-src 'self' 'nonce-{RANDOM}' 'strict-dynamic' https:;
```

A fresh random value per request, echoed on every legitimate `<script nonce="...">`.
`strict-dynamic` means a script loaded by an allowed script is also allowed, which is
what makes bundlers work without listing every chunk. Browsers that understand
`strict-dynamic` ignore `'self'` and the host list — that is intended, not a bug.

Never reuse a nonce across requests. A static nonce is the same as `unsafe-inline` with
extra steps.

## Debugging a broken policy

The console violation names the directive and the blocked URI. Fix by adding that exact
host to that exact directive.

Three things never to do while debugging:

1. Add `*` to make it stop.
2. Add `unsafe-inline` to `script-src` to make it stop.
3. Delete the directive to make it stop.

All three end with a policy that passes securityheaders.com and blocks nothing. If the
only way to make a feature work is one of those three, the honest options are to replace
the feature, move to a nonce policy, or accept the risk explicitly in `DECISIONS.md`.

## Report-only rollout

```
Content-Security-Policy-Report-Only: <policy>
```

Runs the full policy, blocks nothing, reports everything. Always the first step on a live
site. Add `report-uri`/`report-to` only if there is somewhere to send reports; otherwise
the browser console is enough for a site of this size.
