import { and, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

/**
 * Jediná cesta k datům plochy (AGENTS-demo.md, pravidlo 1). Neon nemá pravidla na úrovni
 * řádků, izolace ploch je jen tady: každá podmínka nad tabulkou plochy začíná
 * `workspace_id` ze sessionu, nikdy z parametru požadavku.
 *
 * F0 obsahuje vzor. Session (cookie, hash tokenu) a tabulky plochy doplní F1 a F2.
 */

export interface DemoSession {
  readonly workspaceId: string;
}

export interface WorkspaceTable {
  readonly workspaceId: AnyPgColumn;
}

export class MissingWorkspaceError extends Error {
  constructor() {
    super("Chybí session plochy.");
    this.name = "MissingWorkspaceError";
  }
}

export function requireWorkspaceId(session: DemoSession | null | undefined): string {
  const workspaceId = session?.workspaceId?.trim();
  if (!workspaceId) throw new MissingWorkspaceError();
  return workspaceId;
}

/**
 * Podmínka `WHERE` omezená na plochu ze sessionu, případně s dalšími podmínkami.
 * Použití: `db.select().from(invoices).where(scopedWhere(session, invoices, eq(invoices.id, id)))`.
 */
export function scopedWhere(
  session: DemoSession | null | undefined,
  table: WorkspaceTable,
  ...conditions: (SQL | undefined)[]
): SQL {
  const workspaceCondition = eq(table.workspaceId, requireWorkspaceId(session));
  return conditions.length === 0 ? workspaceCondition : (and(workspaceCondition, ...conditions) as SQL);
}
