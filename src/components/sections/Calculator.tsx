import { ArrowDownIcon } from "lucide-react";
import { cs } from "@/content/cs";
import { Section, SectionTitle } from "@/components/layout/Section";
import { MarginFigures, type Figure } from "@/components/motifs/MarginFigures";
import { ContactLink } from "@/components/layout/ContactLink";
import { CalculatorWidget } from "./CalculatorWidget";

/**
 * (03) Kalkulačka úspor. Hned po problému: návštěvník si spočítá vlastní
 * čísla jako účetní výkaz (dnes, s aplikací, rozdíl). Nadpis, poznámky pod
 * čarou a výzva se renderují na serveru, interaktivní je jen kalkulačka.
 */
const FIGURES: Figure[] = [
  { text: "Σ 12 480,00 Kč", top: 30, side: "left" },
  { text: "PDF", kind: "file", top: 48, side: "left" },
  { text: "MD / DAL", top: 70, side: "left" },
  { text: "ISDOCX", kind: "file", top: 26, side: "right" },
  { text: "Kč/h", top: 62, side: "right" },
];
export function Calculator() {
  const { calculator } = cs;
  return (
    <Section
      id="kalkulacka"
      spacing="pt-20 pb-24 lg:pt-28 lg:pb-32"
      decoration={<MarginFigures figures={FIGURES} />}
    >
      <SectionTitle id="kalkulacka" className="max-w-[20ch]">
        {calculator.title}
      </SectionTitle>
      <p className="type-lead mt-6 max-w-[50ch]">{calculator.lead}</p>

      <div className="mt-12">
        <CalculatorWidget />
      </div>

      <div className="mt-14 grid gap-10 border-t border-rule pt-8 lg:grid-cols-12">
        <ol className="flex flex-col gap-2 text-[0.85rem] leading-relaxed text-ink-muted lg:col-span-8">
          {calculator.footnotes.map((note, index) => (
            <li key={note} className="flex gap-2.5">
              <span className="font-mono text-[0.75rem] text-ink">{index + 1}</span>
              <span className="max-w-[70ch]">{note}</span>
            </li>
          ))}
        </ol>
        <div className="lg:col-span-4 lg:text-right">
          <p className="font-heading text-[1.35rem] leading-snug">{calculator.cta}</p>
          <ContactLink className="mt-4">{cs.cta}</ContactLink>
        </div>
      </div>

      {/* Přechod na řešení */}
      <p className="mt-16 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span className="font-heading text-[clamp(1.4rem,2.2vw,1.85rem)] leading-snug">{calculator.next.question}</span>
        <a href="#jak-to-funguje" className="link inline-flex items-center gap-1.5 text-[1.05rem] font-semibold">
          {calculator.next.link}
          <ArrowDownIcon aria-hidden="true" strokeWidth={1.75} className="size-4 text-accent" />
        </a>
      </p>
    </Section>
  );
}
