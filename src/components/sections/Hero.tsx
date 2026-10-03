import { CheckIcon, PlayIcon } from "lucide-react";
import { site } from "@/config/site";
import { cs } from "@/content/cs";
import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/layout/Section";
import { ContactLink } from "@/components/layout/ContactLink";
import { MarginFigures, type Figure } from "@/components/motifs/MarginFigures";
import { RichText } from "@/components/motifs/RichText";
import { SampleBadge } from "@/components/motifs/SampleBadge";

/**
 * (01) Úvod. Asymetrický hero: text vlevo, vpravo živý „záznam zpracování“,
 * který přesahuje do další sekce. LCP je nadpis, ne animace.
 */
const FIGURES: Figure[] = [
  { text: "<isdoc:Invoice>", top: 28, side: "left" },
  { text: "IČO 12345678", top: 42, side: "left" },
  { text: "VS 2026045", top: 58, side: "left" },
  { text: "Σ 12 480,00 Kč", top: 76, side: "left" },
  { text: "PDF", kind: "file", top: 86, side: "left" },
  { text: "DIČ", top: 14, side: "right" },
  { text: "ISDOCX", kind: "file", top: 34, side: "right" },
  { text: "DPH 21 %", top: 64, side: "right" },
  { text: "SKEN", kind: "file", top: 80, side: "right" },
];

export function Hero() {
  return (
    <section id="uvod" aria-labelledby="uvod-title" className="relative isolate z-10 bg-paper">
      <div aria-hidden="true" className="ledger ledger-fade absolute inset-0 -z-10" />
      <MarginFigures figures={FIGURES} />

      <div className="wrap lg:grid lg:grid-cols-[var(--margin-col)_minmax(0,1fr)]">
        <div className="ledger-margin hidden pt-16 lg:block">
          <SectionLabel id="uvod" className="pr-6" stacked />
        </div>

        <div className="grid min-w-0 gap-14 pt-12 pb-16 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pt-16 lg:pb-14 lg:pl-12 xl:pl-16">
          <div className="lg:col-span-6 xl:col-span-7">
            {/* Pozice startupu je hlavní sdělení nad nadpisem, proto štítek, ne jen popisek. */}
            <p className="inline-flex items-center gap-2.5 rounded-sm border border-accent/35 bg-accent-soft px-3 py-1.5 font-mono text-[0.8rem] font-semibold tracking-[0.02em] text-accent-strong sm:text-[0.9rem]">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
              {cs.hero.eyebrow}
            </p>
            <h1 id="uvod-title" className="type-display mt-5 max-w-[13ch]">
              <RichText text={cs.hero.title} />
              <span aria-hidden="true" className="caret">
                _
              </span>
            </h1>
            <p className="type-lead mt-8 max-w-[44ch] border-l-2 border-accent pl-5 text-ink">
              {cs.hero.lead} <strong className="mt-1.5 block font-semibold text-accent-strong">{cs.hero.leadPoint}</strong>
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <ContactLink size="lg">{cs.cta}</ContactLink>
              {/* Odkaz na video jen s videem, jinak by sliboval obsah, který neexistuje. */}
              {site.videoSrc ? (
                <a href="#kdo-za-tim-stoji" className="link inline-flex items-center gap-2 font-semibold">
                  <PlayIcon aria-hidden="true" strokeWidth={1.5} className="size-4 text-accent" />
                  {cs.hero.videoLink}
                </a>
              ) : null}
            </div>
          </div>

          {/* Karta se zarovná ke spodní hraně a přesahuje do další sekce. */}
          <div className="relative lg:col-span-6 lg:self-end lg:translate-y-[42%] xl:col-span-5">
            <ProcessingLog />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Záznam zpracování. Celý obsah je v HTML od začátku (SEO, funguje bez JS),
 * řádky se jen postupně odhalí CSS animací (cca 240 ms na řádek) a zastaví se.
 * Při `prefers-reduced-motion` je rovnou celý.
 */
function ProcessingLog() {
  const { log } = cs.hero;
  return (
    <figure className="relative z-10 rounded-sm border border-rule bg-sheet shadow-paper">
      <div className="flex items-center justify-between gap-4 border-b border-rule px-5 py-3.5">
        <span className="type-label text-ink">{log.title}</span>
        <SampleBadge />
      </div>
      <ol className="ledger px-5 py-1 font-mono text-[0.8rem] [--ledger-step:2.75rem] sm:text-[0.84rem]">
        {log.rows.map((row) => {
          const ok = "ok" in row && row.ok;
          const final = "final" in row && row.final;
          return (
            <li
              key={row.label}
              className="log-row grid h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-4"
            >
              <span className="truncate text-ink">{row.label}</span>
              <span
                className={cn(
                  "log-status inline-flex items-center gap-1.5 text-right",
                  ok || final ? "text-accent" : "text-ink-muted",
                  final && "rounded-sm bg-accent-soft px-1.5 py-0.5 font-semibold",
                )}
              >
                {ok ? <CheckIcon aria-hidden="true" strokeWidth={2.25} className="size-3.5" /> : null}
                {row.status}
              </span>
            </li>
          );
        })}
      </ol>
      <figcaption className="border-t border-rule px-5 py-3 text-[0.78rem] leading-snug text-ink-muted">
        {log.caption}
      </figcaption>
    </figure>
  );
}
