import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { getDemoDb } from "@/lib/demo/db/client";
import { accessTokens, events, leads, sessions, workspaces } from "@/lib/demo/db/schema";
import { generateToken } from "@/lib/demo/auth/tokens";
import { isUniqueViolation } from "./dbErrors";
import type { RegistrationDeps, RegistrationStore, WorkspaceAccess } from "./registration";

/**
 * `RegistrationStore` nad Neonem. Výjimka z pravidla `scopedWhere`: tady session teprve
 * vzniká, plocha se hledá podle e-mailu nebo hashe tokenu. Dotazy vracejí jen
 * identifikátor, stav a `deleteAt` plochy, nikdy její data.
 */

const EMAIL_CONSTRAINT = "leads_email_normalized_unique";

const workspaceAccess = {
  workspaceId: workspaces.id,
  status: workspaces.status,
  deleteAt: workspaces.deleteAt,
};

export const dbRegistrationStore: RegistrationStore = {
  async findByEmail(emailNormalized): Promise<WorkspaceAccess | null> {
    const [row] = await getDemoDb()
      .select(workspaceAccess)
      .from(leads)
      .innerJoin(workspaces, eq(workspaces.leadId, leads.id))
      .where(eq(leads.emailNormalized, emailNormalized))
      .limit(1);
    return row ?? null;
  },

  async create({ lead, workspace, accessToken, session }) {
    const db = getDemoDb();
    try {
      await db.batch([
        db.insert(leads).values(lead),
        db.insert(workspaces).values(workspace),
        db.insert(accessTokens).values(accessToken),
        db.insert(sessions).values(session),
        db.insert(events).values({ id: crypto.randomUUID(), workspaceId: workspace.id, type: "registered", payload: { ref: lead.ref } }),
      ]);
      return "created";
    } catch (error) {
      if (isUniqueViolation(error, EMAIL_CONSTRAINT)) return "email-taken";
      throw error;
    }
  },

  async addAccessToken(token) {
    await getDemoDb().insert(accessTokens).values(token);
  },

  async findAccessToken(tokenHash, now) {
    const [row] = await getDemoDb()
      .select(workspaceAccess)
      .from(accessTokens)
      .innerJoin(workspaces, eq(workspaces.id, accessTokens.workspaceId))
      .where(and(eq(accessTokens.tokenHash, tokenHash), gt(accessTokens.expiresAt, now)))
      .limit(1);
    return row ?? null;
  },

  async addSession(session) {
    await getDemoDb().insert(sessions).values(session);
  },
};

/** Plocha přihlášeného prohlížeče podle hashe session, jen dokud session platí. */
export async function findSessionWorkspace(tokenHash: string, now: Date): Promise<WorkspaceAccess | null> {
  const [row] = await getDemoDb()
    .select(workspaceAccess)
    .from(sessions)
    .innerJoin(workspaces, eq(workspaces.id, sessions.workspaceId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);
  return row ?? null;
}

export function serverRegistrationDeps(): RegistrationDeps {
  return { store: dbRegistrationStore, now: () => new Date(), newId: () => crypto.randomUUID(), newToken: generateToken };
}
