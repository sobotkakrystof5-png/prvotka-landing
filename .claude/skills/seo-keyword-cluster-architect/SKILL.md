---
name: seo-keyword-cluster-architect
description: Builds a complete SEO architecture for a website from a set of measurable keywords supplied by the user (e.g. from Collabim, Ahrefs, SEMrush, Marketing Miner, Google Keyword Planner). Maps each supplied keyword onto a URL structure (pillar-cluster model), assigns every URL an explicit primary keyword straight from that list, proposes title/H1/meta for each page, and builds a link-building system organized by cluster. Use this skill whenever the user wants to: rename or create new URLs based on keyword data, build a "cluster system" or "pillar-cluster" architecture, map keywords from a rank-tracking tool onto specific pages, design a new information architecture for SEO, or plan a backlink strategy tied to specific keywords. Also trigger on indirect phrasing like "how should I split the site into subpages based on keywords," "I need an SEO structure for my site," "URL proposal for SEO," or "how do I get links for these keywords."
---

# SEO Keyword Cluster Architect

This skill solves one specific, recurring problem: the user has a list of keywords — usually pulled from a measurable rank-tracking or research tool (Collabim, Ahrefs, SEMrush, Marketing Miner, Google Keyword Planner) — and wants the website to actually target those keywords, through URL structure, title/H1/meta, and eventually backlinks. Without a clear methodology, the most common mistake is creating one separate URL per individual keyword, which causes **keyword cannibalization** (multiple pages competing for the same search result, and none of them winning).

This skill is industry-agnostic — it works for local services, e-commerce, and B2B sites alike. Examples below are illustrative, not tied to any one niche.

## When to use this skill

- The user hands over a list of keywords and wants them "worked into the site" or "split across pages."
- The user names a specific tool (Collabim, Ahrefs, SEMrush, Marketing Miner, Google Keyword Planner) and wants its keyword data turned into a site structure.
- The user wants a "cluster system," "pillar page," "topic cluster," or asks how a site's URL architecture should look.
- The user wants a backlink strategy or plan tied to specific keywords or topics.
- This follows an earlier SEO audit and the user wants it turned into a concrete action plan with URLs, titles, and H1 proposals.

## Rule zero — every URL's keyword must come from the user's supplied, measurable list

This is the foundation of the whole skill and must never be skipped or softened.

1. **Keywords are an input the user provides, not something Claude invents.** The user's keyword list — ideally already validated for search volume/difficulty in a tool like Collabim — is the single source of truth for what each page targets. Never substitute or add keywords Claude thinks "sound good" without flagging them clearly as a suggestion pending validation.
2. **Every proposed URL must be explicitly labeled with exactly which supplied keyword(s) it targets** — one primary keyword, and optionally 1–2 secondary keywords, always traceable back to the list the user gave. State this mapping in plain text next to each URL (see the cluster map format in Step 1) — never leave a URL's keyword assignment implicit or "obvious from context."
3. **If the user's list has no keyword covering some section of the site** (e.g. an "About us" or "Contact" page), do not invent one just to fill the slot. Either mark that page as **not keyword-targeted / supporting page only**, or explicitly ask the user whether they want to supply a keyword for it. A page existing in the architecture doesn't mean it needs a target keyword — only pages meant to rank for something specific do.
4. **If the user gives keyword phrases without real volume/difficulty data**, say so plainly ("to be verified in [tool]") and never fabricate specific search-volume numbers. Claude can rank keywords by *apparent* commercial intent or specificity when organizing them into clusters, but must not present invented numbers as if they were real tool output.
5. **When the user supplies a new or updated keyword list mid-project** (as happens in ongoing SEO work), re-run Steps 1–4 against the new list rather than patching the old structure ad hoc — the cannibalization check in particular must be redone whenever the keyword set changes.

## Prerequisites — confirm before building the architecture

Before building anything, check (and ask, or request more info, rather than guess, if any of this is missing):

