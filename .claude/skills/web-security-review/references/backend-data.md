# Backend and data review

## Server-side validation

Client validation is UX. The endpoint is the boundary.

Every route that accepts data validates it with a schema, including a maximum length on
every field. Without a length cap, a text field accepts megabytes and becomes a cheap
denial-of-service and a fat bill.

```ts
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(2000),
  // Honeypot: real users never fill this
  website: z.string().max(0).optional(),
});

const parsed = ContactSchema.safeParse(await request.json());
if (!parsed.success) {
  return Response.json({ error: 'Invalid input' }, { status: 400 });
}
```

Return a generic error to the client. Echoing back which validation rule failed on which
field is fine for a public contact form and a bad idea on anything auth-related, where it
tells an attacker which accounts exist.

## SQL

Parameterised queries only. String concatenation with user input is the vulnerability,
regardless of how much escaping is layered on top.

```js
// wrong
db.query(`SELECT * FROM posts WHERE slug = '${slug}'`);
// right
db.query('SELECT * FROM posts WHERE slug = $1', [slug]);
```

ORMs handle this by default, but their raw-query escape hatches do not. Grep for
`.raw(`, `$queryRawUnsafe`, `sequelize.query(` and check each one.

## Supabase Row Level Security

The `anon` key is public by design. RLS is the only thing between the internet and the
table. A Supabase project with RLS off is equivalent to publishing the database.

Find unprotected tables:

```sql
select relname from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity = false;
```

An empty result is the only acceptable answer. Then check the policies themselves —
RLS enabled with a `using (true)` policy protects nothing:

```sql
select tablename, policyname, cmd, qual from pg_policies where schemaname = 'public';
```

Write policies restrictively and grant specific cases. For a marketing site with a
contact form, the usual shape is: nobody can select, and inserts are done by a server
route holding the service key rather than by the browser at all.

The `service_role` key bypasses RLS entirely. It belongs only in server-side code, never
in a component, never in a `NEXT_PUBLIC_` variable.

## API routes and serverless functions

- Authorisation is checked per request, on the server. A hidden UI button is not access
  control.
- Object IDs from the client are verified against the caller's ownership. Fetching
  `/api/orders/1234` must not work just because the ID exists.
- CORS: an explicit origin allowlist. `Access-Control-Allow-Origin: *` combined with
  credentials is a data leak.
- Webhooks verify their signature (Stripe, GitHub, Resend all sign). An unverified
  webhook endpoint is an open API for anyone who guesses the URL.
- Errors return a generic message; details go to the server log.

## Cookies and sessions

Every cookie the app sets:

```
Set-Cookie: session=...; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=...
```

`HttpOnly` keeps JavaScript — including injected JavaScript — away from the session.
`SameSite=Lax` blocks the common CSRF shapes; use `Strict` when no cross-site navigation
needs the session. Analytics cookies read by client script cannot have `HttpOnly`, which
is fine as long as they carry nothing sensitive.

State-changing requests that rely on cookies need CSRF protection: a token, or an origin
check. `SameSite` alone is good but not complete.

## Dependencies

```bash
npm audit --omit=dev --audit-level=high
```

Check the lockfile is committed and that no dependency was added that does one trivial
thing. Each package is third-party code executing in the build and often in the browser.
