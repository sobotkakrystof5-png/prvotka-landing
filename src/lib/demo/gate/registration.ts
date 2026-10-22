import type { WorkspaceStatus } from "@/lib/demo/db/schema";
import { hashToken } from "@/lib/demo/auth/tokens";
import { normalizeEmail } from "./email";

/**
 * Registrace v bráně a přihlášení osobním odkazem (BRIEF body 2 a 3, D-003, D-009).
 * Čistá logika nad rozhraním `RegistrationStore`, databázová implementace je v `dbStore.ts`.
 * Nikdy nevrací, zda e-mail existuje, jinak než výsledkem `link-sent` (UI ukáže jen
 * „Odkaz jsme poslali“) a `expired` (BRIEF bod 3).
 */

const DAY_MS = 24 * 60 * 60 * 1000;
/** Pojistka mazání: plocha bez aktivity se smaže po 14 dnech (D-004, BRIEF bod 11). */
export const WORKSPACE_IDLE_MS = 14 * DAY_MS;
export const ACCESS_TOKEN_TTL_MS = 14 * DAY_MS;
export const SESSION_TTL_MS = 14 * DAY_MS;

export interface WorkspaceAccess {
  readonly workspaceId: string;
  readonly status: WorkspaceStatus;
  readonly deleteAt: Date;
}

interface TokenRow {
  readonly id: string;
  readonly workspaceId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
}

export interface NewRegistration {
  readonly lead: {
    readonly id: string;
    readonly email: string;
    readonly emailNormalized: string;
    readonly phone: string;
    readonly ref: string | null;
    readonly ipHash: string | null;
    readonly country: string | null;
  };
  readonly workspace: { readonly id: string; readonly leadId: string; readonly deleteAt: Date };
  readonly accessToken: TokenRow;
  readonly session: TokenRow;
}

export interface RegistrationStore {
  findByEmail(emailNormalized: string): Promise<WorkspaceAccess | null>;
  /** Vše v jedné transakci. `email-taken`, když souběžná registrace stihla stejný e-mail. */
  create(registration: NewRegistration): Promise<"created" | "email-taken">;
  addAccessToken(token: TokenRow): Promise<void>;
  findAccessToken(tokenHash: string, now: Date): Promise<WorkspaceAccess | null>;
  addSession(session: TokenRow): Promise<void>;
}

export interface RegistrationDeps {
  readonly store: RegistrationStore;
  readonly now: () => Date;
  readonly newId: () => string;
  readonly newToken: () => string;
}

export interface RegistrationInput {
  readonly email: string;
  readonly phone: string;
  readonly ref: string | null;
  readonly ipHash: string | null;
  readonly country: string | null;
}

export type RegistrationResult =
  | { readonly kind: "created"; readonly workspaceId: string; readonly sessionToken: string; readonly accessToken: string }
  | { readonly kind: "link-sent"; readonly workspaceId: string; readonly accessToken: string }
  | { readonly kind: "expired" };

export type RedeemResult =
  | { readonly kind: "signed-in"; readonly workspaceId: string; readonly sessionToken: string }
  | { readonly kind: "expired" }
  | { readonly kind: "invalid" };

/** Přístup se odepírá podle `deleteAt`, i když mazací úloha ještě neproběhla (BRIEF bod 3). */
export function isWorkspaceOpen(workspace: WorkspaceAccess, now: Date): boolean {
  return workspace.status !== "expired" && workspace.deleteAt.getTime() > now.getTime();
}

function tokenRow(deps: RegistrationDeps, workspaceId: string, ttlMs: number): { token: string; row: TokenRow } {
  const token = deps.newToken();
  const row = {
    id: deps.newId(),
    workspaceId,
    tokenHash: hashToken(token),
    expiresAt: new Date(deps.now().getTime() + ttlMs),
  };
  return { token, row };
}

async function resendLink(existing: WorkspaceAccess, deps: RegistrationDeps): Promise<RegistrationResult> {
  if (!isWorkspaceOpen(existing, deps.now())) return { kind: "expired" };
  const { token, row } = tokenRow(deps, existing.workspaceId, ACCESS_TOKEN_TTL_MS);
  await deps.store.addAccessToken(row);
  return { kind: "link-sent", workspaceId: existing.workspaceId, accessToken: token };
}

/**
 * Nový e-mail: lead, plocha, osobní odkaz a session najednou, klient je hned přihlášený.
 * Známý e-mail: jen nový osobní odkaz, plocha se v tomto prohlížeči neotevře (D-009).
 * Vypršená plocha: žádný odkaz, nová zkouška se nezaloží.
 */
export async function registerForDemo(input: RegistrationInput, deps: RegistrationDeps): Promise<RegistrationResult> {
  const emailNormalized = normalizeEmail(input.email);
  if (!emailNormalized) throw new Error("E-mail neprošel normalizací, schéma ho mělo odmítnout.");

  const existing = await deps.store.findByEmail(emailNormalized);
  if (existing) return resendLink(existing, deps);

  const leadId = deps.newId();
  const workspaceId = deps.newId();
  const access = tokenRow(deps, workspaceId, ACCESS_TOKEN_TTL_MS);
  const session = tokenRow(deps, workspaceId, SESSION_TTL_MS);

  const outcome = await deps.store.create({
    lead: {
      id: leadId,
      email: input.email.trim(),
      emailNormalized,
      phone: input.phone.trim(),
      ref: input.ref,
      ipHash: input.ipHash,
      country: input.country,
    },
    workspace: { id: workspaceId, leadId, deleteAt: new Date(deps.now().getTime() + WORKSPACE_IDLE_MS) },
    accessToken: access.row,
    session: session.row,
  });

  if (outcome === "email-taken") {
    const winner = await deps.store.findByEmail(emailNormalized);
    if (!winner) throw new Error("Souběžná registrace nahlásila obsazený e-mail, ale lead neexistuje.");
    return resendLink(winner, deps);
  }

  return { kind: "created", workspaceId, sessionToken: session.token, accessToken: access.token };
}

/** Osobní odkaz z e-mailu: platný token otevřené plochy vytvoří session v tomto prohlížeči. */
export async function redeemAccessToken(token: string, deps: RegistrationDeps): Promise<RedeemResult> {
  if (!token) return { kind: "invalid" };
  const access = await deps.store.findAccessToken(hashToken(token), deps.now());
  if (!access) return { kind: "invalid" };
  if (!isWorkspaceOpen(access, deps.now())) return { kind: "expired" };

  const session = tokenRow(deps, access.workspaceId, SESSION_TTL_MS);
  await deps.store.addSession(session.row);
  return { kind: "signed-in", workspaceId: access.workspaceId, sessionToken: session.token };
}
