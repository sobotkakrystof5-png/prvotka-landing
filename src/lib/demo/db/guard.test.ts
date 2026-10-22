import { describe, expect, it } from "vitest";
import { assertDemoHost, DEMO_MARKER_VALUE, DemoDatabaseGuardError, evaluateDatabaseState } from "./guard";

const demoHost = "ep-demo-123.eu-central-1.aws.neon.tech";

describe("assertDemoHost", () => {
  it("accepts the configured demo host", () => {
    expect(() => assertDemoHost(`postgresql://u:secret@${demoHost}/neondb`, demoHost)).not.toThrow();
  });

  it("rejects a different host without leaking the password", () => {
    const run = () => assertDemoHost("postgresql://u:secret@ep-prod-999.neon.tech/neondb", demoHost);
    expect(run).toThrow(DemoDatabaseGuardError);
    expect(run).toThrow(/ep-prod-999/);
    expect(run).not.toThrow(/secret/);
  });

  it("rejects a missing expected host and an invalid url", () => {
    expect(() => assertDemoHost(`postgresql://u:p@${demoHost}/db`, "")).toThrow(DemoDatabaseGuardError);
    expect(() => assertDemoHost("not a url", demoHost)).toThrow(DemoDatabaseGuardError);
  });
});

describe("evaluateDatabaseState", () => {
  it("passes a database carrying the demo marker", () => {
    expect(evaluateDatabaseState({ marker: DEMO_MARKER_VALUE, publicTableCount: 9 })).toBe("marked");
  });

  it("allows an empty database for the first migration", () => {
    expect(evaluateDatabaseState({ marker: null, publicTableCount: 0 })).toBe("fresh");
  });

  it("blocks a database with tables but no marker (possible production)", () => {
    expect(() => evaluateDatabaseState({ marker: null, publicTableCount: 3 })).toThrow(DemoDatabaseGuardError);
  });

  it("blocks a database with a foreign marker", () => {
    expect(() => evaluateDatabaseState({ marker: "prvotka-prod", publicTableCount: 0 })).toThrow(/cizí značku/);
  });
});
