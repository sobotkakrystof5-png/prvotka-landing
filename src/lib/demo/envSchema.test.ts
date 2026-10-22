import { describe, expect, it } from "vitest";
import { DemoEnvError, parseDemoEnv } from "./envSchema";

const secret = "x".repeat(32);

const complete = {
  DEMO_ENABLED: "true",
  DATABASE_URL: "postgresql://user:pw@ep-demo.eu-central-1.aws.neon.tech/neondb",
  DEMO_DATABASE_HOST: "ep-demo.eu-central-1.aws.neon.tech",
  STORAGE_DRIVER: "memory",
  ANTHROPIC_API_KEY: "test-key",
  EXTRACTION_MODEL: "test-model",
  RESEND_API_KEY: "test-resend",
  NOTIFY_EMAIL_TO: "notify@example.com",
  NOTIFY_EMAIL_FROM: "Demo <demo@example.com>",
  TURNSTILE_SECRET_KEY: "test-turnstile",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "test-site-key",
  SESSION_SECRET: secret,
  CRON_SECRET: secret,
  DEMO_DAILY_EXTRACTION_CAP: "50",
};

function issuesOf(source: Record<string, string | undefined>, nodeEnv = "development"): string[] {
  try {
    parseDemoEnv(source, nodeEnv);
  } catch (error) {
    if (error instanceof DemoEnvError) return [...error.issues];
    throw error;
  }
  return [];
}

describe("parseDemoEnv", () => {
  it("returns disabled without requiring demo variables when DEMO_ENABLED is missing or false", () => {
    expect(parseDemoEnv({})).toEqual({ enabled: false });
    expect(parseDemoEnv({ DEMO_ENABLED: "false" })).toEqual({ enabled: false });
  });

  it("rejects an unknown DEMO_ENABLED value instead of silently disabling the demo", () => {
    expect(issuesOf({ DEMO_ENABLED: "yes" })).toEqual(["DEMO_ENABLED: musí být true nebo false"]);
  });

  it("parses a complete configuration and coerces the daily cap to a number", () => {
    const env = parseDemoEnv(complete, "development");
    expect(env.enabled).toBe(true);
    if (env.enabled) expect(env.DEMO_DAILY_EXTRACTION_CAP).toBe(50);
  });

  it("names every missing variable and never includes values", () => {
    const issues = issuesOf({ ...complete, ANTHROPIC_API_KEY: undefined, SESSION_SECRET: undefined });
    expect(issues.some((issue) => issue.startsWith("ANTHROPIC_API_KEY"))).toBe(true);
    expect(issues.some((issue) => issue.startsWith("SESSION_SECRET"))).toBe(true);
    expect(issues.join(" ")).not.toContain("user:pw");
  });

  it("rejects short secrets and a non-postgres database url", () => {
    const issues = issuesOf({ ...complete, CRON_SECRET: "short", DATABASE_URL: "mysql://host/db" });
    expect(issues.some((issue) => issue.startsWith("CRON_SECRET"))).toBe(true);
    expect(issues.some((issue) => issue.startsWith("DATABASE_URL"))).toBe(true);
  });

  it("requires R2 credentials when the r2 driver is selected", () => {
    const issues = issuesOf({ ...complete, STORAGE_DRIVER: "r2" });
    expect(issues.some((issue) => issue.startsWith("STORAGE_BUCKET"))).toBe(true);
  });

  it("refuses the memory storage driver in production", () => {
    expect(issuesOf(complete, "production")).toEqual(["STORAGE_DRIVER: memory nesmí běžet v produkci"]);
  });
});
