"use client";

import { AnimatePresence, m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Razítko kontroly („Součty sedí“, „DPH ověřeno“). Na celé stránce max 3×.
 * Otisk: krátké „dosednutí“ ze zvětšení, při omezených animacích rovnou výsledek.
 */
export function Stamp({
  show = true,
  tone = "ok",
  children,
  className,
}: {
  show?: boolean;
  tone?: "ok" | "warn";
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const Icon = tone === "ok" ? CheckIcon : TriangleAlertIcon;

  return (
    <AnimatePresence initial={false}>
      {show ? (
        <m.span
          className={cn(
            "inline-flex -rotate-[4deg] items-center gap-1.5 rounded-sm border-[1.5px] px-2 py-1 font-mono text-[0.7rem] font-semibold tracking-[0.06em] uppercase",
            "shadow-[inset_0_0_0_2px_var(--sheet),inset_0_0_0_3px_currentColor]",
            tone === "ok"
              ? "border-accent bg-accent-soft/70 text-accent"
              : "border-warn bg-warn-soft text-warn-ink",
            className,
          )}
          initial={reduce ? false : { opacity: 0, scale: 1.35, rotate: -9 }}
          animate={{ opacity: 1, scale: 1, rotate: -4 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 26, mass: 0.7 }}
        >
          <Icon aria-hidden="true" strokeWidth={2.25} className="size-3.5" />
          {children}
        </m.span>
      ) : null}
    </AnimatePresence>
  );
}
