---
name: project-memory-system
description: Scaffolds a persistent, file-based memory system for a project so that every future Claude Code session (or any AI coding tool) picks up exactly where the last one left off, instead of re-deriving context or "fixing" things that were deliberately decided. Sets up a five-document architecture — CLAUDE.md (behavior/tone/process), AGENTS.md (technical facts for any AI tool), memory/index.md (navigation map), memory/pravidla.md (meta-rules for the memory itself), memory/memory.md (living state/decisions/changelog) — with clear division of responsibility so content never gets duplicated or drifts out of sync. Use this when starting a new client/vibecoding project that will span many sessions, when a project has grown past ad-hoc context and keeps losing continuity between sessions, or when the user asks to "set up project memory," "make Claude remember this project," "give me a CLAUDE.md + memory system," or references wanting the same memory setup as another project.
---

# Project Memory System

A project has no continuity other than what's written down. This skill sets up a small, disciplined set of files so that any session — Claude Code, Cursor, or any other AI tool — can read a fixed, short list of documents and know exactly what the project is, how to behave in it, and what has already been decided, tried, or deliberately left undone.

It generalizes a five-document architecture that has proven to work in real client projects: a strict separation between **behavior** (how to act), **technical facts** (what the project is), **navigation** (where to look), **memory rules** (how to keep records honest), and **living state** (what actually happened). Mixing these together is the single most common failure mode — it's what makes a memory system rot within a few sessions.

---

## When to use this

- Starting a new project — client website, app, "vibecoding" side project — that will span more than a couple of sessions.
- An existing project has no memory system and keeps losing context between sessions (Claude re-asks settled questions, "fixes" intentional decisions, forgets what was tried and failed).
- The user explicitly asks to set up project memory, wants a `CLAUDE.md`, wants "the same system as my other project," or wants continuity across multiple AI tools touching the same repo.
- Complements `web-project-brief` (if installed) rather than replacing it: that skill produces the initial content brief and a first-draft `CLAUDE.md` for a new client. This skill builds the **ongoing memory architecture** around it — `memory/index.md`, `memory/pravidla.md`, `memory/memory.md`, and the wiring between `CLAUDE.md` and `AGENTS.md`. Use `web-project-brief` first for a brand-new client if it's available and relevant, then this skill to add persistent memory — or use this skill alone if there's no separate brief step.

---

## The five files and what each one owns

| File | Owns | Changes when |
|---|---|---|
| `CLAUDE.md` (project root) | **Behavior**: tone, process discipline, what Claude may/may not decide silently, how to handle conflicts between the prompt and this file. Read by Claude Code specifically. | Rarely — only on an explicit user decision about how work should be done. Never holds running project status. |
| `AGENTS.md` (project root) | **Technical facts**: stack, repo structure, build/dev commands, conventions, the project's page/route list, a table of any local skills and when to use them. Read by *any* AI assistant (Cursor, Antigravity, Codex, Claude) — so it holds no tone or behavior rules, only facts. | When the stack, folder structure, build commands, or conventions change. |
| `memory/index.md` | **Navigation**: the entry point. One-line current project phase, a table of what's in each memory file and when to touch it, a diagram of how the documents relate, a directory map, a "quick start" for a new session. Holds no content itself. | When a new system file/folder appears, or the project phase changes. |
| `memory/pravidla.md` (or `RULES.md`) | **Meta-rules for the memory system itself**: what counts as a loggable change, what never gets logged, the exact changelog entry format, upkeep rules for the other sections of `memory.md`, and the start/end-of-session checklist. | Only on the user's explicit instruction — Claude does not edit its own memory rules unprompted. |
| `memory/memory.md` (or `STATE.md`) | **Living state**: current status (overwritten, not appended), key decisions that won't be revisited (append-only), open questions waiting on the user/client (deleted once answered), things deliberately *not* done yet and why (protects against a future session "fixing" an intentional gap), and a changelog (newest first). | After **every** change to the project, in the same turn the change happens — not at session end, not after a reminder. |

### Why the split matters

If tone/process rules live in the same file as technical facts, other AI tools that read `AGENTS.md`-style files inherit behavior rules they shouldn't (or a tone document becomes bloated with facts that go stale the moment the stack changes). If running state lives in `CLAUDE.md`, the one document meant to stay stable gets rewritten every session and stops being a reliable contract. Keep facts in `AGENTS.md`, rules of engagement in `CLAUDE.md`, and everything that changes often in `memory/`.

### Precedence when documents conflict

