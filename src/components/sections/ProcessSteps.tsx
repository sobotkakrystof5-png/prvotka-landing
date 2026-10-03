"use client";

import { useRef } from "react";
import { cs } from "@/content/cs";
import { RichText } from "@/components/motifs/RichText";
import { useOneShotTimeline } from "@/lib/useOneShotTimeline";
import { cn } from "@/lib/utils";

/**
 * Pás „Jak spolu postupujeme“ v sekci Na míru. Při prvním vstupu do viewportu
 * se kroky odhalí jeden po druhém a šipka mezi nimi se dokreslí k dalšímu kroku.
 * Jeden běh, pak klid. Server a `prefers-reduced-motion` vykreslí všechny kroky.
 */
const START = 0.15; // s, i první krok se odhalí až po vstupu do viewportu
const STEP_GAP = 0.6; // s mezi kroky
const END = START + STEP_GAP * 3 + 0.6;

export function ProcessSteps() {
  const { custom } = cs;
  const ref = useRef<HTMLOListElement>(null);
  const { time, status } = useOneShotTimeline(ref, END, 0.35);
  // Při návratu na začátek po hydrataci bez přechodu, ať kroky nemizí animovaně.
  const animate = status !== "idle";
  const last = custom.steps.length - 1;

  return (
    <ol ref={ref} className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6">
      {custom.steps.map((step, index) => {
        const shown = time >= START + index * STEP_GAP;
        const linked = time >= START + index * STEP_GAP + STEP_GAP * 0.35;
        return (
          <li
            key={step.title}
            className={cn(
              "grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 sm:block",
              animate && "transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none",
              shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
          >
            <div aria-hidden="true" className="flex items-center gap-4 self-start">
              <span className="font-heading text-[3rem] leading-[0.85] text-accent tabular sm:text-[3.5rem] lg:text-[4.25rem]">
                {index + 1}
              </span>
              {index < last ? (
                <span
                  className={cn(
                    "hidden flex-1 origin-left items-center text-ink-muted/50 lg:flex",
                    animate && "transition-[scale,opacity] duration-500 ease-out motion-reduce:transition-none",
                    linked ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
                  )}
                >
                  <span className="h-px flex-1 bg-current" />
                  <svg viewBox="0 0 8 12" className="h-3 w-2 shrink-0">
                    <path d="M1 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              ) : null}
            </div>
            <div>
              <p className="text-[1.2rem] font-semibold leading-tight text-ink sm:mt-4">{step.title}</p>
              <p className="mt-2 max-w-[30ch] leading-snug text-ink-muted">
                <RichText text={step.text} />
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
