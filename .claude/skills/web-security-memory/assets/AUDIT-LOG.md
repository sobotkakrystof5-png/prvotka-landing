# Audit and incident log

> History only. Audits, code reviews, incidents, key rotations.
> Lets you see whether the site is drifting up or down over a year.

Format:

```
## YYYY-MM-DD — <audit | review | incident>
Trigger: <deploy / monthly / user report / alert>
Scope: <what was checked>
Result: <X passed / Y warnings / Z errors, or a description>
Findings: <the real ones>
Fixed: <what changed, commit>
Left open: <what remains and why>
```

---

## YYYY-MM-DD — audit (post-deploy)
Trigger: initial hardening deploy.
Scope: `security-check.sh` against production + manual browser pass.
Result: 28 passed / 3 warnings / 0 errors.
Findings: DNSSEC not enabled (client's registrar); HSTS preload not set (intentional,
too early); Permissions-Policy missing on one legacy path.
Fixed: Permissions-Policy path pattern corrected in `vercel.json` (commit abc1234).
Left open: DNSSEC — see STATE.md open items.

## YYYY-MM-DD — code review (pre-launch)
Scope: contact form route, Supabase queries, env usage.
Findings: form had no rate limit; one table had RLS disabled.
Fixed: Upstash rate limit 5/min per IP; RLS enabled with insert-only policy.
Left open: none.

## Incidents

## YYYY-MM-DD — <none so far>
When something does happen, record: what was observed, when, what was actually
compromised, which keys were rotated, and what changed so it does not recur. Write it
even for small things — a pattern across three small incidents is worth more than three
forgotten ones.
