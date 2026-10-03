/**
 * Časová osa okna aplikace v sekci Proč to řešit. Čistá funkce času
 * (sekundy od startu), žádné časovače rozeseté po komponentách.
 * Celý běh trvá do 5 s, takže podle WCAG 2.2.2 nepotřebuje pauzu.
 */

export type RowOutcome = "ready" | "attachment" | "warning" | "duplicate";
export type RowStatus = "hidden" | "uploaded" | "extracting" | "checking" | RowOutcome;

/** Soubory dopadnou do okna jeden po druhém. */
const DROP_START = 0.2;
const DROP_GAP = 0.15;
/** Zpracování začíná postupně, aby bylo vidět, že běží víc faktur najednou. */
const WORK_START = 1.0;
const WORK_GAP = 0.3;
const EXTRACT = 0.9;
const CHECK = 0.6;
/** Příloha ISDOC a duplicita se nevytěžují, jen rychle vyhodnotí. */
const SHORTCUT = 0.5;

export function dropTime(index: number): number {
  return DROP_START + index * DROP_GAP;
}

function workStart(index: number): number {
  return WORK_START + index * WORK_GAP;
}

/** Čas, kdy řádek dostane konečný stav. */
export function resolveTime(index: number, outcome: RowOutcome): number {
  const start = workStart(index);
  return outcome === "attachment" || outcome === "duplicate" ? start + SHORTCUT : start + EXTRACT + CHECK;
}

export function rowStatusAt(index: number, outcome: RowOutcome, time: number): RowStatus {
  if (time < dropTime(index)) return "hidden";
  const start = workStart(index);
  if (time < start) return "uploaded";
  if (time >= resolveTime(index, outcome)) return outcome;
  if (outcome === "attachment" || outcome === "duplicate") return "extracting";
  return time < start + EXTRACT ? "extracting" : "checking";
}

/** Konec běhu: všechny řádky mají konečný stav. */
export function endTime(outcomes: readonly RowOutcome[]): number {
  return Math.max(...outcomes.map((outcome, index) => resolveTime(index, outcome)));
}
