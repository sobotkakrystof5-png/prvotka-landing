# Kódové vzory – Next.js (App Router) + Supabase

Vzory jsou výchozí bod. Před použitím ověř API aktuálních verzí knihoven.

## 1. Struktura serverového kódu

```
src/
  server/
    supabase.ts        // createServerClient (@supabase/ssr) – uživatelský kontext, RLS platí
    auth.ts            // requireUser, requireAal2
    authz.ts           // requireMembership, authorize, permissions (= access-matrix.md)
    audit.ts           // zápis do audit.events
    admin/
      supabase-admin.ts  // JEDINÉ místo se SUPABASE_SECRET_KEY
    integrations/      // stripe.ts, resend.ts, ai.ts – každý s vlastním klíčem
  app/...
```

ESLint – zákaz importu admin klienta mimo povolená místa:
```js
// eslint.config.mjs (výňatek)
{
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/server/admin/**', 'src/app/api/webhooks/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{ group: ['**/server/admin/*', '@/server/admin/*'],
                   message: 'Secret key jen v admin modulu a webhookách (VIZEON P0).' }],
    }],
  },
}
```

## 2. Admin klient (secret key)

```ts
// src/server/admin/supabase-admin.ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY   // nikdy NEXT_PUBLIC_
  if (!key) throw new Error('missing secret key')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
// Pravidlo: volající MUSÍ před použitím provést vlastní autorizaci a zapsat audit.
```

## 3. Obal Server Action – validace, auth, chyby

```ts
// src/server/action.ts
import 'server-only'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; requestId: string }

export function action<S extends z.ZodType, T>(schema: S, fn: (input: z.infer<S>) => Promise<T>) {
  return async (raw: unknown): Promise<ActionResult<T>> => {
    const requestId = randomUUID()
    const parsed = schema.safeParse(raw)
    if (!parsed.success) return { ok: false, error: 'INVALID_INPUT', requestId }
    try {
      return { ok: true, data: await fn(parsed.data) }
    } catch (e) {
      const code = e instanceof AppError ? e.code : 'INTERNAL'
      // log bez PII/tokenů; detail jen do serverového logu
      console.error(JSON.stringify({ requestId, code, err: e instanceof Error ? e.name : 'unknown' }))
      return { ok: false, error: code === 'FORBIDDEN' ? 'NOT_FOUND' : code, requestId }
    }
  }
}
```

```ts
// app/(app)/invoices/actions.ts
'use server'
import { z } from 'zod'
import { action } from '@/server/action'
import { authorize } from '@/server/authz'

const CreateInvoice = z.object({
  orgId: z.uuid(),
  customerId: z.uuid(),
  amountCents: z.number().int().nonnegative().max(10_000_000_00),
  currency: z.enum(['CZK', 'EUR']),
}).strict()

export const createInvoice = action(CreateInvoice, async (i) => {
  const { supabase, user } = await authorize(i.orgId, 'invoice.create')
  const { data, error } = await supabase.rpc('create_invoice', {   // číslování atomicky v DB
    p_org: i.orgId, p_customer: i.customerId, p_amount_cents: i.amountCents, p_currency: i.currency,
  })
  if (error) throw new AppError('INTERNAL')
  return { id: data as string }
})
```

## 4. Bezpečné přesměrování

```ts
export function safeNext(next: string | null | undefined, fallback = '/app') {
  if (!next) return fallback
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  try {
    const u = new URL(next, 'https://placeholder.invalid')
    return u.origin === 'https://placeholder.invalid' ? u.pathname + u.search : fallback
  } catch { return fallback }
}
```

## 5. CSP s nonce + refresh session (middleware.ts / proxy.ts)

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/server/supabase-middleware' // jen refresh cookies, NE autorizace

