"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Seznam bodů „Na míru“ s počítadlem „01 / 05“ (princip Alteno).
 * Na desktopu je počítadlo v přilepeném levém sloupci a mění se podle bodu,
 * který je právě uprostřed okna (IntersectionObserver, žádný scroll listener).
 */
export interface ShowcaseItem {
  key: string;
  content: React.ReactNode;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CustomShowcase({ intro, items }: { intro?: React.ReactNode; items: ShowcaseItem[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = usePrefersReducedMotion();
  const total = items.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = refs.current.indexOf(entry.target as HTMLLIElement);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    refs.current.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, [total]);

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="hidden lg:col-span-5 lg:block">
        <div className="lg:sticky lg:top-10">
          {intro}
          <div aria-hidden="true" className="mt-12 hidden items-end gap-3 font-mono lg:flex">
            <span className="relative inline-flex h-[3.2rem] w-[2.6ch] overflow-hidden text-[3rem] leading-none text-accent tabular">
              <AnimatePresence mode="popLayout" initial={false}>
                <m.span
                  key={active}
                  className="absolute inset-0"
                  initial={reduce ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  {pad(active + 1)}
                </m.span>
              </AnimatePresence>
            </span>
            <span className="pb-1 text-[1rem] text-ink-muted">/ {pad(total)}</span>
          </div>
          <div aria-hidden="true" className="mt-4 hidden gap-1.5 lg:flex">
            {items.map((item, index) => (
              <span
                key={item.key}
                className={cn(
                  "h-[3px] w-8 transition-colors duration-300",
                  index <= active ? "bg-accent" : "bg-rule",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <ol className="lg:col-span-7">
        {items.map((item, index) => (
          <li
            key={item.key}
            ref={(element) => {
              refs.current[index] = element;
            }}
            className="border-t border-rule py-10 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-10"
          >
            <p className="type-label mb-4">
              <span className="text-accent">{pad(index + 1)}</span> / {pad(total)}
            </p>
            {item.content}
          </li>
        ))}
      </ol>
    </div>
  );
}
