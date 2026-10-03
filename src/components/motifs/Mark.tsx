"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Zvýraznění klíčového slova: podtržení v `accent-soft`, které se jednou
 * dotáhne zleva doprava při vstupu do viewportu. Max 1–2 slova na sekci.
 * Bez knihovny animací (IntersectionObserver + CSS přechod), aby hero
 * nepotřeboval Motion. `prefers-reduced-motion` řeší CSS (`.mark-bar`).
 */
export function Mark({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.8 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="relative inline-block whitespace-nowrap">
      <span aria-hidden="true" data-in={inView} className="mark-bar" />
      <span className="relative">{children}</span>
    </span>
  );
}
