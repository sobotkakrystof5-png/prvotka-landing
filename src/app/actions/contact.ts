"use server";

import { z } from "zod";
import { Resend } from "resend";
import {
  INVOICE_VOLUME_LABELS,
  MIN_FILL_MS,
  contactSchema,
  type ContactFormInput,
  type ContactResult,
} from "@/lib/contactSchema";
import { escapeHtml, toSingleLine } from "@/lib/escapeHtml";

/**
 * Příjem kontaktního formuláře (brief, část 8).
 *
 * - Server nikdy nevěří klientu: stejné Zod schéma jako na klientu, znovu.
 * - Honeypot: vyplněné skryté pole = bot, vrací se tichý „úspěch“.
 * - Minimální doba vyplnění 3 s.
 * - Rate limit na IP tady záměrně není: paměť serverless instance na Vercelu
 *   se nesdílí. Řeší se ve Fázi 6 (Vercel Firewall na Hobby, případně Upstash
 *   se souhlasem zadavatele). Viz `.claude/security/STATE.md`.
 * - Klíč `RESEND_API_KEY` jen na serveru, nikdy `NEXT_PUBLIC_`.
 * - Vstupy se v e-mailu escapují, nikdy se nevkládají jako HTML.
 * - Návštěvník vidí obecnou chybu, do logu jde jen typ chyby, žádné osobní údaje.
 */
export async function sendContact(raw: unknown): Promise<ContactResult> {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "invalid", fieldErrors: {} };
  }

  const honeypot = (raw as Record<string, unknown>).website;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { ok: true };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>;
    const fieldErrors: Partial<Record<keyof ContactFormInput, string>> = {};
    for (const [key, messages] of Object.entries(flat)) {
      if (messages?.[0]) fieldErrors[key as keyof ContactFormInput] = messages[0];
    }
    return { ok: false, error: "invalid", fieldErrors };
  }

  const data = parsed.data;
  const elapsed = Date.now() - data.startedAt;
  if (!(elapsed >= MIN_FILL_MS)) {
    return { ok: false, error: "too-fast" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.error("[contact] Chybí RESEND_API_KEY, CONTACT_TO_EMAIL nebo CONTACT_FROM_EMAIL.");
    return { ok: false, error: "server" };
  }

  const volume = INVOICE_VOLUME_LABELS[data.invoiceVolume];
  const program = data.program === "Jiný" ? `Jiný: ${data.programOther}` : data.program;
  const subject = toSingleLine(`Poptávka: ${data.company} (${volume} faktur měsíčně)`).slice(0, 200);

  const rows: [string, string][] = [
    ["Jméno", data.name],
    ["Firma", data.company],
    ["E-mail", data.email],
    ["Telefon", data.phone || "neuvedeno"],
    ["Faktur měsíčně", volume],
    ["Účetní program", program],
    ["Zpráva", data.message || "bez zprávy"],
  ];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" valign="top" style="color:#5e5a52">${escapeHtml(label)}</th><td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("")}</table>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject,
      text,
      html,
    });
    if (error) {
      console.error("[contact] Resend vrátil chybu:", error.name);
      return { ok: false, error: "server" };
    }
  } catch (error) {
    console.error("[contact] Odeslání selhalo:", error instanceof Error ? error.name : "unknown");
    return { ok: false, error: "server" };
  }

  return { ok: true };
}
