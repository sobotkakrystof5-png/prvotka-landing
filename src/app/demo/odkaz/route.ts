import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { setSessionCookie } from "@/lib/demo/auth/session";
import { isDemoEnabled } from "@/lib/demo/env";
import { serverRegistrationDeps } from "@/lib/demo/gate/dbStore";
import { redeemAccessToken } from "@/lib/demo/gate/registration";

/**
 * Osobní odkaz z e-mailu `/demo/odkaz?t=<token>` (D-009). Platný token otevřené plochy
 * přihlásí tento prohlížeč a přesměruje na plochu, takže token v adresním řádku nezůstane.
 * Token jde použít opakovaně až do vypršení, aby ho nespotřeboval náhled odkazu v poště.
 * Stav `vyprselo` a `neplatny-odkaz` zobrazí brána (session 2 fáze F1).
 */
export async function GET(request: NextRequest): Promise<never> {
  if (!isDemoEnabled()) redirect("/demo");

  const token = request.nextUrl.searchParams.get("t") ?? "";
  let target = "/demo?stav=neplatny-odkaz";
  try {
    const result = await redeemAccessToken(token, serverRegistrationDeps());
    if (result.kind === "signed-in") {
      await setSessionCookie(result.sessionToken);
      target = "/demo/app";
    } else if (result.kind === "expired") {
      target = "/demo?stav=vyprselo";
    }
  } catch (error) {
    console.error("[demo/odkaz] Přihlášení odkazem selhalo:", error instanceof Error ? error.name : "unknown");
    target = "/demo?stav=chyba";
  }
  redirect(target);
}