1. **Is this a new site or an edit of an existing one?** For an existing site, first establish the current structure (how many URLs, how they're named, what CMS, whether it's a one-pager). One-pagers (single-page sites using anchor links) usually need to move to a multi-page structure first, since one URL cannot target several distinct search intents at once.
2. **Where does the keyword list come from, and is the search volume actually measured?** If the user only listed phrases without volume/difficulty data, mark them clearly as "to be verified in [tool]" in the output.
3. **What's the real business model and actual offering?** A keyword may only get its own page if there's real content/product/service behind it. If a keyword implies a business opportunity the company doesn't currently offer (e.g. "anniversaries" for a wedding venue), flag this to the user and propose it as an offering expansion — not as a thin page with no substance.
4. **Geographic/local variants** (e.g. "[service] + [city B]" for a business based in city A) require extra care — see the Local Variants section below.

## Step 1 — Sort keywords into clusters, with explicit URL-to-keyword mapping

Group every supplied keyword by **actual search intent**, not surface-level text similarity. Base intent types:

- **Commercial / core (pillar)** — broad phrases describing the main product/service (e.g. "weddings," "wedding venue," "accounting services"). These phrases typically overlap in meaning and **belong on a single pillar page**, not multiple separate URLs.
- **Local variants** — same service + different city/location. Get their own URL only if there's a genuine reason (the business actually serves/travels to/is reasonably reachable from that area) — see the honest geo-targeting section below.
- **Product-specific** — a specific sub-product or add-on service (e.g. "wedding catering," "e-commerce bookkeeping"). Get their own subpage under the relevant pillar.
- **Informational** — "how to," "how much does X cost," "what is," "how to choose" queries. No buying intent, but they act as an entry point and a natural source of backlinks. Belong in a blog/magazine, not on commercial pages.
- **Supporting / local context** — phrases not directly about the product but reinforcing local relevance (nearby attractions, area context, regional info). Good for secondary content and link building from non-obvious sources.

**Required output format for this step** — a table with columns: `Keyword (from user's list) | Cluster type | Target URL | Primary/secondary`. Every row's keyword must be one the user actually supplied (see Rule Zero).

### Cannibalization rule (critical)

If two or more keywords share the **same or near-identical search intent**, never give them separate URLs with separate full-fledged content. Merge them onto one page and let them appear naturally in the title, H1, H2, and body text. Signals of cannibalization:
- The phrases differ only in word order or synonym choice ("wedding venue" vs. "venue for weddings").
- The phrases differ only in specificity ("weddings" vs. "weddings in [region]," where the region is where the business is already based — same intent, just phrased more broadly or narrowly).
- Both phrases would lead to essentially the same page content if written separately (if you'd have to write nearly the same thing twice, it's cannibalization).

If unsure, default to merging and explain why in the output — that's a safer mistake than splitting one page's ranking power across two weaker ones.

## Step 2 — Local variants: honest geo-targeting

When the list contains "[service] + [city B]" while the business is based in city/town A:
1. **Never build a local page that implies physical presence in city B if the business isn't there.** That's a manipulative SEO practice (penalized by Google) and misleading to the customer.
2. Instead, the page should target **people in location B who are searching elsewhere / willing to travel** — content must state the real distance/travel time and frame the offer honestly ("wedding venue for couples from Liberec — the estate is a 35-minute drive away").
3. These pages are cluster subpages under the relevant pillar, not separate competing pillars.

## Step 3 — URL architecture (pillar-cluster model)

Standard pattern, proven across industries:

```
domain.com/
├── /main-service/                        ← PILLAR (broad/commercial keywords)
│   ├── /main-service/local-variant-1/
│   ├── /main-service/local-variant-2/
│   └── /main-service/sub-product/
├── /another-service/                     ← another pillar, if one exists
├── /blog/ or /magazine/                  ← informational cluster (hub)
│   ├── /blog/informational-article-1/
│   └── /blog/informational-article-2/
├── /about/, /contact/                    ← standard supporting pages, usually NOT keyword-targeted (see Rule Zero, point 3)
└── /local-context/                       ← supporting content (e.g. nearby attractions, area guide)
```

