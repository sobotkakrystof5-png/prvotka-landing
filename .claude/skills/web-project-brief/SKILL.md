---
name: web-project-brief
description: Generates a pair of documents for briefing a client website into Claude Code — a detailed PROJECT-BRIEF prompt (design, tech stack, structure, content, functional requirements) and a CLAUDE.md (persistent behavior and context across sessions). Use this skill whenever the user wants to prepare a brief/prompt for Claude Code to build a client website, a custom marketing site, a landing page, or a multi-page site — even if phrased differently, like "put together a brief", "write up a spec for Claude Code", "make me a CLAUDE.md", or when the user describes a new client and their company with the intent of building them a website. Also trigger when the user just says something like "new client, same process as last time" — this is meant to be a repeatable process, not something rewritten from scratch each time.
---

# Web Project Brief — Claude Code brief generator

This skill was distilled from two real projects (a craftsperson with a personal story, built on Next.js as a multi-page site; an established LLC-type company, built on vanilla HTML/CSS/JS as a landing page) and generalizes what worked in both into a repeatable process. Goal: turn a conversation with the user about a new client into two artifacts — `PROJECT-BRIEF.md` (a detailed prompt for Claude Code) and `CLAUDE.md` (persistent behavior rules + context for that repo).

**The core principle this skill protects above all else:** the resulting website must not look like an "AI template". That is the heart of section 0 in both templates and must never be weakened or dropped when generating a new brief — it is the single most valuable thing carried over from the earlier projects.

## When and how to trigger

This skill is for **starting a new client website project**. If the user just wants to edit an already-existing `PROJECT-BRIEF.md`/`CLAUDE.md`, edit those files directly (see "Editing an existing brief" below) — don't start over from the templates.

## Process

### 1. Gather the missing information (a conversation, not a checklist to tick off)

If the conversation already contains enough information (the user uploaded a logo, pasted company copy, stated a tech stack), don't re-ask — just fill in the gaps. Ask concisely about what actually shapes the document's structure:

- **Client and content:** company name, industry, how long they've been in business, contact details, any source text about the company (never invent facts — if the client didn't state a number of projects/clients, don't make one up).
- **Logo/visuals:** does the client have a logo? What colors does it suggest? Does it need background removal or reformatting?
- **Tone:** does the company have a personal story (a founder, a craftsperson), or is it an established business with no need for storytelling? This directly determines whether sections 1 and 4 of the template include a timeline/storytelling section — don't force a personal narrative where there's no material for it.
- **Structure:** landing page (scroll + anchors), or multi-page site (routing, separate URLs)? If this isn't clear from context, ask.
- **Tech stack:** Next.js/React, or plain HTML/CSS/Vanilla JS, or something else? If a service requiring an API key (Resend, Stripe, anything) comes up alongside a vanilla/static stack — **flag this immediately**: it needs at least one thin serverless function, since the key can't live in client-side code. Don't let this surface only during implementation.
- **Photos:** available now, or is this still a design draft with placeholders? Roughly how many (portfolio, gallery)?
- **Skills/tools:** does the user want to use a specific design skill (e.g. frontend-design) or a custom skill they have locally in Claude Code? If so, mention it in the brief as a note for Claude Code, but don't duplicate another skill's content — just reference it.

If the answer to "landing page vs. multi-page" or "tech stack" is unclear and would fundamentally change the document's structure, ask via `AskUserQuestion` (2–3 short questions), the same way as in the two prior projects — don't guess on the user's behalf; this is an irreversible decision that would otherwise mean rewriting the whole document later.

### 2. Fill in the templates

Use `assets/project-brief-template.md` and `assets/claude-md-template.md` (in this skill's directory) as the base skeleton. Replace the placeholders (`{{...}}`) with real content. Rules for filling them in:

- **Never shorten or weaken section 0 (anti-AI-template) in the project-brief template** — it's the single most important part and must stay concrete (what to avoid + what to do instead + a custom visual motif tied to the client's industry, not something generic).
- **{{DOMAIN_VISUAL_INSPIRATION}}** — come up with a concrete visual motif idea based on the client's industry (for metalwork/locksmithing, e.g. a weld seam, a technical drawing, dimension lines — but for a different industry, find a different, industry-specific inspiration, not a recycled one).
- **Structure (sections 3–4 of the brief):** fill in either the multi-page variant (route list) or the landing-page variant (anchor list) — never leave both, never leave conflicting instructions in place at once.
- **CLAUDE.md section 5 (Project status)** should be filled in with sensible defaults even on first creation (e.g. "Current phase: design draft, awaiting client approval") — this section is new relative to both prior projects and functions as a log that must be **updated in every subsequent session**, not just once at setup. Tell the user this explicitly so they know to keep coming back to this file.
- Never invent facts about the client (client counts, years of experience, specific prices) if the user didn't provide them — leave a placeholder or ask.

### 3. Create both files and save them under clear, project-specific names

- `{client-slug}-claude-code-prompt.md` (or `PROJECT-BRIEF.md`, if the user prefers a generic name for the project root)
- `CLAUDE.md` — if the user already has a `CLAUDE.md` from another project in the current outputs directory, **don't silently overwrite it** — name the new file differently (e.g. `CLAUDE-{client-slug}.md`) and note that it should be renamed to `CLAUDE.md` once placed in that project's own repo root, since that's the filename Claude Code loads automatically.

Point the user to both files, and briefly summarize what's inside and which key choices (structure, stack, tone) you made based on the conversation — not as a long report, just a few sentences.

### Editing an existing brief

If the user wants to modify an already-created `PROJECT-BRIEF.md`/`CLAUDE.md` (not start a new project), don't route it back through the templates — find the specific file, edit it targeted (Edit tool), and above all **check whether the change conflicts with another part of the document** (a classic case: changing the structure from landing page to multi-page must also be reflected in sections 3, 4, and CLAUDE.md section 4 — not just the part the user was looking at). This is a real mistake to avoid — in the prior projects, a structure change had to be propagated to multiple places across both documents at once.

## When unsure

Same rule that lives inside the generated documents themselves: if you're unsure about the client's industry, the tone to use, or whether a visual idea is too generic — ask, don't guess. This skill exists primarily to protect the quality and originality of the output, not speed.
