import { describe, expect, it } from "vitest";
import { hashToken } from "@/lib/demo/auth/tokens";
import {
  WORKSPACE_IDLE_MS,
  isWorkspaceOpen,
  redeemAccessToken,
  registerForDemo,
  type NewRegistration,
  type RegistrationDeps,
  type RegistrationInput,
  type RegistrationStore,
  type WorkspaceAccess,
} from "./registration";

type Row = { workspaceId: string; tokenHash: string; expiresAt: Date };

/** Úložiště v paměti se stejným chováním jako `dbStore.ts` (jedinečný `emailNormalized`). */
function memoryStore() {
  const leads: NewRegistration["lead"][] = [];
  const workspaces = new Map<string, WorkspaceAccess & { leadId: string }>();
  const accessTokens: Row[] = [];
  const sessions: Row[] = [];
  let raceWith: NewRegistration | null = null;

  const accessOf = (workspaceId: string): WorkspaceAccess => {
    const { status, deleteAt } = workspaces.get(workspaceId)!;
    return { workspaceId, status, deleteAt };
  };

  const insert = (registration: NewRegistration) => {
    leads.push(registration.lead);
    workspaces.set(registration.workspace.id, { ...registration.workspace, workspaceId: registration.workspace.id, status: "active" });
    accessTokens.push(registration.accessToken);
    sessions.push(registration.session);
  };

  const store: RegistrationStore = {
    async findByEmail(emailNormalized) {
      const lead = leads.find((l) => l.emailNormalized === emailNormalized);
      const workspace = lead && [...workspaces.values()].find((w) => w.leadId === lead.id);
      return workspace ? accessOf(workspace.workspaceId) : null;
    },
    async create(registration) {
      if (raceWith) {
        insert(raceWith);
        raceWith = null;
      }
      if (leads.some((l) => l.emailNormalized === registration.lead.emailNormalized)) return "email-taken";
      insert(registration);
      return "created";
    },
    async addAccessToken(token) {
      accessTokens.push(token);
    },
    async findAccessToken(tokenHash, now) {
      const token = accessTokens.find((t) => t.tokenHash === tokenHash && t.expiresAt > now);
      return token ? accessOf(token.workspaceId) : null;
    },
    async addSession(session) {
      sessions.push(session);
    },
  };

  return {
    store,
    leads,
    workspaces,
    accessTokens,
    sessions,
    setStatus(workspaceId: string, status: WorkspaceAccess["status"], deleteAt?: Date) {
      const current = workspaces.get(workspaceId)!;
      workspaces.set(workspaceId, { ...current, status, deleteAt: deleteAt ?? current.deleteAt });
    },
    simulateConcurrentRegistration(registration: NewRegistration) {
      raceWith = registration;
    },
  };
}

const START = new Date("2026-10-22T10:00:00Z");

function setup() {
  const db = memoryStore();
  let clock = START;
  let ids = 0;
  let tokens = 0;
  const deps: RegistrationDeps = {
    store: db.store,
    now: () => clock,
    newId: () => `id-${++ids}`,
    newToken: () => `token-${++tokens}`,
  };
  return { db, deps, advance: (ms: number) => (clock = new Date(clock.getTime() + ms)) };
}

const input = (overrides: Partial<RegistrationInput> = {}): RegistrationInput => ({
  email: "Jana.Novakova@gmail.com",
  phone: "+420 777 123 456",
  ref: "tepo",
  ipHash: "ip-hash",
  country: "CZ",
  ...overrides,
});

