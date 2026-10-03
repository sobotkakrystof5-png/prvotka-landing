import { describe, expect, it } from "vitest";
import {
  END_TIME,
  THRESHOLDS,
  cubicPoint,
  nodeStateAt,
  phaseAt,
  stageFor,
  timeForStage,
} from "./workflowTimeline";

describe("workflow timeline", () => {
  it("prochází stavy idle → pdf → extracting → isdocx → ready", () => {
    expect(phaseAt(-1)).toBe("idle");
    expect(phaseAt(0)).toBe("pdf");
    expect(phaseAt(2)).toBe("extracting");
    expect(phaseAt(5)).toBe("isdocx");
    expect(phaseAt(END_TIME)).toBe("ready");
  });

  it("na konci jsou všechny uzly hotové", () => {
    expect([0, 1, 2, 3].map((index) => nodeStateAt(index, END_TIME))).toEqual([
      "done",
      "done",
      "done",
      "done",
    ]);
  });

  it("před startem všechny uzly čekají", () => {
    expect([0, 1, 2, 3].map((index) => nodeStateAt(index, -1))).toEqual([
      "waiting",
      "waiting",
      "waiting",
      "waiting",
    ]);
  });

  it("stage a čas jsou konzistentní", () => {
    expect(stageFor(-1)).toBe(0);
    expect(timeForStage(0)).toBe(-1);
    expect(stageFor(END_TIME)).toBe(THRESHOLDS.length);
    expect(timeForStage(stageFor(END_TIME))).toBe(END_TIME);
  });

  it("Bézierova křivka začíná a končí v koncových bodech", () => {
    const p0 = { x: 0, y: 136 };
    const p3 = { x: 56, y: 184 };
    expect(cubicPoint(p0, { x: 28, y: 136 }, { x: 28, y: 184 }, p3, 0)).toEqual(p0);
    expect(cubicPoint(p0, { x: 28, y: 136 }, { x: 28, y: 184 }, p3, 1)).toEqual(p3);
  });
});
