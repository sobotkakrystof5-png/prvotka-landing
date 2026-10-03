# Security decisions

> Append-only. Every conscious trade-off, with the reason and a review date.
> An accepted risk with no review date is a forgotten risk.

Format:

```
## NNN — <short title>
Date: YYYY-MM-DD
Decision: <what was decided>
Reason: <why, concretely — what broke, what the alternative cost>
Alternatives considered: <what else was on the table and why it lost>
Risk accepted: <what is now possible that otherwise would not be>
Review: YYYY-MM-DD or "when <condition>"
```

---

## 001 — Baseline established
Date: YYYY-MM-DD
Decision: Full header set deployed via `<file>`, CSP starts report-only.
Reason: Site already live; an enforcing policy without a report-only phase risks
breaking the contact form and the map for real visitors.
Risk accepted: For the report-only period, CSP provides no protection.
Review: YYYY-MM-DD (switch to enforcing)

## 002 — style-src 'unsafe-inline'
Date: YYYY-MM-DD
Decision: Allow inline styles.
Reason: Next.js injects critical CSS inline; without this, the site renders unstyled on
first paint. Framer Motion also writes styles at runtime.
Alternatives considered: nonce on style elements — not reliably supported by the
framework's own injected styles.
Risk accepted: CSS-based data exfiltration and UI redressing become possible. Scripts
remain fully locked down, so this does not open script injection.
Review: when the framework supports style nonces, or when Framer Motion is dropped.

## 003 — <example of an inherited unknown>
Date: YYYY-MM-DD
Decision: Kept `connect-src https://old-analytics.example` for now.
Reason: Unknown — inherited from before this log existed. Removing it without knowing
what breaks is riskier than leaving it one more quarter.
Review: YYYY-MM-DD — test removal on staging.
