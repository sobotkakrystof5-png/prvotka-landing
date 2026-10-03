import { cn } from "@/lib/utils";

/**
 * Vlastní SVG ikony dokumentů (brief, část 3): stejná tloušťka linky 1.5 jako
 * `lucide-react`, barva přes `currentColor`. Znak produktu je v `LogoMark.tsx`.
 */

interface IconProps {
  className?: string;
}

/** Dokument s přeloženým rohem a štítkem formátu. */
function DocShape({ label, className, children }: IconProps & { label: string; children?: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 40 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-10", className)}
    >
      <path d="M8 3.75h17.5L34 12.25V43a1.25 1.25 0 0 1-1.25 1.25H8A1.25 1.25 0 0 1 6.75 43V5A1.25 1.25 0 0 1 8 3.75Z" />
      <path d="M25.5 3.75v7.25a1.25 1.25 0 0 0 1.25 1.25H34" />
      {children}
      <rect x="2.75" y="26" width={label.length > 3 ? 30 : 22} height="11" rx="1" fill="var(--sheet)" />
      <text
        x={label.length > 3 ? 17.75 : 13.75}
        y="34"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="7.2"
        fontWeight="600"
        letterSpacing="0.2"
      >
        {label}
      </text>
    </svg>
  );
}

export function PdfIcon({ className }: IconProps) {
  return (
    <DocShape label="PDF" className={className}>
      <path d="M12 12.5h8M12 17h14M12 21h11" opacity="0.55" />
    </DocShape>
  );
}

/** Obecný soubor se štítkem formátu (sken, fotka, ISDOC příloha). */
export function FileIcon({ label, className }: IconProps & { label: string }) {
  return (
    <DocShape label={label} className={className}>
      <path d="M12 12.5h8M12 17h14" opacity="0.55" />
    </DocShape>
  );
}

/** ISDOCX: uvnitř strukturované řádky jako `<isdoc:Invoice>`. */
export function IsdocxIcon({ className }: IconProps) {
  return (
    <DocShape label="ISDOCX" className={className}>
      <path d="M11 12.5l-2 2 2 2M15 12.5h7M17 17h9M17 21h6" opacity="0.6" />
    </DocShape>
  );
}
