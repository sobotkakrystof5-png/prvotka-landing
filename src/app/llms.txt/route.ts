import { site, siteUrl } from "@/config/site";
import { cs } from "@/content/cs";

/**
 * Popis webu pro AI asistenty (llms.txt). Text pochází jen ze `site.ts` a `cs.ts`,
 * nic se tu nevymýšlí: cena, slib o datech ani tým se neuvádí.
 */
export const dynamic = "force-static";

export function GET() {
  const url = siteUrl();
  const body = `# ${site.name}

> ${cs.meta.description}

${site.name} je aplikace na míru pro účetní kanceláře v České republice. Převádí faktury z PDF, skenů a fotek do formátu ISDOC/ISDOCX. Import do účetního programu provádí po kontrole účetní, aplikace nic nezaúčtuje.

Podporované účetní programy: ${site.accountingPrograms.join(", ")}.

Provozovatel: ${site.ceo}, IČO ${site.ico}, OSVČ, neplátce DPH. Značky za produktem: ${site.brands.map((brand) => brand.name).join(", ")}.

## Kontakt

- E-mail: ${site.email}
- Telefon: ${site.phone}
- Domluvit hovor: kontaktní formulář na ${url}/#kontakt

## Stránky

- [Úvodní stránka](${url}/): popis produktu, kalkulačka úspory, ukázka zpracování faktury, časté dotazy a kontaktní formulář
- [Ochrana osobních údajů](${url}/ochrana-osobnich-udaju)
- [Obchodní podmínky](${url}/obchodni-podminky)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
