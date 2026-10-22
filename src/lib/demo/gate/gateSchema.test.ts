import { describe, expect, it } from "vitest";
import { gateSchema, isPlausiblePhone, parseRef } from "./gateSchema";

const valid = { email: "jana@firma.cz", phone: "+420 777 123 456" };

describe("gateSchema", () => {
  it("accepts a work e-mail and a Czech number", () => {
    expect(gateSchema.safeParse(valid).success).toBe(true);
  });

  it("trims both fields", () => {
    const parsed = gateSchema.parse({ email: "  jana@firma.cz ", phone: " 777123456 " });
    expect(parsed).toEqual({ email: "jana@firma.cz", phone: "777123456" });
  });

  it("rejects disposable domains", () => {
    expect(gateSchema.safeParse({ ...valid, email: "x@mailinator.com" }).success).toBe(false);
    expect(gateSchema.safeParse({ ...valid, email: "x@sub.yopmail.com" }).success).toBe(false);
  });

  it("rejects an address that normalizes to nothing", () => {
    expect(gateSchema.safeParse({ ...valid, email: "+x@firma.cz" }).success).toBe(false);
  });

  it("rejects malformed and overlong input", () => {
    expect(gateSchema.safeParse({ ...valid, email: "jana" }).success).toBe(false);
    expect(gateSchema.safeParse({ ...valid, email: `${"a".repeat(250)}@firma.cz` }).success).toBe(false);
    expect(gateSchema.safeParse({ ...valid, phone: "1".repeat(31) }).success).toBe(false);
  });
});

describe("isPlausiblePhone", () => {
  it("accepts Czech and international formats", () => {
    expect(isPlausiblePhone("777123456")).toBe(true);
    expect(isPlausiblePhone("+420 777 123 456")).toBe(true);
    expect(isPlausiblePhone("00420 777-123-456")).toBe(true);
    expect(isPlausiblePhone("+44 (20) 7946 0958")).toBe(true);
  });

  it("rejects too few or too many digits and letters", () => {
    expect(isPlausiblePhone("12345678")).toBe(false);
    expect(isPlausiblePhone("1234567890123456")).toBe(false);
    expect(isPlausiblePhone("777 abc 456")).toBe(false);
    expect(isPlausiblePhone("777+123456")).toBe(false);
  });
});

describe("parseRef", () => {
  it("keeps a short lowercase label", () => {
    expect(parseRef("TEPO-2026")).toBe("tepo-2026");
    expect(parseRef(" kancelar_novak ")).toBe("kancelar_novak");
  });

  it("drops anything else", () => {
    expect(parseRef(undefined)).toBeNull();
    expect(parseRef(["a"])).toBeNull();
    expect(parseRef("")).toBeNull();
    expect(parseRef("<script>")).toBeNull();
    expect(parseRef("a".repeat(65))).toBeNull();
    expect(parseRef("-zacatek")).toBeNull();
  });
});
