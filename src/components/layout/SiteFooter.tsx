import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cs } from "@/content/cs";
import { NAV_SECTIONS } from "@/lib/sections";
import { withPlaceholders } from "@/components/motifs/Placeholder";
import { Logo } from "./Logo";

const FOOTER_LOGO_SCALE = 0.7;

/**
 * Patička: název, věta o produktu, odkazy na sekce, značky, právní stránky
 * a údaje o podnikateli. Smluvní stranou je OSVČ (brief, část 6.11).
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-[3px] border-double border-rule bg-paper-deep">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1fr] lg:py-20">
        <div className="max-w-[34ch]">
          <Logo />
          <p className="mt-5 text-[0.95rem] text-ink-muted">{cs.footer.tagline}</p>
        </div>

        <FooterList title={cs.footer.sectionsTitle}>
          {NAV_SECTIONS.map((id) => (
            <li key={id}>
              <Link href={`/#${id}`} className="link text-[0.95rem]">
                {cs.nav.links[id]}
              </Link>
            </li>
          ))}
        </FooterList>

        <FooterList title={cs.footer.brandsTitle}>
          {site.brands.map((brand) => {
            // V patičce menší než v pásu značek, poměr stran zůstává.
            const logo = (
              <Image
                src={brand.logo.src}
                alt={brand.name}
                width={Math.round(brand.logo.width * FOOTER_LOGO_SCALE)}
                height={Math.round(brand.logo.height * FOOTER_LOGO_SCALE)}
                unoptimized
                className="block"
              />
            );
            return (
              <li key={brand.name}>
                {brand.url ? (
                  <a
                    href={brand.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {logo}
                  </a>
                ) : (
                  <span className="inline-block">{logo}</span>
                )}
              </li>
            );
          })}
        </FooterList>

        <FooterList title={cs.footer.legalTitle}>
          <li>
            <Link href="/ochrana-osobnich-udaju" className="link text-[0.95rem]">
              {cs.footer.privacy}
            </Link>
          </li>
          <li>
            <Link href="/obchodni-podminky" className="link text-[0.95rem]">
              {cs.footer.terms}
            </Link>
          </li>
        </FooterList>
      </div>

      <div className="border-t border-rule">
        <p className="wrap flex flex-wrap gap-x-5 gap-y-1 py-6 font-mono text-[0.78rem] text-ink-muted">
          <span>{site.ceo}</span>
          <span>{withPlaceholders(site.address)}</span>
          <span>
            {cs.footer.icoPrefix} {withPlaceholders(site.ico)}
          </span>
          <span>{cs.footer.vat}</span>
          <span className="tabular">© {year}</span>
        </p>
      </div>
    </footer>
  );
}

function FooterList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="type-label mb-4">{title}</h2>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}
