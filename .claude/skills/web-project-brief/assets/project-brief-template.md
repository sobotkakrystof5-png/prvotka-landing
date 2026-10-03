# CLAUDE CODE PROMPT — {{PROJECT_NAME}} Website

Copy this entire document as the first task into Claude Code (in a new project/repo).

---

## 0. CRITICAL — THIS WEBSITE MUST NOT LOOK LIKE AN "AI TEMPLATE"

This is the single most important instruction in this brief and it must inform every decision below. The vast majority of AI-generated websites look the same — recognizable, uniform, soulless. This website must be the exact opposite: it must look like it was designed and hand-tuned by an experienced designer specifically for this client, with attention to every detail.

**Specifically AVOID these typical "AI website" patterns:**
- The generic hero layout of "big centered headline + subheadline + two buttons side by side + illustration/gradient on the right" — if you do use this layout, give it asymmetry, unusual proportions, elements that break the grid, an unconventional CTA placement.
- Excessive symmetry and centering of everything — work with an asymmetric grid, let elements spill over, create visual tension.
- Generic "feature card" grids with the same icon-on-top, heading, text pattern repeated 3–4 times identically — treat every section with its own composition, not a repeated card pattern.
- Overused gradients (purple-blue, rainbow), glassmorphism without purpose, generic 3D illustrations, and unmodified stock icon sets.
- Predictable "fade-in + slide-up on everything on scroll" animations — use animation deliberately, with its own rhythm, not as a blanket effect across the whole page.
- Lorem-ipsum-style placeholder text or generic marketing phrases ("We are a team of professionals", "Quality is our priority") — every piece of text must be concrete, on-point, and reflect the client's actual content and voice.
- Identical spacing and alignment in every section (same padding, same container width throughout) — let sections breathe differently, vary density and rhythm.
- A font pairing where both heading and body look like an out-of-the-box Tailwind/shadcn default with no typographic personality — micro-tuning (tracking, line-height, size contrast) must be deliberate, not default.

**Instead:**
- Design **one or two custom visual motifs/elements** rooted in the client's industry ({{DOMAIN_VISUAL_INSPIRATION}}) that recur throughout the site and make it memorable. Keep this motif consistent, but use it as a **signature**, not decoration on every corner.
- Give every section/page its **own compositional logic** — a different text/image ratio, different alignment, different rhythm, so browsing the site feels like flipping through a thoughtfully designed portfolio, not repeating one component.
- Details that make the difference: subtle hover micro-interactions tailored to the content (not a generic `scale-105`), deliberate transitions between sections/pages, authentic, specific copy in the client's voice — not generic phrases.
- Write CSS/components as if a person tuned them pixel by pixel ten times over — consistent, but not machine-uniform.

If Claude Code is unsure whether a given element looks templated, it should ask or propose a more original alternative rather than reaching for the most common solution.

---

## 1. PROJECT CONTEXT AND CLIENT CONTENT

**Company/client:** {{CLIENT_NAME}}
**Industry:** {{INDUSTRY}}
**Established / in business since:** {{FOUNDING_YEAR}}
**Address:** {{ADDRESS}}
**Company IDs (if relevant):** {{ICO_DIC}}
**Phone:** {{PHONE}}
**Email:** {{EMAIL}}

**Source content about the company (client-provided material — rephrase stylistically, but keep all facts and content, do not invent additional facts, do not guess at numbers the client did not provide):**

{{RAW_CLIENT_CONTENT}}

**Website goal:** {{WEBSITE_GOAL}} — it must feel immediately trustworthy and must generate new customer inquiries (form, phone).

