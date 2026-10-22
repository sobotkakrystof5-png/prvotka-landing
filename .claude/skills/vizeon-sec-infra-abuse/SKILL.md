---
name: vizeon-sec-infra-abuse
description: Zabezpečení hostingu a ochrana proti zneužití – účty Vercel/Supabase/GitHub/registrátor (MFA, minimum adminů), DNS a doména (registrar lock, CAA, DNSSEC, SPF/DKIM/DMARC), Vercel Deployment Protection pro preview, Vercel Firewall/WAF a Attack Challenge Mode, DDoS, debug v produkci, rychlé zablokování provozu a rollback, rate limiting (login, API, formuláře, exporty, AI), limity velikosti a času, denial of wallet a spend limity, security.txt. Použij při nastavení nového projektu na Vercelu, domény, při psaní veřejných endpointů a formulářů a při podezření na útok nebo zneužití. Pokrývá sekce K a R.
---

# Hosting, síť a anti-abuse (sekce K, R)

WAF a rate limiting **neopraví chybnou autorizaci** – jsou to vnější vrstvy. Jejich úkolem je zpomalit automatizované útoky, omezit náklady a dát čas na reakci.

## Účty a přístupy (#119, #120, #122)
| Účet | Požadavek |
|---|---|
| Vercel team | MFA/passkey pro všechny, SSO pokud plán umožňuje, role Member/Viewer místo Owner, min. 2 owneři (ne víc) |
| Supabase organizace | MFA vynucené na úrovni organizace, role Developer/Read-only kde stačí, produkční projekt jen nutné osoby |
| GitHub organizace | 2FA povinné, viz `vizeon-sec-supply-chain-cicd` |
| Registrátor domény | MFA, **registrar lock / transfer lock**, kontaktní e-mail na doméně, kterou nespravuje stejný účet, autorenew |
| DNS (Vercel DNS / Cloudflare) | MFA, audit změn, CAA záznam (`0 issue "letsencrypt.org"` + případně `pki.goog`), DNSSEC kde to registrátor umí |
| E-mail doména | SPF, DKIM (Resend), DMARC `p=quarantine` → `p=reject` po ověření (N-28) |
| Správce hesel | sdílené trezory per klient, ne sdílené osobní účty |

**Klient by měl vlastnit** produkční účty (doména, Vercel team, Supabase organizace) a VIZEON v nich má delegovaný přístup – viz předání v `vizeon-sec-release-gate` (N-42).

