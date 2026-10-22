import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Tokeny přihlášení bez hesla (D-009). Token se ukáže jen klientovi (odkaz v e-mailu,
 * cookie), do databáze jde jen jeho SHA-256. Cookie nese token a HMAC podpis klíčem
 * `SESSION_SECRET`, takže podvržená hodnota se odmítne ještě před dotazem do databáze.
 * Soubor nemá `server-only`, aby šel testovat. Volá se jen ze serverového kódu.
 */

const TOKEN_BYTES = 32;

export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function hmac(secret: string, purpose: string, value: string): string {
  return createHmac("sha256", secret).update(`${purpose}:${value}`).digest("base64url");
}

export function signCookieValue(token: string, secret: string): string {
  return `${token}.${hmac(secret, "session", token)}`;
}

/** Vrátí token z podepsané hodnoty cookie, nebo `null`, když podpis nesedí. */
export function verifyCookieValue(value: string | undefined, secret: string): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;

  const token = value.slice(0, dot);
  const given = Buffer.from(value.slice(dot + 1));
  const expected = Buffer.from(hmac(secret, "session", token));
  return given.length === expected.length && timingSafeEqual(given, expected) ? token : null;
}

/** IP adresa se neukládá. HMAC jde porovnat (limit pokusů, opakované registrace), ale ne vrátit zpět. */
export function hashIp(ip: string, secret: string): string {
  return hmac(secret, "ip", ip.trim());
}
