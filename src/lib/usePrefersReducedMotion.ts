"use client";

import { useSyncExternalStore } from "react";

/**
 * `prefers-reduced-motion` bezpečně pro hydrataci.
 *
 * `useReducedMotion` z Motion čte media query hned při prvním renderu na
 * klientu, takže se klient při omezených animacích liší od HTML ze serveru
 * (React chyba #418). Tady hydratace použije serverovou hodnotu `false`
 * a skutečná preference se projeví hned po ní.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
