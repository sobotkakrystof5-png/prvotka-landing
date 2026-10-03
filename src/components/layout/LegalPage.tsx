import Link from "next/link";
import { cs } from "@/content/cs";
import { withPlaceholders } from "@/components/motifs/Placeholder";

/**
 * Právní stránka jako placeholder. Právní texty se negenerují (brief, část 11).
 * Text ochrany osobních údajů je blokér Fáze 9: bez něj se web s živým
 * formulářem nenasazuje.
 */
export function LegalPage({ title }: { title: string }) {
  return (
    <article className="bg-paper">
      <div className="wrap py-20 lg:py-28">
        <div className="max-w-[62ch]">
          <h1 className="type-h2">{title}</h1>
          <p className="placeholder-text mt-8 inline-block px-3 py-2 text-[0.95rem]">{cs.legal.placeholder}</p>
          <p className="mt-8 text-ink-muted">{withPlaceholders(cs.legal.operator)}</p>
          <Link href="/" className="link mt-12 inline-block font-semibold">
            {cs.legal.back}
          </Link>
        </div>
      </div>
    </article>
  );
}
