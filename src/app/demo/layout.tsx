import type { Metadata } from "next";
import Link from "next/link";
import { demoCs } from "@/content/demo";
import { LogoFull } from "@/components/motifs/LogoMark";

export const metadata: Metadata = {
  title: demoCs.meta.title,
  description: demoCs.meta.description,
  // Demo je pracovní nástroj za bránou, ne obsah pro vyhledávače.
  robots: { index: false, follow: false },
};

/** Layout dema: bez navigace marketingového webu, jen logo a štítek „Demo“. */
export default function DemoLayout({ children }: LayoutProps<"/demo">) {
  return (
    <>
      <header className="relative z-20 border-b border-rule bg-paper">
        <div className="wrap flex h-14 items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label={demoCs.header.home} className="inline-flex rounded-sm text-ink">
              <LogoFull className="h-7" />
            </Link>
            <span className="type-label rounded-sm border border-rule bg-sheet px-2 py-0.5 text-ink">
              {demoCs.header.badge}
            </span>
          </div>
        </div>
      </header>
      <main id="obsah" tabIndex={-1} className="flex flex-1 flex-col">
        {children}
      </main>
    </>
  );
}
