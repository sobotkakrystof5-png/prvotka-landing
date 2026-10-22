import Link from "next/link";
import { cs } from "@/content/cs";
import { buttonVariants } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/**
 * Vlastní 404: řádek účetní knihy, kterému chybí záznam.
 * Globální 404 se renderuje jen v kořenovém layoutu, proto si navbar a patičku vkládá sama.
 */
export default function NotFound() {
  const { notFound } = cs;
  return (
    <>
      <SiteHeader />
      <main id="obsah" tabIndex={-1} className="flex-1">
        <section aria-labelledby="not-found-title" className="ledger relative bg-paper [--ledger-step:2.5rem]">
          <div className="wrap flex min-h-[60dvh] flex-col justify-center py-24">
            <p className="font-mono text-[clamp(4rem,12vw,8rem)] leading-none text-rule tabular">{notFound.code}</p>
            <h1 id="not-found-title" className="type-h2 mt-6 max-w-[18ch]">
              {notFound.title}
            </h1>
            <p className="mt-5 max-w-[48ch] text-ink-muted">{notFound.text}</p>
            <Link href="/" className={buttonVariants({ className: "mt-10 self-start" })}>
              {notFound.back}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
