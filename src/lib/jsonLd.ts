import { site, siteUrl } from "@/config/site";
import { cs } from "@/content/cs";

/**
 * Strukturovaná data (brief, část 10): poskytovatel služby, produkt a FAQ
 * jen s publikovanými otázkami. Cena jen při `site.showPrice`.
 * Data pochází jen z `site.ts` a `cs.ts`, nikdy z uživatelského vstupu.
 */
export function buildJsonLd() {
  const url = siteUrl();
  const provider = {
    "@type": "ProfessionalService",
    "@id": `${url}/#provider`,
    name: site.name,
    url,
    founder: { "@type": "Person", name: site.ceo, jobTitle: "CEO" },
    areaServed: { "@type": "Country", name: "Česká republika" },
    knowsLanguage: "cs",
  };

  const product = {
    "@type": "SoftwareApplication",
    "@id": `${url}/#product`,
    name: site.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "cs",
    description: cs.meta.description,
    provider: { "@id": `${url}/#provider` },
    ...(site.showPrice
      ? {
          offers: {
            "@type": "Offer",
            price: site.price,
            priceCurrency: "CZK",
            description: "Jednorázová cena, poskytovatel není plátce DPH.",
          },
        }
      : {}),
  };

  const published = cs.faq.items.filter((item) => item.published);
  const faq =
    published.length > 0
      ? {
          "@type": "FAQPage",
          "@id": `${url}/#faq`,
          mainEntity: published.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null;

  return {
    "@context": "https://schema.org",
    "@graph": [provider, product, ...(faq ? [faq] : [])],
  };
}

/** Bezpečná serializace pro `<script type="application/ld+json">`. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
