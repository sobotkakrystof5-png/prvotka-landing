import { Fragment } from "react";
import Link from "next/link";
import { site } from "@/config/site";
import { cs } from "@/content/cs";
import { withPlaceholders } from "@/components/motifs/Placeholder";

/** Blok právního textu: řetězec = odstavec, pole = odrážkový seznam. */
type LegalBlock = string | readonly string[];

export interface LegalContent {
  updated: string;
  basis: string;
  intro: string;
  sections: readonly { heading: string; blocks: readonly LegalBlock[] }[];
}

/** Adresy v textu, které se vykreslí jako odkaz. */
const LINKS: Record<string, string> = {
  [site.email]: `mailto:${site.email}`,
  "www.uoou.cz": "https://www.uoou.cz",
};
const LINK_SPLIT = new RegExp(
  `(${Object.keys(LINKS)
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "g",
);

function withLinks(text: string): React.ReactNode {
  return text.split(LINK_SPLIT).map((part, index) => {
    const href = LINKS[part];
    if (!href) return <Fragment key={index}>{withPlaceholders(part)}</Fragment>;
    const external = href.startsWith("http");
    return (
      <a
        key={index}
        href={href}
        className="link"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {part}
      </a>
    );
  });
}

/**
 * Právní stránka. Bez `content` je to placeholder: právní texty se negenerují
 * (brief, část 11), dodává je zadavatel. Číslované oddíly sedí na linkách jako
 * řádky účetní knihy, číslo je v levém okraji.
 */
export function LegalPage({ title, content }: { title: string; content?: LegalContent }) {
  return (
    <article className="bg-paper">
      <div className="wrap py-20 lg:py-28">
        <div className="max-w-[70ch]">
          {content ? <p className="type-label mb-3">{withPlaceholders(content.updated)}</p> : null}
          <h1 className="type-h2">{title}</h1>

          {content ? (
            <>
              <p className="type-lead mt-6">{withLinks(content.intro)}</p>
              <p className="mt-4 text-[0.92rem] text-ink-muted">{content.basis}</p>

              <ol className="mt-14 border-b border-rule">
                {content.sections.map((section, index) => (
                  <li
                    key={section.heading}
                    className="grid gap-x-6 gap-y-3 border-t border-rule py-8 sm:grid-cols-[3.25rem_1fr]"
                  >
                    <span aria-hidden="true" className="type-label pt-1.5 text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="type-h3">{section.heading}</h2>
                      <div className="mt-4 flex flex-col gap-4">
                        {section.blocks.map((block, blockIndex) =>
                          typeof block === "string" ? (
                            <p key={blockIndex}>{withLinks(block)}</p>
                          ) : (
                            <ul key={blockIndex} className="flex list-disc flex-col gap-2 pl-5 marker:text-accent">
                              {block.map((item) => (
                                <li key={item}>{withLinks(item)}</li>
                              ))}
                            </ul>
                          ),
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <p className="placeholder-text mt-8 inline-block px-3 py-2 text-[0.95rem]">{cs.legal.placeholder}</p>
              <p className="mt-8 text-ink-muted">{withPlaceholders(cs.legal.operator)}</p>
            </>
          )}

          <Link href="/" className="link mt-12 inline-block font-semibold">
            {cs.legal.back}
          </Link>
        </div>
      </div>
    </article>
  );
}
