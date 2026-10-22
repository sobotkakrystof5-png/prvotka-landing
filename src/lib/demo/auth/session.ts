import "server-only";
import { cookies } from "next/headers";
import { requireDemoConfig } from "@/lib/demo/env";
import { findSessionWorkspace } from "@/lib/demo/gate/dbStore";
import { SESSION_TTL_MS, isWorkspaceOpen, type WorkspaceAccess } from "@/lib/demo/gate/registration";
import { hashToken, signCookieValue, verifyCookieValue } from "./tokens";

/**
 * Cookie přihlášení do dema (D-009, BRIEF bod 10): httpOnly, SameSite=Lax (odkaz z e-mailu
 * je navigace z jiného webu), jen pro `/demo`. `secure` všude kromě `next dev`, kde běží http.
 */
export const SESSION_COOKIE = "prvotka_demo";

export async function setSessionCookie(sessionToken: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, signCookieValue(sessionToken, requireDemoConfig().SESSION_SECRET), {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/demo",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export type SignedInWorkspace = WorkspaceAccess & { readonly open: boolean };

/**
 * Plocha přihlášeného prohlížeče, nebo `null` bez platné session. Podpis cookie se ověří
 * dřív, než se sáhne do databáze. `open: false` znamená vypršenou plochu (BRIEF bod 3).
 */
export async function getSignedInWorkspace(): Promise<SignedInWorkspace | null> {
  const store = await cookies();
  const token = verifyCookieValue(store.get(SESSION_COOKIE)?.value, requireDemoConfig().SESSION_SECRET);
  if (!token) return null;

  const now = new Date();
  const workspace = await findSessionWorkspace(hashToken(token), now);
  return workspace ? { ...workspace, open: isWorkspaceOpen(workspace, now) } : null;
}
