import { headers } from "next/headers";
import { buildJsonLd, serializeJsonLd } from "@/lib/jsonLd";
import { About } from "@/components/sections/About";
import { Benefits } from "@/components/sections/Benefits";
import { Calculator } from "@/components/sections/Calculator";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { Contact } from "@/components/sections/Contact";
import { Custom } from "@/components/sections/Custom";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Problem } from "@/components/sections/Problem";

/**
 * Jednostránková landing page (brief, část 5). Pořadí sekcí je závazné
 * (změněné 2026-10-03): problém → čísla návštěvníka → řešení → přínos →
 * na míru → kdo za tím stojí → dotazy → kontakt. Musí odpovídat `ALL_SECTIONS`.
 * Texty sekcí se renderují na serveru (obsah je v initial HTML).
 */
export default async function HomePage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        // Data jen z `site.ts` a `cs.ts`, `<` je escapované. Žádný uživatelský vstup.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildJsonLd()) }}
      />
      <Hero />
      <Problem />
      <Calculator />
      <HowItWorks />
      <Benefits />
      <Custom />
      <CaseStudy />
      <About />
      <Faq />
      <Contact />
    </>
  );
}
