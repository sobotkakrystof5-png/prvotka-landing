/**
 * Časová osa workflow „Od PDF faktury do účetnictví“ (brief, část 6.3).
 *
 * Jeden běh trvá cca 7 s, proto má workflow tlačítko „Pauza“ (WCAG 2.2.2).
 * Stavový automat: idle → pdf → extracting → isdocx → ready.
 * Všechny časy jsou v sekundách od startu běhu.
 */

export type WorkflowPhase = "idle" | "pdf" | "extracting" | "isdocx" | "ready";
export type NodeState = "waiting" | "active" | "done";

/** Úseky, kdy dokument putuje po spoji mezi uzly [od, do]. */
export const TRAVEL: readonly (readonly [number, number])[] = [
  [0.7, 1.7], // PDF → systém
  [3.9, 4.9], // systém → ISDOCX
  [5.8, 6.8], // ISDOCX → účetní program
];

/** Okamžiky, kdy se v uzlu systému vyplní pole (dodavatel, IČO, číslo, datum, částka). */
export const FIELD_TIMES = [2.0, 2.3, 2.6, 2.9, 3.2] as const;
/** Razítko „DPH ověřeno“. */
export const STAMP_TIME = 3.5;
/** Řádky ISDOCX naskakují jeden po druhém. */
export const LINE_TIMES = [4.95, 5.1, 5.25, 5.4, 5.55] as const;
export const READY_TIME = 6.8;
export const END_TIME = 7.0;

/** Hranice, při jejichž překročení se mění vykreslený stav (React se překresluje jen tady). */
export const THRESHOLDS: readonly number[] = Array.from(
  new Set([0, ...TRAVEL.flat(), ...FIELD_TIMES, STAMP_TIME, ...LINE_TIMES, READY_TIME, END_TIME]),
).sort((a, b) => a - b);

/** Kolik hranic čas `t` překročil. */
export function stageFor(t: number): number {
  let count = 0;
  for (const threshold of THRESHOLDS) if (t >= threshold - 1e-6) count += 1;
  return count;
}

/** Čas odpovídající stavu (poslední překročená hranice), `-1` = ještě nezačalo. */
export function timeForStage(stage: number): number {
  return stage === 0 ? -1 : THRESHOLDS[stage - 1];
}

export function phaseAt(time: number): WorkflowPhase {
  if (time < 0) return "idle";
  if (time < TRAVEL[0][1]) return "pdf";
  if (time < TRAVEL[1][0]) return "extracting";
  if (time < READY_TIME) return "isdocx";
  return "ready";
}

export function nodeStateAt(index: number, time: number): NodeState {
  if (time < 0) return "waiting";
  switch (index) {
    case 0:
      return time < TRAVEL[0][0] ? "active" : "done";
    case 1:
      return time < TRAVEL[0][1] ? "waiting" : time < TRAVEL[1][0] ? "active" : "done";
    case 2:
      return time < TRAVEL[1][1] ? "waiting" : time < TRAVEL[2][0] ? "active" : "done";
    default:
      return time < READY_TIME ? "waiting" : "done";
  }
}

/** Bod na kubické Bézierově křivce spoje (pro putující dokument). */
export interface Point {
  x: number;
  y: number;
}

export function cubicPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}
