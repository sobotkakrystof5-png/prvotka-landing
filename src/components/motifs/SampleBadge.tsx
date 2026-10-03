import { cs } from "@/content/cs";
import { cn } from "@/lib/utils";

/** Štítek „Ukázka“: ukázková data v demu, grafech a záznamu jsou vždy označená. */
export function SampleBadge({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-rule bg-paper px-1.5 py-0.5 font-mono text-[0.7rem] leading-none text-ink-muted",
        className,
      )}
    >
      {children ?? cs.sample}
    </span>
  );
}