describe("registerForDemo", () => {
  it("creates a lead, a workspace, a personal link and a session for a new e-mail", async () => {
    const { db, deps } = setup();
    const result = await registerForDemo(input(), deps);

    expect(result.kind).toBe("created");
    expect(db.leads).toHaveLength(1);
    expect(db.leads[0]).toMatchObject({ email: "Jana.Novakova@gmail.com", emailNormalized: "jananovakova@gmail.com", ref: "tepo" });
    expect(db.workspaces.size).toBe(1);
    expect(db.accessTokens).toHaveLength(1);
    expect(db.sessions).toHaveLength(1);
  });

  it("schedules the idle deletion 14 days ahead", async () => {
    const { db, deps } = setup();
    await registerForDemo(input(), deps);
    const [workspace] = db.workspaces.values();
    expect(workspace.deleteAt.getTime()).toBe(START.getTime() + WORKSPACE_IDLE_MS);
  });

  it("stores only hashes of the tokens it hands out", async () => {
    const { db, deps } = setup();
    const result = await registerForDemo(input(), deps);
    if (result.kind !== "created") throw new Error("expected created");

    expect(db.sessions[0].tokenHash).toBe(hashToken(result.sessionToken));
    expect(db.accessTokens[0].tokenHash).toBe(hashToken(result.accessToken));
    const stored = JSON.stringify([db.sessions, db.accessTokens]);
    expect(stored).not.toContain(result.sessionToken);
    expect(stored).not.toContain(result.accessToken);
  });

  it.each(["jana.novakova@gmail.com", "JANANOVAKOVA+demo@googlemail.com", " j.a.n.a.novakova@gmail.com "])(
    "does not open the workspace again for the same normalized e-mail (%s)",
    async (variant) => {
      const { db, deps } = setup();
      const first = await registerForDemo(input(), deps);
      const second = await registerForDemo(input({ email: variant }), deps);

      expect(second.kind).toBe("link-sent");
      expect(second).not.toHaveProperty("sessionToken");
      if (first.kind === "created" && second.kind === "link-sent") expect(second.workspaceId).toBe(first.workspaceId);
      expect(db.leads).toHaveLength(1);
      expect(db.sessions).toHaveLength(1);
      expect(db.accessTokens).toHaveLength(2);
    },
  );

  it("sends a new link for an exhausted workspace that is still open", async () => {
    const { db, deps } = setup();
    const first = await registerForDemo(input(), deps);
    if (first.kind !== "created") throw new Error("expected created");
    db.setStatus(first.workspaceId, "exhausted");

    expect((await registerForDemo(input(), deps)).kind).toBe("link-sent");
  });

  it("refuses an expired workspace without issuing a link", async () => {
    const { db, deps } = setup();
    const first = await registerForDemo(input(), deps);
    if (first.kind !== "created") throw new Error("expected created");
    db.setStatus(first.workspaceId, "expired");

    expect(await registerForDemo(input(), deps)).toEqual({ kind: "expired" });
    expect(db.accessTokens).toHaveLength(1);
  });

  it("treats a workspace past delete_at as expired before the cleanup job runs", async () => {
    const { deps, advance } = setup();
    await registerForDemo(input(), deps);
    advance(WORKSPACE_IDLE_MS);

    expect(await registerForDemo(input(), deps)).toEqual({ kind: "expired" });
  });

  it("does not check the phone: another e-mail with the same phone gets its own demo", async () => {
    const { db, deps } = setup();
    await registerForDemo(input(), deps);
    const second = await registerForDemo(input({ email: "kolega@firma.cz" }), deps);

    expect(second.kind).toBe("created");
    expect(db.leads).toHaveLength(2);
  });

  it("falls back to a new link when a concurrent registration took the e-mail first", async () => {
    const { db, deps } = setup();
    db.simulateConcurrentRegistration({
      lead: { id: "other-lead", email: "jana.novakova@gmail.com", emailNormalized: "jananovakova@gmail.com", phone: "777123456", ref: null, ipHash: null, country: null },
      workspace: { id: "other-ws", leadId: "other-lead", deleteAt: new Date(START.getTime() + WORKSPACE_IDLE_MS) },
      accessToken: { id: "t1", workspaceId: "other-ws", tokenHash: "h1", expiresAt: new Date(START.getTime() + 1000) },
      session: { id: "s1", workspaceId: "other-ws", tokenHash: "h2", expiresAt: new Date(START.getTime() + 1000) },
    });

    const result = await registerForDemo(input(), deps);
    expect(result).toMatchObject({ kind: "link-sent", workspaceId: "other-ws" });
    expect(db.leads).toHaveLength(1);
  });

  it("rejects an e-mail that cannot be normalized", async () => {
    const { deps } = setup();
    await expect(registerForDemo(input({ email: "+x@firma.cz" }), deps)).rejects.toThrow();
  });
});

describe("redeemAccessToken", () => {
  async function registered() {
    const ctx = setup();
    const result = await registerForDemo(input(), ctx.deps);
    if (result.kind !== "created") throw new Error("expected created");
    return { ...ctx, result };
  }

  it("signs in with a valid personal link and creates a new session", async () => {
    const { deps, db, result } = await registered();
    const redeemed = await redeemAccessToken(result.accessToken, deps);

    expect(redeemed).toMatchObject({ kind: "signed-in", workspaceId: result.workspaceId });
    expect(db.sessions).toHaveLength(2);
  });

  it("works with a link from a repeated registration", async () => {
    const { deps, result } = await registered();
    const again = await registerForDemo(input(), deps);
    if (again.kind !== "link-sent") throw new Error("expected link-sent");

    expect(await redeemAccessToken(again.accessToken, deps)).toMatchObject({ kind: "signed-in", workspaceId: result.workspaceId });
  });

  it("rejects unknown, empty and expired tokens", async () => {
    const { deps, advance, result } = await registered();
    expect(await redeemAccessToken("nesmysl", deps)).toEqual({ kind: "invalid" });
    expect(await redeemAccessToken("", deps)).toEqual({ kind: "invalid" });
    advance(WORKSPACE_IDLE_MS + 1);
    expect(await redeemAccessToken(result.accessToken, deps)).toEqual({ kind: "invalid" });
  });

  it("does not sign in to an expired workspace", async () => {
    const { deps, db, result } = await registered();
    db.setStatus(result.workspaceId, "expired");

    expect(await redeemAccessToken(result.accessToken, deps)).toEqual({ kind: "expired" });
    expect(db.sessions).toHaveLength(1);
  });
});

describe("isWorkspaceOpen", () => {
  const now = new Date("2026-10-22T10:00:00Z");
  const later = new Date(now.getTime() + 1);

  it("is open while active or exhausted and before delete_at", () => {
    expect(isWorkspaceOpen({ workspaceId: "w", status: "active", deleteAt: later }, now)).toBe(true);
    expect(isWorkspaceOpen({ workspaceId: "w", status: "exhausted", deleteAt: later }, now)).toBe(true);
  });

  it("is closed when expired or at delete_at", () => {
    expect(isWorkspaceOpen({ workspaceId: "w", status: "expired", deleteAt: later }, now)).toBe(false);
    expect(isWorkspaceOpen({ workspaceId: "w", status: "active", deleteAt: now }, now)).toBe(false);
  });
});
