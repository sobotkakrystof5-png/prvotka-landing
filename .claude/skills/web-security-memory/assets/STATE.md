# Security state

> Current posture. Overwrite freely — history lives in the other files.
> Read this at the start of any session touching this project.

**Last updated:** YYYY-MM-DD by <session/person>

## Project

- Site: https://example.com
- Hosting: <Vercel / Netlify / Apache shared / VPS Nginx>
- Framework: <static / Next.js 15 App Router / Astro>
- Repo: <url>, private: yes/no
- Config file carrying the headers: `<vercel.json / middleware.ts / .htaccess>`

## Threat model

What this site actually handles, and therefore what matters:

- [ ] Contact form → inbox spam, mail spoofing
- [ ] File uploads → arbitrary file serving
- [ ] Login / accounts → session theft
- [ ] Payments → PCI surface, webhook verification
- [ ] Personal data → GDPR obligations
- [ ] Static content only → defacement and reputation

Realistic attacker: <automated scanners / competitor / targeted>. Worst case for the
client: <inbox flooded / domain used for phishing / site defaced before a campaign>.

## Headers live

| Header | Status | Note |
|---|---|---|
| Strict-Transport-Security | ✅ max-age=63072000; includeSubDomains | preload not yet, see open items |
| Content-Security-Policy | ⚠️ report-only | enforcing planned YYYY-MM-DD |
| X-Content-Type-Options | ✅ nosniff | |
| X-Frame-Options | ✅ DENY | |
| Referrer-Policy | ✅ strict-origin-when-cross-origin | |
| Permissions-Policy | ✅ | |
| Cross-Origin-Opener-Policy | ✅ same-origin | |
| Cross-Origin-Resource-Policy | ✅ same-origin | |
| X-Powered-By removed | ✅ | |

## CSP

Version: v3 (see CSP-LOG.md)
Mode: report-only / enforcing
Third parties allowed: <Google Fonts, Turnstile, ...>
Known exceptions: <style-src unsafe-inline — see DECISIONS.md #2>

## DNS and mail

| Item | Status |
|---|---|
| DNSSEC | ❌ not enabled — client's registrar |
| CAA | ✅ letsencrypt.org |
| SPF | ✅ v=spf1 include:... -all |
| DKIM | ✅ |
| DMARC | ⚠️ p=quarantine, target p=reject |

## Application

- Server-side validation: zod on all routes ✅
- Supabase RLS: enabled on all public tables ✅ / n/a
- Rate limiting: contact form, 5/min per IP ✅
- Captcha: Turnstile ✅
- Secrets: only in hosting env vars, gitleaks in CI ✅
- Backups: <where, how often, last restore test>

## Open items

| Item | Why it matters | Owner | Target |
|---|---|---|---|
| HSTS preload | after a month of clean https | me | YYYY-MM |
| DNSSEC | client controls the registrar | client | — |
| CSP to enforcing | currently report-only | me | YYYY-MM-DD |

## Do not change without asking

<Anything a future session must not "clean up" — e.g. a deliberate exception, a legacy
subdomain, a client requirement.>
