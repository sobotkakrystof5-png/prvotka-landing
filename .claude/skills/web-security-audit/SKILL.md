---
name: web-security-audit
description: Verifies the security of a deployed website and records the result — runs the bundled security-check.sh against a live URL to test HTTPS redirects, all security headers, CSP quality, TLS protocols and certificate expiry, exposed sensitive files, DNS records (CAA, DNSSEC, SPF, DMARC) and cookie flags, then interprets the findings and fixes them. Use this skill after every deploy of a client website, whenever the user asks "je ten web zabezpečený?", "zkontroluj hlavičky", asks about a securityheaders.com or SSL Labs rating, mentions an expiring certificate, or wants a periodic security check of a site already in production. Also trigger during the regular monthly and quarterly maintenance of any site set up with web-security-setup. Do NOT use to set headers up in the first place (use web-security-setup) or to review source code (use web-security-review).
---

# Web Security Audit

Verification of a live site, plus the record that the verification happened. An audit
nobody wrote down cannot show whether things are getting better or worse.

**Only audit sites the user owns or is authorised to test.** The bundled script sends
ordinary unauthenticated requests, which is fine for your own site and not fine as a
probe of somebody else's. If the target is not the user's, stop and say so.

## Step 1 — Read the previous state

If `.claude/security/` exists, read `STATE.md` and the last entry in `AUDIT-LOG.md`
first. It tells you what is supposed to be in place, which findings were already
consciously accepted (`DECISIONS.md`), and what was left open. Reporting a known
accepted trade-off as a fresh critical finding wastes everyone's time and trains the
user to ignore audit output.

## Step 2 — Run the script

```bash
bash scripts/security-check.sh example.com
```

It needs `curl` and `openssl`; `dig` is optional and enables the DNS section. Exit code
is 1 when errors were found, so it can also run in CI.

Sections covered: HTTPS redirect, all security headers, CSP quality (it specifically
flags `unsafe-inline` and `unsafe-eval` in `script-src`, which is the usual reason a CSP
provides no protection at all), technology-version leakage, fifteen commonly exposed
sensitive paths, directory listing, security.txt, TLS protocols and certificate expiry,
CAA/DNSSEC/SPF/DMARC, and cookie flags.

Note the false positive it deliberately downgrades to a warning: on SPA hosting, every
path returns the index page with status 200. The script reports those as "verify
manually" rather than as an exposed file. Confirm by looking at the actual response body
before treating it as a finding.

## Step 3 — Add what the script cannot see

The script checks configuration. These need a browser and a few minutes:

- Open DevTools → Console on every page type and confirm there are no CSP violations.
  A policy that fires violations on the live site is one bad day away from being
  loosened by whoever is on call.
- DevTools → Network: check nothing is sending a key or personal data to a domain that
  has no business receiving it.
- Submit the contact form fifty times with a loop. If all fifty arrive, there is no rate
  limit.
- Put `<img src=x onerror=alert(1)>` through every form field and see whether it comes
  back rendered anywhere, including in the notification e-mail.
- Confirm the site still works with a script blocker and on Safari, which enforces parts
  of CSP differently from Chrome.

For a rating rather than a pass/fail, point the user at securityheaders.com, SSL Labs,
Mozilla Observatory and the Google CSP Evaluator. Details and exact URLs are in
`references/tools.md`, along with the Docker one-liners for OWASP ZAP baseline and
gitleaks.

## Step 4 — Interpret rather than dump

Do not paste the raw script output at the user. Turn it into: what is broken, what it
means in practice for this specific site, and what to change. Three sentences per real
finding.

Sort by consequence, not by the script's own labels. A missing `Permissions-Policy` on a
brochure site is cosmetic. A CSP with `unsafe-inline` in `script-src`, an exposed `.env`,
or a missing DMARC record on a domain the client sends invoices from are not.

When the fix is a config change, make it directly, then re-run the script to confirm.
Verifying your own fix is part of the job.

## Step 5 — Record it

Append to `.claude/security/AUDIT-LOG.md`:

```markdown
## YYYY-MM-DD — audit (<who/what triggered it>)
- Target: https://example.com
- Result: X passed / Y warnings / Z errors
- Findings: <short list>
- Fixed: <what was changed, with the commit if there is one>
- Left open: <what remains and why>
```

Update `STATE.md` if the audit changed the posture — a newly enforcing CSP, HSTS raised
to its full value, DNS finally sorted out. `STATE.md` describes now; `AUDIT-LOG.md`
describes history. Keep the two roles separate or both become useless.

## Cadence worth keeping

Monthly is enough for a small client site: run the script, check dependency alerts,
confirm backups actually exist. Quarterly, review who still has access to the repo,
hosting and DNS, rotate API keys, and re-run SSL Labs. Certificate expiry deserves its
own monitor rather than being remembered — the script reports remaining days, but only
when someone runs it.
