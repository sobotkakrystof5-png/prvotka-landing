import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { connection } from "next/server";
import { site, siteUrl } from "@/config/site";
import { cs } from "@/content/cs";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

/*
 * Písma přes next/font: self-hosting, žádný požadavek na Google za běhu,
 * jednodušší CSP. Všechna s `latin-ext` kvůli ř, ů, ě.
 * Nadpisy: Newsreader (serif s optickými velikostmi). Fraunces a Instrument
 * Serif z briefu jsou podle design-taste-frontend příliš časté „AI“ volby,
 * proto návrh jiného serifu. Schválení ve Fázi 2 na /styleguide.
 *
 * Všechna tři písma jsou lokální variabilní soubory jen s potřebnými vahami
 * a znaky (latin + čeština, typografické uvozovky): 130 kB místo 311 kB
 * z next/font/google. Zdroj a licence: src/assets/fonts/FONTS.md.
 */
const newsreader = localFont({
  src: "../assets/fonts/Newsreader-opsz-400.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

// Text a LCP odstavec, proto se přednačítá.
const manrope = localFont({
  src: "../assets/fonts/Manrope-400-700.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-manrope",
  display: "swap",
  adjustFontFallback: "Arial",
});

// Jen drobné štítky a čísla, nepřednačítá se.
const jetbrains = localFont({
  src: "../assets/fonts/JetBrainsMono-400-600.woff2",
  weight: "400 600",
  style: "normal",
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: cs.meta.title,
    template: `%s | ${site.name}`,
  },
  description: cs.meta.description,
  applicationName: site.name,
  authors: [{ name: site.ceo }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "/",
    siteName: site.name,
    title: cs.meta.title,
    description: cs.meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: cs.meta.title,
    description: cs.meta.description,
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e8",
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Nonce v CSP vyžaduje dynamický render každé stránky (viz src/proxy.ts).
  await connection();

  return (
    <html
      lang="cs"
      data-scroll-behavior="smooth"
      className={`${newsreader.variable} ${manrope.variable} ${jetbrains.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#obsah"
          className="fixed top-3 left-3 z-50 -translate-y-24 rounded-sm bg-ink px-4 py-2.5 font-semibold text-sheet transition-transform focus-visible:translate-y-0"
        >
          {cs.skipLink}
        </a>
        <MotionProvider>
          <SiteHeader />
          <main id="obsah" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  );
}
