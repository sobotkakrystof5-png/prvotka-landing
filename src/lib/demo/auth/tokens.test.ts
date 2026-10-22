import { describe, expect, it } from "vitest";
import { generateToken, hashIp, hashToken, signCookieValue, verifyCookieValue } from "./tokens";

const SECRET = "s".repeat(32);

describe("generateToken", () => {
  it("returns a url-safe token with 256 bits of randomness", () => {
    const token = generateToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(generateToken()).not.toBe(token);
  });
});

describe("hashToken", () => {
  it("is a deterministic SHA-256 that does not contain the token", () => {
    const token = generateToken();
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token)).not.toContain(token);
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("signed cookie value", () => {
  it("round-trips the token", () => {
    const token = generateToken();
    expect(verifyCookieValue(signCookieValue(token, SECRET), SECRET)).toBe(token);
  });

  it("rejects a tampered token or signature", () => {
    const signed = signCookieValue(generateToken(), SECRET);
    const [token, signature] = signed.split(".");
    expect(verifyCookieValue(`${token}x.${signature}`, SECRET)).toBeNull();
    expect(verifyCookieValue(`${token}.${signature.slice(0, -1)}A`, SECRET)).toBeNull();
    expect(verifyCookieValue(`${token}.`, SECRET)).toBeNull();
  });

  it("rejects a value signed with another secret", () => {
    const signed = signCookieValue(generateToken(), "o".repeat(32));
    expect(verifyCookieValue(signed, SECRET)).toBeNull();
  });

  it("rejects missing or malformed values", () => {
    expect(verifyCookieValue(undefined, SECRET)).toBeNull();
    expect(verifyCookieValue("", SECRET)).toBeNull();
    expect(verifyCookieValue("bez-tecky", SECRET)).toBeNull();
    expect(verifyCookieValue(".jen-podpis", SECRET)).toBeNull();
  });
});

describe("hashIp", () => {
  it("is stable per secret and hides the address", () => {
    expect(hashIp("203.0.113.7", SECRET)).toBe(hashIp(" 203.0.113.7 ", SECRET));
    expect(hashIp("203.0.113.7", SECRET)).not.toContain("203");
    expect(hashIp("203.0.113.7", SECRET)).not.toBe(hashIp("203.0.113.7", "o".repeat(32)));
  });

  it("differs from the session signature of the same input", () => {
    expect(hashIp("x", SECRET)).not.toBe(signCookieValue("x", SECRET).split(".")[1]);
  });
});