export async function middleware(request: NextRequest) {   // v Next 16: export function proxy
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const supa = process.env.NEXT_PUBLIC_SUPABASE_URL!            // https://xxx.supabase.co
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,          // pokud knihovna vyžaduje inline styly, zvaž 'unsafe-inline' JEN pro style-src
    `img-src 'self' blob: data: ${supa}`,
    `font-src 'self'`,
    `connect-src 'self' ${supa} ${supa.replace('https://', 'wss://')}`,
    `object-src 'none'`,
    `base-uri 'none'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = await updateSession(request, requestHeaders)
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [{ source: '/((?!_next/static|_next/image|favicon.ico).*)' }],
}
```

Statické hlavičky v `next.config.ts`:
```ts
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
    ],
  }]
},
poweredByHeader: false,
productionBrowserSourceMaps: false,
```

## 6. SSRF-bezpečný fetch (#82)

```ts
// src/server/safe-fetch.ts
import 'server-only'
import dns from 'node:dns/promises'
import ipaddr from 'ipaddr.js'

const ALLOWED_PORTS = new Set(['', '443'])
const MAX_BYTES = 5 * 1024 * 1024

function isPublicIp(ip: string) {
  const addr = ipaddr.process(ip)          // převede IPv4-mapped IPv6
  return addr.range() === 'unicast'        // blokuje private, loopback, linkLocal (169.254 metadata), uniqueLocal, reserved…
}

export async function safeFetch(rawUrl: string, init: RequestInit = {}) {
  const url = new URL(rawUrl)
  if (url.protocol !== 'https:') throw new Error('SSRF_SCHEME')
  if (url.username || url.password) throw new Error('SSRF_CREDENTIALS')
  if (!ALLOWED_PORTS.has(url.port)) throw new Error('SSRF_PORT')
  const addrs = await dns.lookup(url.hostname, { all: true, verbatim: true })
  if (addrs.length === 0 || addrs.some(a => !isPublicIp(a.address))) throw new Error('SSRF_BLOCKED')

  // Pozn.: proti DNS rebindingu je robustnější připojit se přímo na ověřenou IP
  // (undici Agent s vlastním connect.lookup) nebo použít egress proxy s allowlistem.
  const res = await fetch(url, { ...init, redirect: 'manual', signal: AbortSignal.timeout(5000) })
  if (res.status >= 300 && res.status < 400) throw new Error('SSRF_REDIRECT')

  const reader = res.body?.getReader()
  let size = 0; const chunks: Uint8Array[] = []
  while (reader) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_BYTES) { await reader.cancel(); throw new Error('SSRF_TOO_LARGE') }
    chunks.push(value)
  }
  return { status: res.status, headers: res.headers, body: Buffer.concat(chunks) }
}
```
Nejlepší je **allowlist domén** (např. jen `ares.gov.cz`), pokud to use-case dovolí.

## 7. Stripe webhook – podpis, idempotence, ověřený stav

```ts
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { createAdminClient } from '@/server/admin/supabase-admin'

export const runtime = 'nodejs'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)       // restricted key s minimem práv

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return new Response('missing signature', { status: 400 })
  const body = await req.text()                                  // RAW body
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!, 300)
  } catch {
    return new Response('invalid signature', { status: 400 })
  }

  const admin = createAdminClient()
  // Idempotence + zpracování v JEDNÉ DB transakci (RPC), unikátní (provider, event_id):
  const { error } = await admin.rpc('process_stripe_event', {
    p_event_id: event.id,
    p_type: event.type,
    p_payload: event.data.object as unknown as Record<string, unknown>,
  })
  if (error && error.code !== '23505') return new Response('error', { status: 500 }) // Stripe zopakuje
  return new Response('ok')
}
// V RPC: org_id ber z vlastní tabulky checkout_sessions (vytvořené serverem), NE z metadata payloadu bez ověření.
```

## 8. Inventura endpointů (do CI)

```bash
echo "## Server Actions"; grep -rln "^['\"]use server['\"]" src app 2>/dev/null
echo "## Route Handlers"; find app src/app -name 'route.ts' -o -name 'route.js' 2>/dev/null
echo "## Podezřelé debug routy"; find app src/app -path '*api*' \( -iname '*debug*' -o -iname '*test*' -o -iname '*seed*' \) 2>/dev/null
```
