# Platform configurations

Pick the block matching the detected hosting. Ready-to-copy files live in `../assets/`.
Every one of them carries the same header set — only the syntax differs.

| Platform | File to write | Asset |
|---|---|---|
| Vercel (static or Next.js) | `vercel.json` in repo root | `assets/vercel.json` |
| Next.js, no nonce needed | `next.config.js` | `assets/next.config.js` |
| Next.js with nonce CSP | `middleware.ts` in repo root | `assets/middleware.ts` |
| Netlify / Cloudflare Pages | `_headers` in the publish dir | `assets/_headers` |
| Apache / shared hosting | `.htaccess` in web root | `assets/htaccess.conf` |
| Nginx / VPS | server block or a snippet | `assets/nginx-security.conf` |
| Any | `/.well-known/security.txt` | `assets/security.txt` |

## Vercel

`vercel.json` headers apply to static output and Next.js alike. When the project is
Next.js **and** uses `middleware.ts` for a nonce CSP, set the CSP in the middleware only
and drop it from `vercel.json`, otherwise both fire and the stricter one wins in
confusing ways.

Cache rules are included in the asset: hashed assets get a year, HTML gets
`must-revalidate`. Skipping that is how a client ends up looking at last month's site.

## Next.js

Two variants, and the choice matters.

**`next.config.js` headers** — simple, static policy, good for marketing sites that do
not need inline scripts. Also set `poweredByHeader: false` and
`productionBrowserSourceMaps: false`.

**`middleware.ts` with a nonce** — generates a random nonce per request and pairs it with
`strict-dynamic`. This is the strongest CSP available: an injected script has no nonce
and never executes. Costs a middleware invocation per request and requires reading the
nonce in components via `headers().get('x-nonce')`.

Dev mode needs `unsafe-eval` and websocket `connect-src` for hot reload. Both assets
branch on `NODE_ENV` already — never let that branch leak into production.

Note that `next.config.js` headers do not apply to responses served by middleware
rewrites in every version. After deploying, verify with the check script rather than
assuming.

## Netlify / Cloudflare Pages

`_headers` goes into the published directory (`public/`, `dist/`, `out/`), not the repo
root, unless the publish directory is the root. Two-space indentation under each path
pattern is mandatory; with wrong indentation the rule is silently ignored and everything
looks fine until the check script says otherwise.

## Apache

Requires `mod_headers`. On Czech shared hosting (Wedos, Forpsi, Active24) it is normally
enabled. The asset also handles the http→https redirect, the www canonicalisation, the
directory listing, and blocking `.env`, `.git`, `.sql` and backup files.

`Header always set` matters: without `always`, headers are not attached to 4xx and 5xx
responses, and an error page is exactly where an attacker likes to work.

Explicit MIME types are included for a reason. With `nosniff` on and a misconfigured
server, a CSS file served as `text/plain` simply stops applying.

## Nginx

The asset is a full server block including TLS. Key points beyond the headers: TLS 1.2
and 1.3 only, OCSP stapling, `server_tokens off`, rate-limit zones, and a
`client_max_body_size` so nobody uploads a gigabyte into a contact form.

`limit_req_zone` must be declared in the `http` block, not inside `server` — the asset
notes the exact lines. Always `nginx -t` before reload.

## Shared hosting without header control

Some cheap hosting offers no way to set headers. `<meta http-equiv="Content-Security-Policy">`
works for CSP only, and not for `frame-ancestors`, which is ignored in meta form. HSTS,
`X-Frame-Options` and the rest cannot be set at all. That is a hosting problem, not a
configuration problem: either put Cloudflare in front (its Transform Rules can add
headers) or move the site. Record the limitation in `STATE.md`.