Kvartálně: revize členů všech účtů, odebrat neaktivní (#120, #264).

## Vercel (#121, #123–#129)
- **Deployment Protection** pro Preview (Vercel Authentication nebo heslo) – preview URL jsou jinak veřejné a indexovatelné (#123). Preview napojené na staging, ne produkční data.
- Protection bypass tokeny (pro E2E testy) jen v CI secrets, rotovat.
- **Vercel Firewall** (#124): zapnutá ochrana platformy; vlastní pravidla – blokace známých scannerů, omezení `/api/*` metod, geoblokace podle potřeby klienta (např. B2B jen CZ/SK/EU pro admin), rate limit pravidla na citlivé cesty (login, reset, export, AI). Při útoku **Attack Challenge Mode** (#129).
- Logy firewallu a runtime logy sleduj; log drain do centrálního úložiště (`vizeon-sec-ops-resilience`).
- **Debug v produkci** (#127): žádné `productionBrowserSourceMaps`, žádné debug endpointy, `NODE_ENV=production`, React DevTools/Next dev overlay neběží, žádné verbose chybové stránky, `poweredByHeader: false`.
- Interní služby (#126): admin a interní API nemají být dostupné z internetu bez autentizace; cron endpointy chráněné tajemstvím (`CRON_SECRET` v `Authorization` hlavičce, porovnání v konstantním čase).
- Rollback a blokace (#129): Instant Rollback vyzkoušený; postup v `incident-runbook.md`.
- Spend Management: limit útraty a alerty (N-30).
- Konfigurační změny (#128): Vercel a Supabase audit logy (dle plánu) + změny `vercel.json`/`next.config` jen přes PR.

## DDoS (#125)
Vercel a Supabase mají ochranu L3/L4. Aplikační vrstva: rate limity, cache veřejných stránek, limity velikosti požadavků, timeouty, Attack Challenge Mode. Supabase: Data API má vlastní limity; drahé dotazy (full-text bez indexu, velké `select`) jsou DoS vektor → indexy, `limit` povinně, `statement_timeout` pro role `anon`/`authenticated` (např. `alter role authenticated set statement_timeout = '8s';`).

## Rate limiting (sekce R)

### Kde a jak (#196–#203)
| Cíl | Klíč limitu | Doporučení (výchozí, uprav) |
|---|---|---|
| Login, OTP, reset hesla | IP + e-mail | Supabase Auth rate limits + CAPTCHA; aplikačně 5/min, 20/h na e-mail |
| Registrace / pozvánky | IP, org | 3/h na IP, 50/den na org |
| Veřejné formuláře (kontakt, poptávka) | IP | CAPTCHA (Turnstile) + honeypot + 5/h |
| Běžné API/Server Actions | user + org | 60–120/min na uživatele |
| Export dat | user + org | 3/h, max řádků, async |
| Odesílání e-mailů/SMS z aplikace | org | denní kvóta; ochrana proti zneužití jako spam relay |
| AI operace | user + org | tokeny/den, náklady/den, souběžnost 1–2 |
| Upload | user + org | počet/h, MB/den |
| Webhooky příchozí | provider | ověřený podpis je hlavní ochrana; limit proti zahlcení |

- Implementace sdíleného úložiště limitů (#204): serverless funkce nesdílí paměť → Upstash Redis (`@upstash/ratelimit`) nebo Vercel Firewall rate limiting; nikdy in-memory `Map` v produkci.
- IP z `x-forwarded-for` věř jen od Vercelu (první hodnota nastavená platformou); pro přihlášené uživatele limituj podle `userId`, ne IP.
- Překročení limitu → `429` s `Retry-After`, bez dalších informací; zalogovat; neobchází se tím žádná kontrola (fail closed) (#205).

```ts
// src/server/ratelimit.ts
import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
export const limits = {
  login:  new Ratelimit({ redis, prefix: 'rl:login',  limiter: Ratelimit.slidingWindow(5, '1 m') }),
  api:    new Ratelimit({ redis, prefix: 'rl:api',    limiter: Ratelimit.slidingWindow(120, '1 m') }),
  export: new Ratelimit({ redis, prefix: 'rl:export', limiter: Ratelimit.fixedWindow(3, '1 h') }),
  ai:     new Ratelimit({ redis, prefix: 'rl:ai',     limiter: Ratelimit.tokenBucket(20, '1 h', 20) }),
}
export async function enforce(limit: keyof typeof limits, key: string) {
  const { success } = await limits[limit].limit(key)
  if (!success) throw new AppError('RATE_LIMITED')   // → 429
}
```

### Velikost a čas (#201, #202)
- Server Actions: `serverActions.bodySizeLimit` v `next.config` (výchozí 1 MB – nezvyšuj plošně).
- Route Handlery: kontroluj `content-length` a čti tělo s limitem.
- `maxDuration` funkcí nastav podle potřeby, ne na maximum. Dlouhé úlohy do fronty (Supabase Queues / Inngest / QStash) s timeoutem a retry limitem.
- Stránkování povinně (`range`, max 100 řádků), žádné „vrať vše“.

### Denial of wallet (N-30)
- Spend limity: Vercel Spend Management, Supabase spend cap (pokud plán), AI poskytovatel – měsíční limit a alert na 50/80/100 %.
- Alert na neobvyklý nárůst invokací, egressu, Storage, e-mailů.

## Vulnerability disclosure (N-27)
`/.well-known/security.txt` (RFC 9116) s `Contact:` a `Expires:` + `docs/security/SECURITY.md` kontakt. Šablona viz skill `web-security-setup`.

## Kontroly: #119–#129, #196–#205, N-27, N-28, N-30
