import { cs } from "@/content/cs";
import { sectionNumber, type SectionId } from "@/lib/sections";
import { cn } from "@/lib/utils";

/**
 * Rámec sekce. Od 1024 px má každá sekce vlevo „okraj účetní knihy“
 * s dvojitou linkou a číslem sekce „(02)“ jako číslem řádku. Linky
 * jednotlivých sekcí na sebe navazují, takže okraj běží celou stránkou.
 * Kompozici obsahu si každá sekce určuje sama, rytmus (`spacing`) taky.
 */

type Tone = "paper" | "deep";

export function Section({
  id,
  tone = "paper",
  spacing = "py-20 lg:py-28",
  className,
  contentClassName,
  children,
  decoration,
}: {
  id: SectionId;
  tone?: Tone;
  /** Svislé odsazení, společné pro okraj i obsah. Sekce dýchají různě. */
  spacing?: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  /** Dekorace v pozadí sekce (linkování, čísla v okraji). */
  decoration?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("relative isolate", tone === "deep" ? "bg-paper-deep" : "bg-paper", className)}
    >
      {decoration}
      <div className="wrap lg:grid lg:grid-cols-[var(--margin-col)_minmax(0,1fr)]">
        <div className={cn("ledger-margin hidden lg:block", spacing)}>
          <SectionLabel id={id} className="pr-6" stacked />
        </div>
        <div className={cn("min-w-0 lg:pl-12 xl:pl-16", spacing, contentClassName)}>
          <SectionLabel id={id} className="mb-5 lg:hidden" />
          {children}
        </div>
      </div>
    </section>
  );
}

export function SectionLabel({
  id,
  className,
  stacked = false,
}: {
  id: SectionId;
  className?: string;
  stacked?: boolean;
}) {
  return (
    <p className={cn("type-label", className)}>
      <span className="text-ink">{sectionNumber(id)}</span>
      {stacked ? <br /> : " "}
      {cs.sectionNames[id]}
    </p>
  );
}

/** Nadpis sekce. Fokusovatelný programově, aby mobilní menu mohlo přesunout fokus. */
export function SectionTitle({
  id,
  children,
  className,
}: {
  id: SectionId;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 id={`${id}-title`} tabIndex={-1} className={cn("type-h2 max-w-[22ch]", className)}>
      {children}
    </h2>
  );
}
