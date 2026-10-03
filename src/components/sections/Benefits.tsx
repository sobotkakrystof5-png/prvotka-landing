import { site } from "@/config/site";
import { cs } from "@/content/cs";
import { Section, SectionTitle } from "@/components/layout/Section";
import { LogoFull, MARK } from "@/components/motifs/LogoMark";
import { withPlaceholders } from "@/components/motifs/Placeholder";
import { RichText } from "@/components/motifs/RichText";

/**
 * (05) Co vám to přinese. Porovnání „dnes ručně / s Prvotkou“ jako stránka
 * účetní knihy. Sloupec Prvotky leží na listu papíru s logem v záhlaví,
 * odrážky jsou fajfka z loga. Na mobilu karta na řádek, obě strany najednou.
 * Řádek s cenou jen při `site.showPrice`.
 */
interface Row {
  label: string;
  manual: string;
  app: { title: string; text: string };
}

/** Fajfka ze znaku loga jako odrážka. */
function Tick({ className }: { className?: string }) {
  return (
    <svg viewBox="222 346 274 236" aria-hidden="true" className={className}>
      <path d={MARK.check} fill="none" stroke="currentColor" strokeWidth={46} />
    </svg>
  );
}

function AppValue({ app }: { app: Row["app"] }) {
  return (
    <span className="flex gap-3">
      <Tick className="mt-[0.45em] h-3 w-auto shrink-0 text-accent" />
      <span>
        <span className="block font-semibold leading-snug text-ink">{withPlaceholders(app.title)}</span>
        <span className="mt-1 block text-[0.95rem] leading-relaxed text-ink-muted">
          {withPlaceholders(app.text)}
        </span>
      </span>
    </span>
  );
}

function Index({ value }: { value: number }) {
  return <span className="type-label">{String(value).padStart(2, "0")}</span>;
}

export function Benefits() {
  const { benefits } = cs;
  const rows: Row[] = [...benefits.rows, ...(site.showPrice ? [benefits.costRow] : [])];

  return (
    <Section id="prinos" tone="deep" spacing="pt-20 pb-24 lg:pt-28 lg:pb-28">
      <SectionTitle id="prinos">
        <RichText text={benefits.title} />
      </SectionTitle>
      <p className="type-lead mt-6 max-w-[48ch]">{benefits.lead}</p>

      {/* Desktop: tabulka, sloupec Prvotky na listu papíru */}
      <div className="relative mt-14 hidden md:block">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-[46%] rounded-[var(--radius)] border-t-2 border-accent bg-sheet shadow-paper"
        />
        <table className="relative w-full table-fixed border-collapse text-left">
          <caption className="visually-hidden">
            {benefits.columns.manual} a {benefits.columns.app}
          </caption>
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[32%]" />
            <col className="w-[46%]" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="type-label pb-5 pr-6 align-bottom font-normal">
                {benefits.columns.label}
              </th>
              <th
                scope="col"
                className="pb-5 pr-8 align-bottom font-heading text-[1.35rem] font-normal text-ink-muted"
              >
                {benefits.columns.manual}
              </th>
              <th scope="col" className="px-7 pb-5 pt-7 align-bottom font-normal lg:px-9">
                <LogoFull className="h-8 text-ink" />
                <span className="sr-only">{benefits.columns.app}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.label} className="border-t border-rule">
                <th scope="row" className="py-6 pr-6 align-top font-normal">
                  <Index value={index + 1} />
                  <span className="mt-1 block font-heading text-[1.3rem] leading-tight text-ink">
                    {row.label}
                  </span>
                </th>
                <td className="py-6 pr-8 align-top leading-relaxed text-ink-muted">
                  {withPlaceholders(row.manual)}
                </td>
                <td className="px-7 py-6 align-top lg:px-9">
                  <AppValue app={row.app} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil: karta na řádek, „dnes“ i Prvotka vidět najednou */}
      <div className="mt-10 md:hidden">
        <p className="border-b-2 border-ink/80 pb-3 text-ink">
          <LogoFull className="h-7" />
          <span className="sr-only">{benefits.columns.app}</span>
        </p>
        <ol>
          {rows.map((row, index) => (
            <li key={row.label} className="border-b border-rule py-5">
              <p className="flex items-baseline gap-2.5">
                <Index value={index + 1} />
                <span className="font-heading text-[1.25rem] leading-tight">{row.label}</span>
              </p>
              <div className="mt-3 rounded-[var(--radius)] border-t-2 border-accent bg-sheet p-4 shadow-paper">
                <AppValue app={row.app} />
              </div>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-muted">
                <span className="type-label mr-2">{benefits.manualShort}</span>
                {withPlaceholders(row.manual)}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-8 max-w-[62ch] text-[0.9rem] text-ink-muted">
        {benefits.footnote.before}
        <a href="#kalkulacka" className="text-ink underline hover:text-accent">
          {benefits.footnote.link}
        </a>
        {benefits.footnote.after}
      </p>
    </Section>
  );
}