Principles:
- Pillar = the broadest and most commercial keyword of a given topic.
- Cluster subpages live **under** the pillar in the URL path (`/pillar/cluster/`) where the CMS/tech setup allows — this signals hierarchy to both Google and users.
- Every cluster page **must** link back to its pillar with natural (not exact-match) anchor text.
- The pillar in turn links out to all its clusters.
- Informational content (blog/magazine) cross-links to relevant commercial pillars/clusters — this is the main source of internal SEO strength for conversion pages.

## Step 4 — Title / H1 / meta description for every page

For every proposed URL, produce a table with these columns: **URL | Target keyword(s) (from user's list) | Title (≤60 characters) | H1 | Meta description (150–160 characters)**.

Rules:
- Title and H1 must not be word-for-word identical — H1 can be more descriptive/emotive, title shorter with the keyword closer to the front.
- Every title/H1 on the site must be unique — no two pages share the same title.
- Meta description isn't a direct ranking factor but drives CTR — write it as a micro-pitch (what's on the page + why click), not a keyword stuffed into a sentence.
- Insert the page's primary keyword into the title/H1 naturally, not mechanically repeated.

## Step 5 — Content outline for new pages

For every newly proposed page (especially cluster and informational pages), sketch a short outline (3–6 bullet points) of what the page should actually contain, so it isn't an empty "SEO page" built only for a keyword. Google penalizes thin content built purely to rank, and it doesn't help the reader either.

## Step 6 — Link-building system organized by cluster

Propose backlinks **split by cluster**, not as one generic list — each cluster has a naturally different pool of realistic link sources:

| Cluster type | Typical link sources |
|---|---|
| Pillar / main service | industry directories and listings, PR articles in trade media |
| Local variants | local communities/groups, local partner businesses in that area |
| Sub-product | suppliers/partners tied to that specific product (mutual links), industry blogs |
| Informational/blog | discussion forums, other blogs in the field, social shares — informational content is the easiest to attract links naturally |
| Local context | tourism/regional portals, community sites for that area |

### Anchor text — ratio for a natural profile

Recommend, across the entire link profile (not per link), roughly:
- 50–60% branded anchor text (company/domain name)
- 20–25% generic/naked URL ("click here," bare URL)
- 15–20% partial match to the keyword
- max 5–10% exact match to the target phrase — use sparingly, only from genuinely relevant sources

Always include this warning: exact-match anchor text from many sources at once is one of the strongest signals of manipulative link building, and Google can penalize it. Never recommend buying links from irrelevant directories or PBN networks.

## Step 7 — Timeline and prioritization

Build an action plan with phases (typically 5–8 steps) that:
1. First addresses technical foundations (duplicate/competing domains, one-pager structure, missing meta data — if any exist).
2. Then pillars, then cluster subpages, then informational content.
3. Runs link building in parallel with content, not only at the end — start with the easiest clusters (local, contextual).
4. Ends with how to measure success (rank tracking tool broken down by cluster/tags, Search Console indexation coverage, conversion analytics).

## Output format

The standard output of this skill has this structure (as a standalone document, or a section appended to an existing audit):
1. Cannibalization warning (if relevant) — always first, before anything else is shown.
2. Cluster map: keyword (from user's list) → cluster type → target URL → primary/secondary.
3. Visualized URL architecture tree.
4. Title/H1/meta table for every URL, each row showing its source keyword.
5. Content outlines for new pages.
6. Link-building system by cluster + anchor text rules.
7. Timeline/prioritization.
8. Pre-launch checklist.

Longer output (>100 lines) belongs in a standalone file (.md), not just a chat message — use create_file and present_files.

## Common mistakes to avoid

- Creating a separate URL for every individual keyword regardless of intent overlap (cannibalization).
- Assigning a keyword to a URL without it coming from the user's actual supplied list (see Rule Zero).
- A local landing page implying physical presence somewhere the business isn't.
- Empty "SEO pages" with no real content, built only to house a keyword.
- One generic list of link sources instead of splitting them by cluster.
- Over-concentrating anchor text on exact keyword match.
- Fabricating specific search-volume numbers without real tool data.
- Ignoring technical debt (duplicate domain, missing redirects, one-pager structure) — this must be handled before or alongside content expansion, not after it.
