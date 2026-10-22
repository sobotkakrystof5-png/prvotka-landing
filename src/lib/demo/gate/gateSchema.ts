import { z } from "zod";
import { isDisposableEmail, normalizeEmail } from "./email";

// Bez JIT kvůli CSP bez unsafe-eval, stejně jako `src/lib/contactSchema.ts`.
z.config({ jitless: true });

/**
 * Schéma brány `/demo` pro klienta i server (BRIEF bod 9). Server validuje vždy znovu.
 * Turnstile a limit pokusů se ověřují mimo schéma, v server akci.
 */

/** Volná kontrola telefonu (D-003): volitelné + nebo 00, číslice, mezery, závorky, pomlčky, 9 až 15 číslic. */
const PHONE_CHARS = /^\+?[0-9\s()-]+$/;
const PHONE_MIN_DIGITS = 9;
const PHONE_MAX_DIGITS = 15;

export function isPlausiblePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "").length;
  return PHONE_CHARS.test(value) && digits >= PHONE_MIN_DIGITS && digits <= PHONE_MAX_DIGITS;
}

/** Štítek z osobního odkazu `/demo?ref=...`. Cokoli jiného se zahodí, ne odmítne. */
const REF_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

export function parseRef(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const ref = value.trim().toLowerCase();
  return REF_PATTERN.test(ref) ? ref : null;
}

export const gateSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "Napište prosím e-mail." })
    .max(254, { error: "E-mail je příliš dlouhý." })
    .pipe(z.email({ error: "Zkontrolujte prosím formát e-mailu." }))
    .refine((value) => normalizeEmail(value) !== null, { error: "Zkontrolujte prosím formát e-mailu." })
    .refine((value) => !isDisposableEmail(value), {
      error: "Na dočasnou schránku demo založit nejde. Použijte prosím pracovní e-mail.",
    }),
  phone: z
    .string()
    .trim()
    .min(1, { error: "Napište prosím telefon." })
    .max(30, { error: "Telefon je příliš dlouhý." })
    .refine(isPlausiblePhone, { error: "Zkontrolujte prosím formát telefonu." }),
});

export type GateInput = z.infer<typeof gateSchema>;
