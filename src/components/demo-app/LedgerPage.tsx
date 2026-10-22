import { cn } from "@/lib/utils";

/**
 * Plocha účetní knihy pro obrazovky dema: linkování a od 1024 px okrajový sloupec
 * s dvojitou linkou a mono popiskem, stejně jako `Section` na webu.
 */
export function LedgerPage({
  margin,
  marginName,
  titleId,
  className,
  children,
}: {
  margin: string;
  marginName: string;
  titleId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={titleId} className={cn("ledger relative flex-1 bg-paper", className)}>
      <div className="wrap h-full lg:grid lg:grid-cols-[var(--margin-col)_minmax(0,1fr)]">
        <div className="ledger-margin hidden py-16 lg:block">
          <p className="type-label pr-6">
            <span className="text-ink">{margin}</span>
            <br />
            {marginName}
          </p>
        </div>
        <div className="min-w-0 py-12 lg:py-16 lg:pl-12 xl:pl-16">
          <p className="type-label mb-5 lg:hidden">
            <span className="text-ink">{margin}</span> {marginName}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}
