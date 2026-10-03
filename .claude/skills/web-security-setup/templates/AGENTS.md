# AGENTS.md

Rules for any AI agent working in this repository — Claude Code, Cursor, Codex, Copilot.
`CLAUDE.md` points here rather than repeating these rules, so there is one source of
truth and the two files cannot drift apart.

Replace `{{...}}` placeholders when setting up a project.

---

## Project

- **Site:** {{SITE_URL}}
- **Client:** {{CLIENT}}
- **Stack:** {{STACK}}
- **Hosting:** {{HOSTING}}
- **Security config lives in:** `{{CONFIG_FILE}}`

## Security memory — read this first

This project keeps its security state in `.claude/security/`:

| File | Contains | Read it |
|---|---|---|
| `STATE.md` | current posture, threat model, open items | at the start of every session |
| `DECISIONS.md` | accepted trade-offs and why | before changing anything security-related |
| `CSP-LOG.md` | every CSP change and what required it | before touching the policy |
| `AUDIT-LOG.md` | audits, reviews, incidents | when investigating or reporting |

Reading `STATE.md` is normally enough to start. Reach for the others when the task
touches what they cover.

**When you change something security-relevant, update the matching file in the same
commit.** Batched later it never happens, and a memory file that lags behind reality is
worse than none because it gets trusted.

| Change | Update |
|---|---|
| header added/removed/changed | `STATE.md` |
| CSP directive changed | `CSP-LOG.md` + the CSP line in `STATE.md` |
| trade-off accepted | `DECISIONS.md` with a review date |
| audit or code review run | `AUDIT-LOG.md` |
| incident, leaked key, rotation | `AUDIT-LOG.md` |

## Non-negotiable rules

These are not style preferences. Breaking one of them creates a real vulnerability on a
site a real client depends on.

**Never weaken the CSP to make something work.** Specifically: never add `unsafe-inline`
or `unsafe-eval` to `script-src`, never add a wildcard, never delete a directive to
silence a console error. If a feature cannot work within the policy, the options are to
replace the feature, move to a nonce-based policy, or raise it with the user. Silently
loosening the policy is how it ends up passing every scanner while blocking nothing.

**Never put a secret in client-reachable code.** In this stack that means: nothing
sensitive behind `NEXT_PUBLIC_`, no `service_role` key, no SMTP credentials, no Stripe
secret key outside a server route. Publishable-by-design keys (Supabase `anon`, Stripe
publishable, Turnstile site key) are fine. If a secret has already been committed, say
so plainly — it must be rotated, not just deleted.

**Never accept input without server-side validation.** Every route validates with a
schema and caps the length of every field. Client-side validation is UX only.

**Never render untrusted input as HTML.** No `innerHTML`, no `dangerouslySetInnerHTML`
on anything derived from user input, a URL parameter or an API response, unless it has
been through DOMPurify first.

**Never disable Supabase RLS**, and never write a `using (true)` policy on a table the
`anon` key can reach. The anon key is public; RLS is the only boundary.

**Never add a third-party script without asking.** It runs with full privileges on the
page and can read the contact form as the visitor types. If it stays, it needs an SRI
hash and a CSP entry, and both go in `CSP-LOG.md`.

**Never ship an unprotected form.** Rate limit, captcha, honeypot, server-side send.

## Working defaults

- `target="_blank"` always with `rel="noopener noreferrer"`.
- No inline `<script>` and no `onclick=` attributes — the CSP forbids them, so writing
  them just creates work later.
- Cookies: `Secure; HttpOnly; SameSite=Lax` unless there is a stated reason otherwise.
- Errors shown to visitors are generic; details go to the log.
- Source maps and `console.log` of internal data stay out of production.
- Lockfile committed; `npm audit --omit=dev --audit-level=high` clean before deploy.

## Skills to use

| Situation | Skill |
|---|---|
| new project, or no headers yet | `web-security-setup` |
| writing/changing forms, API routes, DB queries, uploads, env vars; before commit or deploy | `web-security-review` |
| after a deploy, or periodic check of the live site | `web-security-audit` |
| session start, or recording a security change | `web-security-memory` |

## Deploy checklist

Before every production deploy:

- [ ] `npm audit --omit=dev --audit-level=high` clean
- [ ] no new secret in the diff (`git diff` + gitleaks in CI)
- [ ] new inputs validated server-side
- [ ] CSP still covers everything added — console clean on the affected pages
- [ ] `.claude/security/` updated for anything security-relevant in this change
- [ ] after deploy: `security-check.sh {{SITE_URL}}` and log the result

## When unsure

Ask. On a client site, an unnecessary question costs a minute; a quietly weakened policy
or a leaked key costs the client's reputation and is discovered by someone else.