State this explicitly in `index.md` so it's never ambiguous: **user's live prompt → `CLAUDE.md` → `memory/pravidla.md` → `memory/memory.md` → `AGENTS.md`.** A conflict is never silently resolved — it gets flagged to the user before acting.

---

## Bootstrap procedure

1. **Confirm the project doesn't already have one of these files under a different name** (a `NOTES.md`, a wiki, an existing `AGENTS.md`) — extend or migrate rather than creating a second, competing system.
2. **Create `memory/index.md` first** — even before content exists elsewhere, this fixes the map every later file will slot into. Use the template below.
3. **Create `memory/pravidla.md`** — the rules for how memory gets written. Get this right before writing `memory.md`, since it defines that file's format.
4. **Create `memory/memory.md`** — start with the four standing sections (Current State / Key Decisions / Open Questions / Deliberately Not Done) plus an empty Changelog. Don't backfill history that wasn't recorded live — log going forward from setup.
5. **Create or update `AGENTS.md`** — technical facts only. If the project already has stack/structure decisions, capture them now; if not, mark sections as "not yet decided" rather than guessing.
6. **Create or update `CLAUDE.md`** — process and tone. Reference `AGENTS.md` and the `memory/` files explicitly so a session knows the read order. Do not duplicate `AGENTS.md` content here.
7. **Tell the user what session-start order to expect** (see below) and confirm the tone/process section in `CLAUDE.md` actually matches how they want to be worked with — this is the one section worth a quick check-in, since getting it wrong compounds over every future session.

Write every generated file in the project's actual working language (mirror the user — Czech, English, whatever the project already uses). Don't default to English if the project is clearly in another language.

---

## File templates

### `memory/index.md`

```markdown
# INDEX — memory map

Read this first, every session, before any work. This file holds no content itself — only where to find it and what state the project is in.

## 1. Project state (one line)
**Phase:** {{one-line current phase}}
Detail always lives in `memory.md` → "Current State".

## 2. System files
| File | Contains | Touch it when |
|---|---|---|
| `memory/index.md` (this) | Map, one-line state | New system file appears, or phase changes |
| `memory/pravidla.md` | Rules for how memory is kept | Only on explicit user instruction |
| `memory/memory.md` | State, decisions, changelog, open questions | After every project change |
| `CLAUDE.md` | Behavior rules + context | Rarely, on explicit user decision |
| `AGENTS.md` | Technical facts, stack, structure, conventions | When stack/structure/conventions change |

## 3. Precedence when documents conflict
User's live prompt → `CLAUDE.md` → `memory/pravidla.md` → `memory/memory.md` → `AGENTS.md`. Conflicts are flagged, never silently resolved.

## 4. Project map
{{directory tree}}

## 5. Session quick start
1. Read `CLAUDE.md` → `memory/index.md` → `memory/pravidla.md` → `memory/memory.md` → `AGENTS.md`.
2. Check `memory.md` for where work stopped and what's open.
3. Work.
4. Log every change to `memory.md` in the same turn it happens.
```

### `memory/pravidla.md`

```markdown
# RULES — how this project's memory is kept

## 1. Core principle
Any change to the project is logged to `memory.md` immediately — same turn, not session-end, not after a reminder.

## 2. What gets logged
File/folder created, renamed, deleted; content, design, or copy changes; technical decisions (stack, library, hosting, integrations); anything tried that **didn't** work; anything deliberately postponed and why; open questions waiting on the user/client.

## 3. What never gets logged
Process narration ("first I searched, then I..."); anything visible directly in the code; self-praise or "all done and working" summaries; duplication of what's already in `CLAUDE.md`/`AGENTS.md`; read-only sessions with zero project changes.

## 4. Changelog entry format
Newest entry on top:
\`\`\`markdown
### YYYY-MM-DD — Short title
- **What:** one or two factual sentences, past tense.
- **Why:** the reason, or "on user instruction" if there's no other reason.
- **Impact:** what else this touches (other sections, SEO, responsiveness, stack). "Isolated" if nothing.
- **Files:** `path/to/file`
\`\`\`
Absolute dates always. No invented facts about the client/business — missing information goes to "Open Questions," never into the project as an assumed fact.

## 5. Upkeep of the other memory.md sections
| Section | Updated when |
|---|---|
| Current State | Any time the phase shifts or a major piece completes. Overwritten, not appended. |
| Key Decisions | A decision is made that won't be revisited. Append-only. |
| Open Questions | A question arises for the user/client. Answered questions are deleted, not left crossed out — the answer moves into Key Decisions or the changelog. |
| Deliberately Not Done | Something is intentionally skipped for now. Protects it from being "fixed" as a bug later. |

## 6. When to touch CLAUDE.md / AGENTS.md / index.md
- `CLAUDE.md` — only on explicit user change to behavior/tone/process. Never holds running state.
- `AGENTS.md` — when stack, structure, build commands, or conventions change.
- `memory/index.md` — when a system file appears or the project phase changes.
- `memory/pravidla.md` — only on explicit user instruction.

## 7. Start / end of session
**Start:** read `CLAUDE.md` → `index.md` → `pravidla.md` → `memory.md`. Check any new request against Key Decisions and Deliberately Not Done before acting — flag collisions immediately, not after implementing.
**End:** verify every change made is in the changelog, Current State is accurate, and no Open Question that got answered is still sitting there.

## 8. Verify, don't assume
If `memory.md` claims something about a file, function, or setting that's about to be relied on, confirm it's still true in the actual project first. Memory describes the state *at the time it was written*, not necessarily now.
```

