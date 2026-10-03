import { NextResponse, type NextRequest } from "next/server";

/**
 * CSP s per-request nonce a `strict-dynamic` (Next.js 16: `proxy.ts` nahrazuje `middleware.ts`).
 *
 * - `script-src` bez `unsafe-inline` a `unsafe-eval`. Next.js si nonce přečte
 *   z hlavičky a sám ho připojí ke svým skriptům. `unsafe-eval` jen ve vývoji (React debug).
 * - `style-src 'unsafe-inline'` je vědomá výjimka: Motion a `next/image` renderují
 *   `style=""` atributy už na serveru a nonce na atributy nefunguje. Nonce se do
 *   `style-src` záměrně nedává, protože by prohlížeč `unsafe-inline` ignoroval.
 *   Zdůvodnění: `.claude/security/DECISIONS.md`.
 * - Každá změna politiky patří do `.claude/security/CSP-LOG.md`.
 *
 * Kvůli nonce se všechny stránky renderují dynamicky (viz `src/app/layout.tsx`).
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  // Safari jinak přepisuje i http://localhost na https a lokální test `next start` se rozbije.
  const isHttps =
    request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    // Formulář volá Server Action na stejném originu, Resend se volá jen ze serveru.
    isDev ? "connect-src 'self' ws: wss:" : "connect-src 'self'",
    "media-src 'self'",
    "frame-src 'none'",
    "worker-src 'self'",
    "manifest-src 'self'",
    // Jen pro HTTPS požadavky (produkce na Vercelu). Na http://localhost by upgrade rozbil test.
    ...(isHttps && !isDev ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Statické soubory a prefetch requesty CSP nepotřebují.
      source: "/((?!_next/static|_next/image|favicon.ico|icon.svg|\\.well-known).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
