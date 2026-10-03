import { z } from "zod";

// Bez JIT: Zod jinak zkouší `new Function` a striktní CSP (bez unsafe-eval) to nahlásí jako porušení.
z.config({ jitless: true });

/**
 * Jedno schéma formuláře pro klienta i server (brief, část 8).
 * Validace na klientu je jen UX, server nikdy nevěří klientu a validuje znovu.
 * Každé textové pole má limit délky.
 */

export const INVOICE_VOLUMES = ["do-200", "200-600", "600-1500", "1500+"] as const;
export const ACCOUNTING_PROGRAM_OPTIONS = ["POHODA", "Money S3", "ABRA", "Jiný"] as const;

export type InvoiceVolume = (typeof INVOICE_VOLUMES)[number];
export type AccountingProgramOption = (typeof ACCOUNTING_PROGRAM_OPTIONS)[number];

/** České i mezinárodní číslo: volitelné +, číslice, mezery, závorky, pomlčky. 9–15 číslic. */
const PHONE_CHARS = /^\+?[0-9\s()-]+$/;

function phoneDigits(value: string): number {
  return value.replace(/\D/g, "").length;
}

export const MIN_FILL_MS = 3000;

export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Napište prosím jméno a příjmení." })
      .max(100, { error: "Jméno může mít nejvýš 100 znaků." }),
    company: z
      .string()
      .trim()
      .min(2, { error: "Napište prosím název firmy nebo kanceláře." })
      .max(150, { error: "Název může mít nejvýš 150 znaků." }),
    email: z
      .string()
      .trim()
      .max(254, { error: "E-mail je příliš dlouhý." })
      .pipe(z.email({ error: "Zkontrolujte prosím formát e-mailu." })),
    phone: z
      .string()
      .trim()
      .max(30, { error: "Telefon je příliš dlouhý." })
      .refine(
        (value) =>
          value === "" ||
          (PHONE_CHARS.test(value) && phoneDigits(value) >= 9 && phoneDigits(value) <= 15),
        { error: "Zkontrolujte prosím telefon, nebo pole nechte prázdné." },
      ),
    invoiceVolume: z.enum(INVOICE_VOLUMES, { error: "Vyberte prosím, kolik faktur měsíčně zpracujete." }),
    program: z.enum(ACCOUNTING_PROGRAM_OPTIONS, { error: "Vyberte prosím účetní program." }),
    programOther: z.string().trim().max(100, { error: "Název programu může mít nejvýš 100 znaků." }),
    message: z.string().trim().max(2000, { error: "Zpráva může mít nejvýš 2 000 znaků." }),
    consent: z.boolean().refine((value) => value === true, { error: "Bez souhlasu vám nemůžu odpovědět." }),
    /** Okamžik, kdy se formulář zobrazil (ms). Slouží ke kontrole minimální doby vyplnění. */
    startedAt: z.number().int().nonnegative(),
  })
  .superRefine((data, ctx) => {
    if (data.program === "Jiný" && data.programOther.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["programOther"],
        message: "Napište prosím, jaký program používáte.",
      });
    }
  });

export type ContactFormInput = z.input<typeof contactSchema>;
export type ContactFormData = z.output<typeof contactSchema>;

/** Výsledek Server Action. Detaily chyb jdou do logu, návštěvník vidí obecnou hlášku. */
export type ContactResult =
  | { ok: true }
  | { ok: false; error: "invalid"; fieldErrors: Partial<Record<keyof ContactFormInput, string>> }
  | { ok: false; error: "too-fast" | "server" };

/** Popisky pro čipy „Faktur měsíčně“. */
export const INVOICE_VOLUME_LABELS: Record<InvoiceVolume, string> = {
  "do-200": "do 200",
  "200-600": "200–600",
  "600-1500": "600–1 500",
  "1500+": "1 500+",
};
