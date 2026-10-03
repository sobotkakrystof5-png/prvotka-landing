---
name: web-security-review
description: Reviews and hardens application code of a website against the classic vulnerability classes — secrets leaking into the frontend or git, missing server-side validation, XSS through innerHTML/dangerouslySetInnerHTML, SQL injection, missing Supabase Row Level Security, unrestricted file uploads, unprotected contact forms, insecure cookies, and risky third-party scripts. Use this skill whenever writing or changing code that touches user input, a contact form, file uploads, a database or Supabase query, authentication, environment variables, or an API route, and always before a commit, a pull request or a deploy of a client website. Also trigger when the user says "zkontroluj bezpečnost kódu", "je to bezpečné?", "projdi to před nasazením", asks for a code review of a form or API endpoint, or is about to add an external script or CDN library to a page. Do NOT use for configuring headers (use web-security-setup) or for checking a deployed URL (use web-security-audit).
---

# Web Security Review

A review pass over application code. Headers protect the browser; this protects
everything the headers cannot reach.

Work through the areas below in order. Read the matching reference file when the project
actually contains that area — do not load all of them at once.

- `references/frontend.md` — XSS, DOM sinks, third-party scripts, secrets in the bundle
- `references/backend-data.md` — validation, SQL, Supabase RLS, API routes, cookies
- `references/forms-uploads.md` — contact forms, rate limiting, uploads, mail

## How to run the review

### 1. Map the attack surface first

Do not start reading files at random. Identify where untrusted data enters and where
privileged operations happen:

- every `<form>` and every API route or serverless function
- everything reading `request`, `searchParams`, `params`, `formData`, `req.body`
- every database query and every Supabase client call
- every file upload
- every `<script src>` pointing at a domain the project does not control
- every use of `process.env`

Everything else is usually not worth reviewing. A focused pass over ten real entry
points is worth more than skimming the whole repo.

### 2. Check the five things that actually go wrong

In practice almost every finding on a small marketing or client site falls into one of
these. Check them first, every time.

**Secrets in the wrong place.** A `service_role` key, an SMTP password or a Stripe
secret key anywhere the browser can reach it. In Next.js, anything prefixed
`NEXT_PUBLIC_` ships to the client. Also grep the git history, not just the working
tree — a key removed in a later commit is still a leaked key and must be rotated, not
just deleted.

**Validation only on the client.** Client-side validation is UX. If the server accepts
whatever arrives, the form is open. Every endpoint validates on the server with a schema
(`zod`, `valibot`), including a maximum length on every field.

**User input rendered as HTML.** `innerHTML`, `dangerouslySetInnerHTML`, `v-html`,
template interpolation that skips escaping. If rich text genuinely has to be rendered,
it goes through `DOMPurify` first, on the server side where possible.

**Database without a boundary.** String-concatenated SQL, or a Supabase table reachable
by the `anon` key with Row Level Security switched off. The second one is the more
common and more damaging of the two — the anon key is public by design, so RLS is the
only thing standing between the internet and the table.

**A form anyone can hammer.** No rate limit, no captcha, mail sent directly from the
client. Within days it becomes a spam relay pointed at the client's inbox.

### 3. Report findings usefully

For each finding give: the file and line, what an attacker can actually do with it, and
a concrete fix — ideally the patch itself. Skip severity theatre; sort by what would
hurt the client most.

Distinguish clearly between:

- **Fix now** — exploitable, or a leaked secret.
- **Fix before launch** — real weakness, no immediate exposure.
- **Accepted** — a conscious trade-off. These go in `.claude/security/DECISIONS.md`
  with a reason, not into a chat message that disappears.

Do not pad the list. Five real findings get fixed; thirty findings including "consider
adding a comment here" get ignored wholesale, and that is worse than saying nothing.

### 4. Record the outcome

Append the review to `.claude/security/AUDIT-LOG.md`: date, scope reviewed, findings,
what was fixed. If a finding was consciously accepted, it goes to `DECISIONS.md` with an
expiry date — an accepted risk without a review date is a forgotten risk.

If the review changed the CSP (a new third-party script, a new API domain), log it in
`CSP-LOG.md` too and re-verify the site still works.

## Working rules while fixing

- Fix the cause, not the symptom. Escaping one output while three others stay unescaped
  is not a fix.
- Never widen the CSP to make a library work without recording why. That is exactly how
  a policy erodes into uselessness over a year.
- When a leaked secret is found, say plainly that it has to be rotated. Removing it from
  the repo does not un-leak it.
- If something looks deliberately hostile in the codebase rather than accidentally
  weak — an obfuscated script, an unexplained outbound request, a backdoor-shaped
  endpoint — stop and raise it with the user rather than quietly editing around it.
