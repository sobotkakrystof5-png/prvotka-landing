"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export type TimelineStatus = "idle" | "running" | "done";

const noopSubscribe = () => () => {};

/**
 * Jeden běh animace při prvním vstupu prvku do viewportu, pak klid
 * (brief, část 7: žádné nekonečné smyčky). Vrací čas v sekundách, ze kterého
 * si komponenta stav spočítá sama, a funkci pro „Přehrát znovu“.
 *
 * Server a hydratace vykreslí koncový stav (obsah je v HTML i bez JavaScriptu).
 * Teprve po hydrataci se ukázka vrátí na začátek a čeká na viewport.
 * Při `prefers-reduced-motion` zůstává koncový stav.
 */
export function useOneShotTimeline(
  ref: React.RefObject<HTMLElement | null>,
  end: number,
  threshold = 0.4,
) {
  const reduce = usePrefersReducedMotion();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [run, setRun] = useState<{ time: number; status: TimelineStatus }>({ time: 0, status: "idle" });
  const frame = useRef<number | null>(null);
  const started = useRef(false);

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  const play = useCallback(() => {
    stop();
    const startAt = performance.now();
    setRun({ time: 0, status: "running" });
    const tick = (now: number) => {
      const elapsed = (now - startAt) / 1000;
      if (elapsed >= end) {
        frame.current = null;
        setRun({ time: end, status: "done" });
        return;
      }
      setRun({ time: elapsed, status: "running" });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [end, stop]);

  useEffect(() => {
    const element = ref.current;
    if (reduce) {
      stop();
      return;
    }
    if (started.current || !element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        started.current = true;
        observer.disconnect();
        play();
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduce, play, stop, ref, threshold]);

  useEffect(() => stop, [stop]);

  const final = reduce || !hydrated;
  return {
    time: final ? end : run.time,
    status: final ? ("done" as const) : run.status,
    replay: play,
    reduce,
  };
}
