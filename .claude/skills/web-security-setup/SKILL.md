---
name: web-security-setup
description: Sets up the complete security baseline for a website project — security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP/CORP) for Vercel, Netlify, Cloudflare Pages, Next.js, Apache or Nginx, plus .gitignore hardening, security.txt, DNS records (CAA, DNSSEC, SPF/DMARC), a CI security workflow, the `.claude/security/` memory files, and the mandatory security blocks in CLAUDE.md and AGENTS.md. Use this skill whenever a new client website or landing page project is being started, whenever an existing project has no security headers yet, and whenever the user mentions "zabezpečení webu", security headers, CSP, hardening, HSTS, clickjacking, or wanting an A+ on securityheaders.com. Trigger it even if the user asks about only one single header — the baseline belongs together and half a baseline gives a false sense of safety. Do NOT use for auditing an already-hardened live site (use web-security-audit) or for reviewing application code (use web-security-review).
---

# Web Security Setup

Establishes the security baseline of a web project and, just as importantly, writes it
down so it survives across sessions. A header that nobody records is a header that gets
silently dropped during the next refactor.

Two things this skill must always produce together:

1. The actual configuration (headers, gitignore, security.txt, CI).
2. The memory system in `.claude/security/` plus the security block in `CLAUDE.md` and
   `AGENTS.md`, so the next session knows what is already in place and why.

Never do only the first. Configuration without a written rationale gets reverted by the
next person who hits a broken embed and "fixes" it with `unsafe-inline`.

## Step 1 — Determine the situation

Before writing anything, establish:

- **Hosting platform** — Vercel, Netlify, Cloudflare Pages, shared hosting with Apache,
  a VPS with Nginx. This decides which config file to write. Detect it from the repo
  (`vercel.json`, `netlify.toml`, `.htaccess`, `next.config.js`) rather than asking, and
  only ask if there is genuinely no signal.
- **Framework** — static HTML/CSS/JS, Next.js (App or Pages Router), Astro, Vite.
- **Third-party integrations** — Google Fonts, GA4/GTM, Google Maps embed, Stripe,
  Supabase, Turnstile, a booking widget. Every one of these needs an explicit CSP entry.
  Ask about this: it is the single most common reason a CSP breaks a site in production.
- **Data handled** — a contact form, file uploads, logins, payments, personal data.
  This shapes the threat model section of `STATE.md`.
- **Phase** — greenfield project or a site already in production. On a live site, never
  push an enforcing CSP straight away (see Step 4).

If the project already has `.claude/security/STATE.md`, this is not a fresh setup. Read
it first, then only fill the gaps and record what changed. Do not overwrite existing
decisions without asking.

## Step 2 — Write the platform configuration

Read `references/platforms.md` and use the block matching the detected platform. It
contains ready configurations for Vercel, Netlify/Cloudflare Pages, Next.js (with and
without a nonce middleware), Apache and Nginx.

The full header set is non-negotiable and always applied together:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `Content-Security-Policy` | built per project, see Step 3 |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | deny everything the site does not use |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `X-XSS-Protection` | `0` |

`X-Powered-By` and any header exposing a version number get removed. In Next.js that
means `poweredByHeader: false`.

Do not add `preload` to HSTS during setup. It is close to irreversible and belongs at
the end of the process, after a month of clean operation. Record it as an open item in
`STATE.md` instead.

## Step 3 — Build the CSP for this specific project

Read `references/csp-cookbook.md`. It lists the base policy and the exact additions each
common integration requires.

Build the policy from the integrations identified in Step 1, then apply these rules:

- `script-src` never gets `unsafe-inline` or `unsafe-eval`. If a library demands them,
  that is a reason to reconsider the library, not the policy. The one acceptable route
  to inline scripts is a per-request nonce with `strict-dynamic`.
- `style-src 'unsafe-inline'` is an acceptable trade-off when the framework injects
  styles at runtime (Next.js critical CSS, Framer Motion). Record it in `DECISIONS.md`
  with the reason, so it is a decision and not an accident.
