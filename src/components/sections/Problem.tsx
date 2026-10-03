import { ArrowDownIcon } from "lucide-react";
import { site } from "@/config/site";
import { cs } from "@/content/cs";
import { Section, SectionTitle } from "@/components/layout/Section";
import { MarginFigures, type Figure } from "@/components/motifs/MarginFigures";
import { RichText } from "@/components/motifs/RichText";
import { AppWindow } from "./AppWindow";
import { ManualRetype } from "./ManualRetype";

/**
 * (02) Proč to řešit. Jeden příběh ve čtyřech krocích: jak jsme na problém
 * přišli (rozjezd Alteno), co se v kancelářích děje dnes (živý ruční přepis
 * s překlepem), proto vznikla aplikace a jak vypadá (okno aplikace).
 * Záměrně bez čísel: hodiny a koruny si návštěvník spočítá v další sekci.
 */
const FIGURES: Figure[] = [
  { text: "DIČ CZ12345678", top: 22, side: "left" },
  { text: "ISDOCX", kind: "file", top: 34, side: "left" },
  { text: "<ID>2026045</ID>", top: 52, side: "left" },
  { text: "DPH 21 %", top: 68, side: "left" },
  { text: "PDF", kind: "file", top: 82, side: "left" },
  { text: "IČO", top: 12, side: "right" },
  { text: "PDF", kind: "file", top: 30, side: "right" },
  { text: "VS", top: 58, side: "right" },
  { text: "ISDOCX", kind: "file", top: 74, side: "right" },
];

export function Problem() {
  const { proc } = cs;
  return (
    <Section
      id="proc"
      tone="deep"
      spacing="pt-20 pb-24 lg:pt-32 lg:pb-32"
      decoration={<MarginFigures figures={FIGURES} />}
    >
      {/* 1. Jak jsme na to přišli */}
      <figure className="relative max-w-[52rem] border-l-[3px] border-accent pl-6 sm:pl-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-11 left-5 select-none font-heading text-[5.5rem] leading-none text-accent sm:-top-14 sm:left-9 sm:text-[7rem]"
        >
          „
        </span>
        <blockquote className="pt-8 font-heading text-[clamp(1.6rem,3.1vw,2.6rem)] leading-[1.22] tracking-[-0.015em] text-ink sm:pt-10">
          {proc.story}
        </blockquote>
        <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[1.05rem] font-semibold text-ink">{site.ceo}</span>
          <span className="type-label">CEO</span>
        </figcaption>
      </figure>

      {/* 2. Co se děje dnes */}
      <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SectionTitle
            id="proc"
            className="max-w-[14ch] text-[clamp(2.25rem,4.2vw,3.6rem)] leading-[1.04]"
          >
            <RichText text={proc.title} />
          </SectionTitle>

          <ol className="mt-10 border-t border-rule">
            {proc.items.map((item, index) => (
              <li
                key={item}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-rule py-5"
              >
                <span className="pt-1.5 font-mono text-[0.85rem] text-accent tabular">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-heading text-[clamp(1.3rem,1.9vw,1.6rem)] leading-snug">{item}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-7 lg:pt-4">
          <ManualRetype />
        </div>
      </div>

      {/* 3. Obrat: proto vznikla aplikace */}
      <div className="mt-24 border-t-[3px] border-double border-rule pt-14 lg:mt-32 lg:pt-20">
        <h3 className="max-w-[20ch] font-heading text-[clamp(2.1rem,4vw,3.4rem)] leading-[1.06] tracking-[-0.022em]">
          <RichText text={proc.turn.title} />
        </h3>
        <p className="type-lead mt-6 max-w-[58ch] text-ink">{proc.turn.text}</p>
      </div>

      {/* 4. Takhle vypadá */}
      <div className="mt-14">
        <AppWindow />
      </div>

      {/* Přechod na kalkulačku */}
      <p className="mt-16 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span className="font-heading text-[clamp(1.4rem,2.2vw,1.85rem)] leading-snug">{proc.next.question}</span>
        <a href="#kalkulacka" className="link inline-flex items-center gap-1.5 text-[1.05rem] font-semibold">
          {proc.next.link}
          <ArrowDownIcon aria-hidden="true" strokeWidth={1.75} className="size-4 text-accent" />
        </a>
      </p>
    </Section>
  );
}
