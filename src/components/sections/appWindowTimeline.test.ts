import { describe, expect, it } from "vitest";
import { endTime, resolveTime, rowStatusAt, type RowOutcome } from "./appWindowTimeline";

const OUTCOMES: RowOutcome[] = ["ready", "ready", "ready", "attachment", "warning", "duplicate"];

describe("časová osa okna aplikace", () => {
  it("celý běh trvá do 5 s (WCAG 2.2.2, bez tlačítka pauzy)", () => {
    expect(endTime(OUTCOMES)).toBeLessThanOrEqual(5);
  });

  it("řádek projde stavy nahráno → vytěžuje se → kontrola → výsledek", () => {
    expect(rowStatusAt(0, "ready", 0)).toBe("hidden");
    expect(rowStatusAt(0, "ready", 0.5)).toBe("uploaded");
    expect(rowStatusAt(0, "ready", 1.2)).toBe("extracting");
    expect(rowStatusAt(0, "ready", 2.0)).toBe("checking");
    expect(rowStatusAt(0, "ready", resolveTime(0, "ready"))).toBe("ready");
  });

  it("příloha ISDOC a duplicita se nekontrolují, jen rychle vyhodnotí", () => {
    expect(resolveTime(3, "attachment")).toBeLessThan(resolveTime(3, "ready"));
    const statuses = Array.from({ length: 60 }, (_, step) => rowStatusAt(5, "duplicate", step / 10));
    expect(statuses).not.toContain("checking");
    expect(statuses.at(-1)).toBe("duplicate");
  });

  it("na konci má každý řádek svůj výsledek", () => {
    const end = endTime(OUTCOMES);
    expect(OUTCOMES.map((outcome, index) => rowStatusAt(index, outcome, end))).toEqual(OUTCOMES);
  });
});