**Tone:** {{BRAND_TONE}} — (e.g. "human, personal story" for a craftsperson with a real personal story, or "matter-of-fact, solid, no forced familiarity" for an established company with no personal brand — choose based on the client's actual character, don't force storytelling where there's no material for it).

---

## 2. LOGO AND DESIGN SYSTEM

### Logo
{{LOGO_INSTRUCTIONS}}
(If the client supplied a logo with an unsuitable background: note that the background must be removed / processed into a transparent PNG/SVG, keeping the logo itself/its colors unchanged.)

### Colors
- **Primary color:** {{COLOR_PRIMARY}} — use as an accent (CTAs, icons, hover states, dividers), not as a flat background.
- **White/off-white:** as the dominant background.
- **Dark for text:** near-black/a dark shade of the primary color, not pure black.
- **Secondary/accent color (if any):** {{COLOR_SECONDARY}} — use sparingly, not as a flat area.
- Recommended ratio: roughly 80–85% neutral (white/dark), the rest accent color(s). The accent color must not dominate large areas — it should draw attention, not fill space.
- **Check contrast** (WCAG AA minimum) for every text/background combination, especially accent color on white and white text on the accent color.

### Typography
- Headings: a bold, confident font with personality (not an unstyled system default) — e.g. Space Grotesk, Sora, or Inter with deliberately tuned tracking.
- Body text: a readable sans-serif with good line-height.
- Hierarchy: clearly distinct heading levels, a strong hero headline.

### Visual language
- {{VISUAL_STYLE_NOTES}} (industrial / organic / minimalist / premium — depending on the client's industry and character).
- Photo placeholders: always a clearly labeled frame (gray background, camera icon, caption describing what belongs there, `aspect-ratio` matching the final layout) — **never stock photos as filler**.

---

## 3. TECHNICAL STACK

**Chosen stack:** {{TECH_STACK}}

If the stack is **Next.js / React-based**:
- Next.js (App Router) + TypeScript, Tailwind CSS, Framer Motion for animation, React Hook Form + Zod for form validation.

If the stack is **plain HTML/CSS/Vanilla JS**:
- No frontend framework, no build step for the main site.
- **If the site uses Resend (or any other service requiring an API key) for the contact form, the API key must never live in client-side JS.** Handle this with a single thin serverless function (Vercel/Netlify function) alongside the static files — not a whole extra framework. This must be explicitly verified for every project combining Resend (or similar) with a vanilla/static stack — never silently assume it will work without a backend.

**Site structure:** {{STRUCTURE_TYPE}}

If **multi-page website**:
- True routing — every navbar item is its own URL/route. The homepage is a short overview/hub linking further, not a compilation of all content. No anchors (`#section`) between the main navigation items.
- Route list: {{ROUTES_LIST}}
- Shared layout with Header/Footer, current page visually highlighted in navigation.
- Benefit: dedicated SEO metadata per page.

If **single-page website (landing page)**:
- One scrollable page, header navigation links to anchors: {{ANCHORS_LIST}}.
- Smooth scroll, scrollspy (active nav link matches the section currently in the viewport).

- Map (if relevant): Mapy.cz iframe or Google Maps embed — a simple embed, no heavy JS SDK.
- Images: lazy loading (`next/image` or `loading="lazy"` for vanilla).
- Responsiveness: mobile-first, fully responsive at every breakpoint.
- SEO: meta tags, OpenGraph, sitemap.xml, robots.txt, semantic HTML5.

---

## 4. CONTENT STRUCTURE (SECTIONS/PAGES IN ORDER)

{{CONTENT_STRUCTURE}}

(Break down each section/page individually: what it contains, what layout, where the photo placeholders are, what CTAs it has and where they lead. For companies with a personal story, include a timeline/storytelling section. For product/portfolio-driven companies, include a projects/portfolio section with placeholders. The contact section/page always includes: contact details, a map (if relevant), a form.)

---

## 5. FUNCTIONAL REQUIREMENTS — CONTACT FORM

{{CONTACT_FORM_SPEC}}

Always include, regardless of implementation:
1. Input validation (required fields, email format) — both client-side and server-side.
2. Secure submission (API key never in client-side code).
3. A honeypot or other basic spam protection.
4. Loading/success/error states on the frontend, form reset after success.
5. A clear statement of exactly where the inquiry email is sent.

---

## 6. RULES FOR PHOTO PLACEHOLDERS

- If the client hasn't supplied photos yet (typical for a first draft): **no stock/external images used as filler.**
- Every placeholder = a clearly, visually distinct frame (dashed/thin border, neutral background, camera icon, caption describing what belongs there).
- Placeholders must have the final `aspect-ratio` set so the layout/CSS doesn't need to change once real photos are dropped in.
- State exact counts and locations: {{PHOTO_PLACEHOLDER_COUNTS}}

---

## 7. ACCESSIBILITY AND PERFORMANCE

- Text-to-background contrast at least WCAG AA.
- Semantic HTML, `alt` text on all images (including a descriptive alt for placeholders, ready for future replacement), correct heading hierarchy (one H1 per page).
- Form fully keyboard-operable, clear validation error messages.
- Image optimization (formats, sizes) — structure the project so optimized final photos can be dropped in easily.
- Basic Core Web Vitals awareness: no unnecessary render-blocking scripts, minimize layout shift (hence the fixed `aspect-ratio` on placeholders/images).

---

## 8. LEGAL REQUIREMENTS (IF RELEVANT)

- A GDPR consent checkbox on the form — {{GDPR_TEXT_NOTE}}.
- Consider whether the site needs a dedicated "Privacy Policy" and "Terms of Service" page/section — if so, include it as a placeholder page/section to be filled in later by the client/a lawyer; do not generate legal text yourself.
- A cookie banner, if the site uses analytics/cookies beyond strictly necessary ones.

---

## 9. STEP-BY-STEP IMPLEMENTATION PLAN

{{IMPLEMENTATION_STEPS}}

(Base skeleton, adapt to the chosen stack and structure:)
1. Initialize the project per the chosen stack.
2. Set up design tokens (colors, fonts, spacing).
3. Build the base layout (Header, Footer / navigation matching the structure type).
4. Implement each section/page in a logical order.
5. Add animations/micro-interactions deliberately, not blanket-applied.
6. Implement the photo placeholder system.
7. Implement the contact form + secure submission.
8. Embed the map (if relevant).
9. Verify full responsiveness at every breakpoint.
10. Run an SEO and accessibility check.
11. Test the build/deployment, verify the form works end to end.

---

## 10. THE FINAL IMPRESSION THE SITE SHOULD LEAVE

The site must, at first glance, feel like {{DESIRED_IMPRESSION}} — and must not be recognizable as "a website built by an AI tool". It must be clear, fast, flawless on mobile, and must clearly guide the visitor toward one action — an inquiry. A visitor should feel like the site was designed by someone who knew this client and their industry in detail — not like they went through a generator.

---

**Note for Claude Code:** Write clean, well-commented code, keep a consistent structure and naming convention, and set up the project so real photos and copy can be dropped in easily without touching the code structure. Before finishing each section/page, ask yourself: "Does this look like deliberate work designed for this specific client, or like a generic template?" — if the latter, rework it per section 0.
