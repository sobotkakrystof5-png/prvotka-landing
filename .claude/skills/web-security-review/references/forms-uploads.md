# Forms, uploads and mail

## Contact forms

On a small client site this is usually the only interactive surface, which makes it the
whole attack surface. Four layers, all of them cheap:

**Honeypot.** A hidden field real users never fill. Stops the crudest bots and costs
nothing. Not sufficient alone any more.

**Timing.** A form submitted under two seconds after load was not filled in by a human.

**Rate limit.** Per IP and globally. Without one, the form becomes a way to flood the
client's inbox or burn through a mail provider quota overnight.

```ts
// Upstash Ratelimit, sliding window
const { success } = await ratelimit.limit(`contact:${ip}`);
if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 });
```

**Captcha.** Cloudflare Turnstile is free, has no visible puzzle in most cases, and its
secret key stays on the server where the token is verified. Verification happens
server-side — checking it in the browser proves nothing.

Never send mail directly from client code. SMTP credentials cannot live in a bundle. The
form posts to a serverless function, the function sends the mail.

## Mail content

The submitted values end up in an inbox, often rendered as HTML. Escape them, or send
plain text. A message body containing `<img src=x onerror=...>` should not execute in
the client's mail client.

Set the envelope sender to your own domain and put the visitor's address in `Reply-To`.
Sending as the visitor's address gets the mail rejected by SPF and DMARC and quietly
ruins the client's deliverability.

## File uploads

The most dangerous feature on any small site. If the project does not truly need it,
that is the best fix available.

When it stays:

- **Extension allowlist**, never a blocklist. `image.php.jpg` and `image.jpg.php` are
  both things attackers try.
- **Verify the real type** from the file's magic bytes, not from the `Content-Type`
  header the client sent, which is attacker-controlled.
- **Size limit** enforced on the server as well as in the UI.
- **Rename** to a generated name. The original filename is untrusted input and path
  traversal (`../../etc/passwd`) lives there.
- **Store outside the web root** or in object storage, and serve from a separate domain
  or with `Content-Disposition: attachment` so an uploaded HTML or SVG file cannot run
  as script on your origin.
- **SVG is executable.** It can contain script. Either sanitise it or refuse it.
- Images get re-encoded server-side, which strips both embedded payloads and EXIF
  location data the uploader did not mean to share.

## Redirects

An open redirect (`/go?url=...` that forwards anywhere) turns your domain into a
credibility loan for phishing. Validate the target against an allowlist, or only permit
same-origin paths.

## What to test manually

- Submit fifty times in a loop and see whether all fifty arrive.
- Submit with JavaScript disabled — does server validation still hold?
- Put `<script>alert(1)</script>` and `'; drop table --` in every field and check where
  they surface: the inbox, an admin panel, a log viewer.
- Upload a `.php`, an `.svg` with script inside, and a 500 MB file.
