import { describe, expect, it } from "vitest";
import { isDisposableDomain, isDisposableEmail, normalizeEmail } from "./email";

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Jana.Novakova@Firma.CZ ")).toBe("jana.novakova@firma.cz");
  });

  it("drops the +tag on any domain", () => {
    expect(normalizeEmail("jana+demo@firma.cz")).toBe("jana@firma.cz");
    expect(normalizeEmail("jana+a+b@firma.cz")).toBe("jana@firma.cz");
  });

  it("keeps dots outside Gmail", () => {
    expect(normalizeEmail("jana.novakova@seznam.cz")).toBe("jana.novakova@seznam.cz");
  });

  it("removes dots and the +tag on Gmail", () => {
    expect(normalizeEmail("J.a.N.a+test@gmail.com")).toBe("jana@gmail.com");
  });

  it("treats googlemail.com as gmail.com", () => {
    expect(normalizeEmail("ja.na@googlemail.com")).toBe("jana@gmail.com");
    expect(normalizeEmail("ja.na@googlemail.com")).toBe(normalizeEmail("jana+x@gmail.com"));
  });

  it("does not strip dots on Gmail lookalike domains", () => {
    expect(normalizeEmail("ja.na@gmail.com.example.cz")).toBe("ja.na@gmail.com.example.cz");
  });

  it("ignores a trailing dot in the domain", () => {
    expect(normalizeEmail("jana@firma.cz.")).toBe("jana@firma.cz");
  });

  it("uses the last @ as the separator", () => {
    expect(normalizeEmail('"a@b"@firma.cz')).toBe('"a@b"@firma.cz');
  });

  it("returns null when nothing usable is left", () => {
    expect(normalizeEmail("+demo@firma.cz")).toBeNull();
    expect(normalizeEmail("...@gmail.com")).toBeNull();
    expect(normalizeEmail("@firma.cz")).toBeNull();
    expect(normalizeEmail("jana@")).toBeNull();
    expect(normalizeEmail("jana@localhost")).toBeNull();
    expect(normalizeEmail("jana")).toBeNull();
    expect(normalizeEmail("   ")).toBeNull();
  });
});

describe("isDisposableDomain", () => {
  it("blocks listed domains regardless of case", () => {
    expect(isDisposableDomain("mailinator.com")).toBe(true);
    expect(isDisposableDomain("YOPMAIL.com")).toBe(true);
  });

  it("blocks subdomains of listed domains", () => {
    expect(isDisposableDomain("abc.mailinator.com")).toBe(true);
  });

  it("allows ordinary domains, including lookalikes", () => {
    expect(isDisposableDomain("firma.cz")).toBe(false);
    expect(isDisposableDomain("gmail.com")).toBe(false);
    expect(isDisposableDomain("notmailinator.com")).toBe(false);
    expect(isDisposableDomain("mailinator.com.firma.cz")).toBe(false);
  });

  it("does not block a bare top-level domain", () => {
    expect(isDisposableDomain("com")).toBe(false);
  });
});

describe("isDisposableEmail", () => {
  it("checks the domain part of the address", () => {
    expect(isDisposableEmail("x@trashmail.com")).toBe(true);
    expect(isDisposableEmail("x@firma.cz")).toBe(false);
    expect(isDisposableEmail("bez-zavinace")).toBe(false);
  });
});
