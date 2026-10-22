import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "./dbErrors";

const pgError = (code: string, constraint: string) => Object.assign(new Error("db"), { code, constraint });

describe("isUniqueViolation", () => {
  it("finds the driver error wrapped by Drizzle", () => {
    const wrapped = new Error("Failed query", { cause: pgError("23505", "leads_email_normalized_unique") });
    expect(isUniqueViolation(wrapped, "leads_email_normalized_unique")).toBe(true);
  });

  it("ignores other constraints and other error codes", () => {
    expect(isUniqueViolation(pgError("23505", "sessions_token_hash_unique"), "leads_email_normalized_unique")).toBe(false);
    expect(isUniqueViolation(pgError("23503", "leads_email_normalized_unique"), "leads_email_normalized_unique")).toBe(false);
  });

  it("ignores non-errors", () => {
    expect(isUniqueViolation("23505", "x")).toBe(false);
    expect(isUniqueViolation(undefined, "x")).toBe(false);
  });
});
