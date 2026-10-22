import { eq } from "drizzle-orm";
import { PgDialect, pgTable, text } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { MissingWorkspaceError, requireWorkspaceId, scopedWhere } from "./workspaceScope";

const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
});

const dialect = new PgDialect();
const render = (condition: ReturnType<typeof scopedWhere>) => dialect.sqlToQuery(condition);

describe("requireWorkspaceId", () => {
  it("returns the workspace id from the session", () => {
    expect(requireWorkspaceId({ workspaceId: "ws-1" })).toBe("ws-1");
  });

  it("throws without a session or with an empty workspace id", () => {
    expect(() => requireWorkspaceId(null)).toThrow(MissingWorkspaceError);
    expect(() => requireWorkspaceId(undefined)).toThrow(MissingWorkspaceError);
    expect(() => requireWorkspaceId({ workspaceId: "  " })).toThrow(MissingWorkspaceError);
  });
});

describe("scopedWhere", () => {
  it("filters by the session workspace", () => {
    const query = render(scopedWhere({ workspaceId: "ws-1" }, invoices));
    expect(query.sql).toBe('"invoices"."workspace_id" = $1');
    expect(query.params).toEqual(["ws-1"]);
  });

  it("always puts the workspace condition first when combining conditions", () => {
    const query = render(scopedWhere({ workspaceId: "ws-1" }, invoices, eq(invoices.id, "inv-7")));
    expect(query.sql).toBe('("invoices"."workspace_id" = $1 and "invoices"."id" = $2)');
    expect(query.params).toEqual(["ws-1", "inv-7"]);
  });

  it("refuses to build a condition without a session", () => {
    expect(() => scopedWhere(null, invoices, eq(invoices.id, "inv-7"))).toThrow(MissingWorkspaceError);
  });
});
