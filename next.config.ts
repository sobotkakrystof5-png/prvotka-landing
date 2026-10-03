import path from "node:path";
import type { NextConfig } from "next";

/**
 * Bezpečnostní hlavičky kromě CSP.
 *
 * CSP s per-request nonce nastavuje `src/proxy.ts`, tady se záměrně
 * neopakuje, jinak by se politiky sčítaly a platila by ta přísnější.
 * Stav a důvody: `.claude/security/STATE.md` a `DECISIONS.md`.
 */
const securityHeaders = [
  // HSTS zatím bez `preload`, doplní se po měsíci bezchybného provozu.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), xr-spatial-tracking=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-XSS-Protection", value: "0" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Kořen je složka projektu, ne nadřazené git repo v domovské složce s cizím package-lock.json.
  turbopack: { root: path.join(__dirname) },
  // Neprozrazovat, že běží Next.js.
  poweredByHeader: false,
  // Zdrojové mapy do produkce nepatří.
  productionBrowserSourceMaps: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  images: {
    // Žádné vzdálené domény. Obrázky (fotka CEO, loga) budou lokální v `public/`.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