- Always include `base-uri`, `object-src 'none'`, `frame-ancestors`, `form-action`.
  These are free and each closes a real attack.
- Wildcards belong nowhere. List concrete hostnames.

Every domain added to the policy gets a line in `CSP-LOG.md` saying which feature needs
it. Six months later nobody remembers why `connect-src` allows some analytics endpoint,
and an unexplained entry never gets removed.

## Step 4 — Roll out in the right order

On a live site the order matters more than the content.

1. Deploy everything except CSP. Those headers cannot break a working site.
2. Deploy CSP as `Content-Security-Policy-Report-Only`.
3. Walk the whole site: every page, the contact form, the gallery, the map, the cookie
   banner, the mobile menu. Collect the violations from the browser console.
4. Add the missing sources — concrete hostnames, never `*` and never `unsafe-inline` as
   a shortcut to make the console quiet.
5. Rename the header to `Content-Security-Policy` and walk the site again, including
   Safari, which behaves differently from Chrome.

On a greenfield project the enforcing policy can go in from day one, which is much
easier — the site is then built to fit the policy instead of the other way round.

## Step 5 — Repository and DNS hardening

- Extend `.gitignore`: `.env`, `.env.*`, `*.pem`, `*.key`, `.vercel`, `.DS_Store`.
- Add `/.well-known/security.txt` (template in `assets/`). The `Expires` field is
  mandatory — set a reminder, an expired security.txt is worse than none.
- Copy `security-check.sh` from the `web-security-audit` skill's `scripts/` directory
  into `.claude/security/security-check.sh` in the project repo, and make it executable.
  This is what lets the check run locally and in CI without depending on where the skill
  itself is installed.
- Add the CI workflow from `assets/github-workflow-security.yml`: dependency audit,
  secret scanning, and a live header check on every push (it calls
  `.claude/security/security-check.sh`, so the copy above has to happen first).
- DNS, to be handed to whoever controls the domain: DNSSEC on, a CAA record, and if the
  domain does not send mail, `v=spf1 -all` plus a DMARC record with `p=reject`. Without
  these, anyone can send mail as the client. Record the state in `STATE.md`, since this
  usually depends on someone else and drags on.

## Step 6 — Wire it into memory, CLAUDE.md and AGENTS.md

This is what makes the setup durable. Hand over to the `web-security-memory` skill, or
do it directly:

- Create `.claude/security/` with `STATE.md`, `DECISIONS.md`, `CSP-LOG.md` and
  `AUDIT-LOG.md` from the templates in the `web-security-memory` skill's assets.
- Fill `STATE.md` with the real state: platform, headers deployed, CSP version and
  mode, DNS status, open items, threat model.
- Insert the block from this skill's `templates/CLAUDE-security-block.md` into the project's
  `CLAUDE.md`. If a `CLAUDE.md` from the `web-project-brief` skill already exists, append
  the block rather than replacing the file.
- Create `AGENTS.md` from this skill's `templates/AGENTS.md` at the repo root, so agents other than
  Claude Code (Cursor, Codex, Copilot) follow the same rules. If `AGENTS.md` already
  exists (e.g. created by the `project-memory-system` skill), add the security rules as
  a new section instead of replacing the file. `AGENTS.md` holds the full
  rules; the `CLAUDE.md` block stays short and points at it, which keeps the two from
  drifting apart.

## Step 7 — Verify and report

Run the check script from the `web-security-audit` skill against the deployed URL, then
record the result in `AUDIT-LOG.md`.

Report to the user in a few sentences: which platform config was written, what the CSP
allows and why, what is still open (typically HSTS preload and DNS), and where the
memory files live. Do not produce a long report — the state belongs in `STATE.md`, not
in chat, precisely so it is still there next session.

## What this skill does not cover

- Application code (input validation, RLS, XSS in templates) — that is
  `web-security-review`.
- Verifying a live site and reacting to findings — that is `web-security-audit`.
- Anything requiring exploitation or testing of systems the user does not control.
  Configure and verify your own site; do not attack someone else's.
