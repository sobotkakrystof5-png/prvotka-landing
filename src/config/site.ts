/**
 * Všechna proměnlivá data webu na jednom místě.
 *
 * Pravidla:
 * - Hodnota v hranatých závorkách `[TAKHLE]` je viditelný placeholder, ne fakt.
 *   Na stránce se zobrazí přes komponentu `<Placeholder>`, aby byl vidět.
 * - `null` znamená „nerozhodnuto“ a chová se jako `false`: obsah, který na
 *   hodnotě závisí, se nevykreslí (renderuje se podmíněně, ne skrytím přes CSS).
 * - Přepínače zapíná jen zadavatel (AGENTS.md, část 12).
 */

export interface CaseStudy {
  client: string;
  before: string;
  after: string;
  result: string;
  quote?: { text: string; author: string; role: string };
}

export interface Brand {
  name: string;
  description: string;
  url: string | null;
  /**
   * Logo v `public/brands/`, převzaté z webu značky a přebarvené pro světlý
   * podklad. `width` a `height` jsou rozměry v pásu značek v px, poměr stran
   * odpovídá `viewBox`, výška vyrovnává optickou velikost písma mezi logy.
   */
  logo: { src: string; width: number; height: number };
}

export interface SiteConfig {
  name: string;
  domain: string;
  ceo: string;
  email: string;
  phone: string;
  ico: string;
  /** Blok s cenou. Vždy s „nejsem plátce DPH“, nikdy „včetně DPH“. */
  showPrice: boolean;
  /** Jednorázová cena v Kč (zadavatel je neplátce DPH). */
  price: number;
  /** Měsíční správa v Kč. `null` = [VÝŠE SPRÁVY]. */
  monthlyFee: number | null;
  /** Slib „faktury neopustí vaši firmu“ jen při `true`. */
  dataStaysOnPremise: boolean | null;
  /** Text „tým zkušených programátorů“ jen při `true`. */
  hasTeam: boolean | null;
  /** Případová studie TEPO až po změření a souhlasu klienta. */
  caseStudy: CaseStudy | null;
  /** 2minutové video. Dokud je `null`, odkaz v heru se nevykresluje. */
  videoSrc: string | null;
  /** Ověřené účetní programy, do kterých funguje import. */
  accountingPrograms: readonly string[];
  /** „Co můžete čekat“ v kontaktu. Neověřené body (`null`) se nezobrazí. */
  responseTime: string | null;
  introCallLength: string | null;
  brands: readonly Brand[];
}

export const site: SiteConfig = {
  name: "Prvotka",
  domain: "[DOMÉNA]",
  ceo: "Kryštof Sobotka",
  email: "krystof@prvotka.cz",
  phone: "+420 604 837 333",
  ico: "29977231",
  showPrice: false,
  price: 35000,
  monthlyFee: null, // [VÝŠE SPRÁVY]
  dataStaysOnPremise: null, // [ROZHODNOUT: lokálně, nebo cloudové AI API]
  hasTeam: null, // [OVĚŘIT]
  caseStudy: null, // [TEPO – AŽ PO SOUHLASU]
  videoSrc: null, // [VIDEO ZATÍM NENATOČENO]
  accountingPrograms: ["POHODA"], // [DOPLNIT PO OVĚŘENÍ]
  responseTime: null, // [DOBA ODPOVĚDI]
  introCallLength: null, // [DÉLKA ÚVODNÍHO HOVORU]
  brands: [
    {
      name: "Alteno",
      description: "automatizace firemních procesů",
      url: "https://alteno.cz",
      logo: { src: "/brands/alteno.svg", width: 179, height: 24 },
    },
    {
      name: "Vizeon",
      description: "weby a aplikace na míru",
      url: "https://vizeon.cz",
      logo: { src: "/brands/vizeon.svg", width: 151, height: 26 },
    },
    {
      name: "ZakazIQ",
      description: "klientský rezervační systém",
      url: "https://www.zakaziq.cz",
      logo: { src: "/brands/zakaziq.svg", width: 176, height: 40 },
    },
  ],
};

/** Je hodnota zatím jen placeholder ve tvaru `[NĚCO]`? */
export function isPlaceholder(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith("[") && value.endsWith("]");
}

/**
 * Absolutní URL webu pro metadata, sitemap a JSON-LD.
 * Dokud doména není známá, používá se lokální adresa, aby šel build sestavit.
 */
export function siteUrl(): string {
  return isPlaceholder(site.domain) ? "http://localhost:3000" : `https://${site.domain}`;
}
