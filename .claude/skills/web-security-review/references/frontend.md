# Frontend review

## Secrets in the bundle

The bundle is public. Anything reachable from client code is readable by anyone.

Check:

```bash
# What actually shipped
grep -rEi "(api[_-]?key|secret|password|token|service_role)" .next/static dist build 2>/dev/null | head
# What is exposed by convention in Next.js
grep -rn "NEXT_PUBLIC_" --include="*.ts" --include="*.tsx" --include="*.js" .
# History, not just the working tree
git log -p --all -S "SUPABASE_SERVICE_ROLE" | head
```

Publishable by design: Supabase `anon` key, Stripe publishable key, Turnstile site key,
GA measurement ID. These are meant to be public — the protection lives elsewhere (RLS,
server-side confirmation, domain restrictions).

Never client-side: `service_role`, Stripe secret key, SMTP credentials, any admin token,
webhook signing secrets. If one is found in a bundle or in git history, it has to be
rotated. Deleting the commit does not un-leak it.

## DOM sinks

Search for the ways untrusted data becomes markup:

```bash
grep -rn "dangerouslySetInnerHTML\|innerHTML\|outerHTML\|insertAdjacentHTML\|document.write\|v-html\|eval(\|new Function(" src app components
```

Each hit needs an answer to "where does this string come from". Literal strings and
build-time content are fine. Anything derived from a URL parameter, a form field, a CMS
field or an API response is not.

When rich text genuinely has to render, sanitise it. Server-side where possible, because
client-side sanitisation can be skipped by anything that talks to the API directly:

```js
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
```

Watch for the less obvious sinks too: `href={userValue}` allows `javascript:` URLs,
`style={userValue}` allows CSS-based data exfiltration, and an unvalidated redirect
target (`?next=`) sends users to an attacker's site with your domain's credibility
attached.

## Third-party scripts

Every `<script src>` pointing at a domain you do not control runs with full privileges
on your page. It can read the DOM, rewrite the contact form and read anything the user
types.

For each one, ask whether it is worth that. A cookie banner from an unknown vendor
usually is not.

When it stays, pin it:

```html
<script src="https://cdn.example.com/lib@1.2.3/lib.min.js"
        integrity="sha384-..."
        crossorigin="anonymous"
        defer></script>
```

Subresource Integrity means a compromised CDN cannot swap the file. It requires a
versioned URL — SRI on a `@latest` URL breaks on the next release, which is the point.

Self-hosting the file is better still where licensing allows.

## Links and embeds

- `target="_blank"` needs `rel="noopener noreferrer"`. Modern browsers imply `noopener`,
  but older ones and some in-app webviews do not.
- Any `<iframe>` embedding third-party content gets a `sandbox` attribute with only the
  capabilities it needs.
- User-supplied URLs rendered as links get their scheme validated against an allowlist
  of `https:`, `http:` and `mailto:`.

## Build output

- Source maps off in production, or at least not publicly served.
- No `console.log` leaking internal data on production pages.
- Error boundaries show a generic message; the stack trace goes to the log, not to the
  visitor.
- Check that `/.env`, `/.git/config` and `/package.json` are not served — the audit
  script covers this, but the fix is a build or server config change.
