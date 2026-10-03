/**
 * Česká typografie: pevná mezera po jednopísmenných předložkách a spojkách
 * (v, k, s, z, o, u, a, i), mezi číslem a jednotkou a mezi řády čísla.
 * Zabraňuje osamělému „v“ na konci řádku a rozdělení „17 h“ nebo „12 480“.
 */
const NBSP = " ";

export function typo(text: string): string {
  return (
    text
      // jednopísmenné předložky a spojky (i po jiné předložce: „a v kanceláři“)
      .replace(/(^|[\s(„])([kvszouaiKVSZOUAI])\s+/g, `$1$2${NBSP}`)
      .replace(/(^|[\s(„])([kvszouaiKVSZOUAI])\s+/g, `$1$2${NBSP}`)
      // řády čísel: 12 480 → 12 480
      .replace(/(\d) (?=\d{3}\b)/g, `$1${NBSP}`)
      // číslo a jednotka
      // (bez `\b`: za „č“ ho JavaScript bez příznaku `u` nenajde)
      .replace(/(\d) (?=(Kč|h|min|%|ms|s)(?![\p{L}\d]))/gu, `$1${NBSP}`)
  );
}

type Typo<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => R extends string ? string : R
    : T extends readonly (infer U)[]
      ? Typo<U>[]
      : T extends object
        ? { [K in keyof T]: Typo<T[K]> }
        : T;

/** Projde objekt s texty a typograficky upraví každý řetězec (i výstup funkcí). */
export function deepTypo<T>(value: T): Typo<T> {
  if (typeof value === "string") return typo(value) as Typo<T>;
  if (typeof value === "function") {
    const fn = value as (...args: unknown[]) => unknown;
    return ((...args: unknown[]) => {
      const out = fn(...args);
      return typeof out === "string" ? typo(out) : out;
    }) as Typo<T>;
  }
  if (Array.isArray(value)) return value.map((item) => deepTypo(item)) as Typo<T>;
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) out[key] = deepTypo(item);
    return out as Typo<T>;
  }
  return value as Typo<T>;
}
