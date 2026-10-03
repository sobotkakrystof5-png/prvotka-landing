import Link from "next/link";
import { cs } from "@/content/cs";
import { LogoFull } from "@/components/motifs/LogoMark";

/** Logo Prvotky (znak + nápis) jako odkaz na úvod. Název čte čtečka z `aria-label`. */
export function Logo() {
  return (
    <Link href="/" aria-label={cs.nav.home} className="group inline-flex items-center rounded-sm text-ink">
      <LogoFull
        className="h-8 sm:h-9"
        markClassName="origin-center transition-transform duration-200 [transform-box:fill-box] group-hover:-rotate-3 motion-reduce:transition-none"
      />
    </Link>
  );
}