### `memory/memory.md`

```markdown
# MEMORY — living state

What actually happened, current state, and why. Format rules: see `pravidla.md`.

## Current State
- **Project:** {{name}}
- **Phase:** {{phase}}
- **Stack:** {{stack}}
- **What exists:** {{what's actually built so far}}

## Key Decisions
Decisions that won't be revisited without an explicit user instruction.
- **YYYY-MM-DD** — {{decision}}. Reason: {{why}}.

## Open Questions
Waiting on the user or client. Delete once answered.
- {{question}}

## Deliberately Not Done
So a future session doesn't "fix" this as a mistake.
- **{{what}}.** {{why it's intentionally deferred, and what unblocks it}}.

## Changelog
Newest first.

### YYYY-MM-DD — {{title}}
- **What:** {{...}}
- **Why:** {{...}}
- **Impact:** {{...}}
- **Files:** `{{...}}`
```

### `AGENTS.md` skeleton

```markdown
# AGENTS.md — technical description of {{project}}

Facts for any AI assistant. No tone or behavior rules — those live in `CLAUDE.md`. Living state is in `memory/memory.md`.

## Overview
- **Name / client:** {{...}}
- **Type:** {{...}}
- **Status:** {{...}}
- **Stack:** {{...}}
- **Build / dev commands:** {{...}}
- **Hosting / deploy:** {{...}}

## Repo structure
{{tree}}

## Conventions
{{naming, language, formatting, commit rules}}

## Local skills and when to use them
| Skill | When |
|---|---|
| {{...}} | {{...}} |

## Memory link
Any change to this file's content also gets logged in `memory/memory.md` in the same turn — one without the other is incomplete.
```

### `CLAUDE.md` skeleton (behavior only — pair with a content-focused brief skill if one is available for the actual project context)

```markdown
# CLAUDE.md — {{project}}

Binding for every session in this repo, read at the start of each one — not a one-time setup doc. Takes precedence over the user's prompt when they conflict, unless the user explicitly overrides it.

## 0. First step of every session
Read, in order: `memory/index.md` → `memory/pravidla.md` → `memory/memory.md` → `AGENTS.md`.

## 1. Memory is mandatory
Every project change is logged to `memory/memory.md` in the same turn it happens.

## 2. How to work with this user
{{tone/persona instructions — e.g. direct, no filler, flag problems before implementing, never invent missing facts}}

## 3. Process before any change
1. Restate what's being asked, one sentence.
2. Check it against Key Decisions / Deliberately Not Done in `memory.md`.
3. If there's a conflict, name it before implementing.
4. If it's fine, implement.
5. Log it immediately after.

## 4. Ground rules
{{project-specific non-negotiables — e.g. never fabricate client facts, never silently change stack/structure, verify before deploy}}

## 5. When the prompt conflicts with this file
Name the conflict in one or two sentences and get confirmation before an irreversible change (stack, structure, design system, replacing a placeholder with unverified content). For reversible details, flag and proceed per the user's call.
```

---

## What makes this different from just "writing good docs"

The discipline is in the **loop**, not the files: read memory before acting, check new requests against recorded decisions before implementing, log immediately after — every session, no exceptions. A memory system that gets updated "later" or "when there's time" degrades into exactly the stale, contradictory documentation it was meant to prevent. If asked to set this up, make the logging discipline explicit and get the user's confirmation that they want it enforced this strictly — it's a real workflow commitment, not just file scaffolding.
