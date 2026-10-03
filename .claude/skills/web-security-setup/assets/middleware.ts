/**
 * middleware.ts — CSP s nonce a strict-dynamic pro Next.js (App Router)
 *
 * Tohle je nejsilnější varianta CSP. Každý request dostane náhodný nonce,
 * který povoluje jen ty skripty, které vygeneroval tvůj server. Injektovaný
 * <script> od útočníka nonce nemá a prohlížeč ho neprovede.
 *
 * Umístění: kořen projektu (vedle app/), nebo src/middleware.ts
 *
 * Použití nonce v komponentě:
 *   import { headers } from 'next/headers';
 *   const nonce = (await headers()).get('x-nonce') ?? undefined;
 *   <script nonce={nonce} ... />
 *
 * 'strict-dynamic' znamená, že skript načtený povoleným skriptem je taky
 * povolený. Díky tomu Next.js chunky fungují, aniž bys musel vypisovat cesty.
 * Prohlížeče, které strict-dynamic znají, ignorují seznam domén a 'self' —
 * to je záměr, ne chyba.
 */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:${
      isDev ? " 'unsafe-eval'" : ''
    }`,
    // Next.js vkládá kritické CSS inline, proto unsafe-inline u stylů.
    // U stylů je to výrazně menší riziko než u skriptů.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    isDev ? "connect-src 'self' ws: wss:" : "connect-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Při zavádění nejdřív použij Report-Only, ať nic nerozbiješ:
  // response.headers.set('Content-Security-Policy-Report-Only', csp);
  response.headers.set('Content-Security-Policy', csp);

  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains'
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set('X-XSS-Protection', '0');

  return response;
}

export const config = {
  matcher: [
    /*
     * Middleware neběží na statických souborech a prefetch requestech,
     * ať zbytečně nespaluješ výkon.
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
