# External verification tools

The bundled script gives a pass/fail. These give a grade and catch things a shell script
cannot.

| Tool | URL | Target | Notes |
|---|---|---|---|
| Security Headers | `https://securityheaders.com/?q=DOMAIN` | A+ | Fast. Only checks presence, not quality — a CSP full of `unsafe-inline` still scores well here, which is why the bundled script checks the policy content separately. |
| Mozilla Observatory | `https://developer.mozilla.org/en-US/observatory/analyze?host=DOMAIN` | A+ | Stricter and more honest about CSP quality. |
| SSL Labs | `https://www.ssllabs.com/ssltest/analyze.html?d=DOMAIN` | A+ | Takes a few minutes. Run after any TLS change. |
| CSP Evaluator | `https://csp-evaluator.withgoogle.com/` | no high findings | Paste the policy. Explains exactly why a directive is weak. |
| Hardenize | `https://www.hardenize.com/` | green DNS/mail/TLS | Best single view of DNSSEC, CAA, SPF, DKIM, DMARC. |
| Lighthouse | Chrome DevTools | Best Practices 100 | Catches mixed content and insecure links. |

Public scanners publish their results. For a client site that is normally fine; for
anything behind a login or on a staging domain, use the local script instead.

## Local tools

**OWASP ZAP baseline** — a passive crawl, no attack traffic, safe against your own
production site.

```bash
docker run --rm -t zaproxy/zap-stable zap-baseline.py -t https://example.com
```

Expect warnings about missing anti-CSRF tokens on a static site; those are false
positives when there are no state-changing forms.

**gitleaks** — secrets across the whole git history, not just the working tree.

```bash
docker run --rm -v "$(pwd):/repo" zricethezav/gitleaks:latest detect -s /repo --verbose
```

**testssl.sh** — a local SSL Labs, works on internal and staging hosts.

```bash
docker run --rm -ti drwetter/testssl.sh https://example.com
```

**npm audit**

```bash
npm audit --omit=dev --audit-level=high
```

## Interpreting a grade

An A+ on securityheaders.com means the headers exist. It says nothing about RLS, input
validation, an exposed `.env` or a leaked key. Treat these tools as a check that the
configuration survived the last deploy, not as evidence the site is secure. The code
review and the manual tests are where the real findings come from.
