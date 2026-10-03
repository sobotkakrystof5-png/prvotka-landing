---
name: web-security-memory
description: Creates and maintains the persistent security memory of a web project — the `.claude/security/` directory holding STATE.md (current posture and threat model), DECISIONS.md (why each trade-off was accepted, with expiry dates), CSP-LOG.md (every change to the Content-Security-Policy and which feature required it) and AUDIT-LOG.md (audit and incident history) — and keeps them wired into CLAUDE.md and AGENTS.md. Use this skill at the start of any session in a project that has a `.claude/security/` directory, before changing anything security-relevant, and after finishing such a change. Also trigger when the user asks "co jsme tam nastavili?", "proč tam je tahle výjimka?", asks about the security state or history of a project, wants a memory system or persistent context for security, or when a new session needs to pick up where the last one left off. Do NOT use as a substitute for actually configuring headers (web-security-setup) or reviewing code (web-security-review) — this skill records and recalls, the others act.
---

# Web Security Memory

Security decays across sessions, not in a single bad commit. Somebody widens the CSP to
make an embed work, six months later nobody knows whether the exception is still needed,
and it stays forever. This skill is the countermeasure: a small set of files that always
answer three questions — what is in place, why, and when was it last verified.

Keep it small. A memory system that takes ten minutes to update stops being updated, and
a stale memory file is worse than no file because it is trusted.

## The four files

All under `.claude/security/`. Templates in `assets/`.

**`STATE.md`** — the current posture. Platform, framework, which headers are live, the
CSP version and whether it is enforcing or report-only, DNS status, the threat model for
this specific site, and the open items. This is the file to read first in any session and
the only one describing the present. Overwrite freely; it holds no history.

**`DECISIONS.md`** — every conscious trade-off, in append-only order. Why `style-src`
allows `unsafe-inline`, why a third-party domain is permitted, why a finding was accepted
instead of fixed. Each entry carries a date, a reason, and a review date. An accepted
risk with no review date is a forgotten risk.

**`CSP-LOG.md`** — every change to the policy, with the feature that required it. The
highest-churn file and the one that pays off most: it is the difference between removing
a stale analytics domain confidently and leaving it in because nobody dares.

**`AUDIT-LOG.md`** — audits, reviews, incidents, key rotations. History only. Lets you
see whether the site is drifting up or down over a year.

## Session protocol

**At the start**, when the project has a `.claude/security/` directory: read `STATE.md`.
That is usually enough. Read `DECISIONS.md` too when the task touches something that
might already have been decided, and `CSP-LOG.md` before touching the policy. Do not read
all four every time — that is exactly the overhead that makes people delete the system.

**Before a security-relevant change**, check whether it contradicts an existing decision.
If it does, that is a conversation with the user, not a silent overwrite. "This was
decided in March for reason X, do you want to change it?" is one of the most valuable
things this system enables.

**After the change**, update the right file and only the right file:

| Change | Goes in |
|---|---|
| A header added, removed or altered | `STATE.md` |
| CSP directive changed | `CSP-LOG.md` **and** the CSP line in `STATE.md` |
| A trade-off accepted | `DECISIONS.md` |
| Audit or code review performed | `AUDIT-LOG.md` |
| Incident, leaked key, key rotation | `AUDIT-LOG.md` |
| Open item resolved or created | `STATE.md` |

Update as part of the change, in the same commit. Batched at the end of the week it
never happens.

## Writing entries

Write for a person opening the file in a year with no memory of the project. The reason
matters more than the change — the change is visible in git, the reason is not.

Weak: `Added unsafe-inline to style-src.`

Useful: `2026-03-14 — style-src 'unsafe-inline' added. Framer Motion injects styles at
runtime, animations on the homepage broke without it. Scripts remain locked down; this
only affects styles. Review when animations are removed or the library is replaced.`

Keep entries to a few lines. This is a log, not documentation.

## Creating the system in an existing project

When `.claude/security/` does not exist yet, do not invent history. Copy the templates,
then fill `STATE.md` from what is actually in the repository and on the live site — read
the config files, run the check script from `web-security-audit` against the deployed
URL, and write down what you find, including the gaps. Start `DECISIONS.md` and
`CSP-LOG.md` with a single entry: the state as inherited on this date, with anything
unexplained marked as unexplained. "Reason unknown, inherited" is an honest and useful
entry; a plausible reason you made up is not.

## Wiring into CLAUDE.md and AGENTS.md

The memory only works if agents are told to read it. `AGENTS.md` at the repo root carries
the full rules and is read by Claude Code, Cursor, Codex and Copilot alike; `CLAUDE.md`
carries a short block pointing at it plus anything Claude Code specific. Keeping the
rules in one file rather than duplicating them is what stops the two drifting apart.

Templates for both are in the `web-security-setup` skill's `templates/` directory
(`.claude/skills/web-security-setup/templates/`). When the project
already has a `CLAUDE.md` generated by the `web-project-brief` skill, append the security
block rather than replacing the file.

## Keeping it honest

Once a quarter, or whenever `DECISIONS.md` review dates come up, go through the
exceptions and ask which are still needed. Removing a stale CSP exception is the whole
point of having written it down. If a review date passes and the exception is still
justified, extend it explicitly with a new entry rather than ignoring the date — the
moment dates are ignored, the file becomes decoration.
