"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { setSessionCookie } from "@/lib/demo/auth/session";
import { hashIp } from "@/lib/demo/auth/tokens";
import { isDemoEnabled, requireDemoConfig } from "@/lib/demo/env";
import { serverRegistrationDeps } from "@/lib/demo/gate/dbStore";
import { gateSchema, parseRef, type GateInput } from "@/lib/demo/gate/gateSchema";
import { registerForDemo, type RegistrationResult } from "@/lib/demo/gate/registration";

export type GateState =
  | { readonly status: "idle" }
  | { readonly status: "invalid"; readonly fieldErrors: Partial<Record<keyof GateInput, string>> }
  | { readonly status: "link-sent" }
  | { readonly status: "expired" }
  | { readonly status: "error" };

const COUNTRY = /^[A-Z]{2}$/;

async function requestOrigin(): Promise<{ ipHash: string | null; country: string | null }> {
  const list = await headers();
  const ip = list.get("x-forwarded-for")?.split(",")[0]?.trim();
  const country = list.get("x-vercel-ip-country")?.trim().toUpperCase();
  return {
    ipHash: ip ? hashIp(ip, requireDemoConfig().SESSION_SECRET) : null,
    country: country && COUNTRY.test(country) ? country : null,
  };
}

/**
 * Registrace v bráně `/demo` (F1, BRIEF bod 9). Server nevěří klientu a validuje znovu.
 * Honeypot `website`: vyplněné pole = robot, dostane stejnou odpověď jako známý e-mail.
 * Do logu jde jen název chyby, nikdy e-mail ani telefon (chyba Drizzle nese parametry dotazu).
 *
 * Doplní session 2 fáze F1: Turnstile, limit pokusů na IP a e-mail (Q-009), oznámení
 * Kryštofovi a e-mail s osobním odkazem (Q-004).
 */
export async function registerDemo(_previous: GateState, formData: FormData): Promise<GateState> {
  if (!isDemoEnabled()) return { status: "error" };

  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) return { status: "link-sent" };

  const parsed = gateSchema.safeParse({ email: formData.get("email"), phone: formData.get("phone") });
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors;
    return { status: "invalid", fieldErrors: { email: flat.email?.[0], phone: flat.phone?.[0] } };
  }

  let result: RegistrationResult;
  try {
    result = await registerForDemo(
      { ...parsed.data, ref: parseRef(formData.get("ref")), ...(await requestOrigin()) },
      serverRegistrationDeps(),
    );
    if (result.kind === "created") await setSessionCookie(result.sessionToken);
  } catch (error) {
    console.error("[demo/gate] Registrace selhala:", error instanceof Error ? error.name : "unknown");
    return { status: "error" };
  }

  if (result.kind === "expired") return { status: "expired" };
  if (result.kind === "link-sent") return { status: "link-sent" };
  redirect("/demo/app");
}
