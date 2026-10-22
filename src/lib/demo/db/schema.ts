import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Schéma demo databáze. Tabulky z docs/demo/BRIEF.md, bod 4, přibývají po fázích.
 * Každá tabulka s daty plochy má sloupec `workspaceId` a dotazy na ni jdou jen přes
 * `src/lib/demo/db/workspaceScope.ts`. Identifikátory generuje aplikace
 * (`crypto.randomUUID`), aby registrace šla zapsat jednou dávkou (Neon HTTP nemá
 * interaktivní transakce, `db.batch` běží v jedné transakci).
 */

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/**
 * Značka, že jde o demo databázi. Skript migrací bez ní odmítne běžet
 * (`src/lib/demo/db/guard.ts`). Jediný řádek, zapisuje ho jen skript migrací.
 */
export const demoMarker = pgTable("demo_marker", {
  id: integer("id").primaryKey(),
  environment: text("environment").notNull(),
  createdAt: createdAt(),
});

/**
 * Kontakt z brány. Zůstává i po smazání plochy (D-004), proto nemá `workspaceId`.
 * `emailNormalized` je jediná pojistka „e-mail jen jednou“ (D-003).
 * IP adresa se neukládá, jen HMAC (`ipHash`).
 */
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  emailNormalized: text("email_normalized").notNull().unique(),
  phone: text("phone").notNull(),
  ref: text("ref"),
  createdAt: createdAt(),
  ipHash: text("ip_hash"),
  country: text("country"),
  invoicesUsed: integer("invoices_used").notNull().default(0),
  isdocDownloads: integer("isdoc_downloads").notNull().default(0),
  assistantUses: integer("assistant_uses").notNull().default(0),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
});

export const workspaceStatus = pgEnum("workspace_status", ["active", "exhausted", "expired"]);
export type WorkspaceStatus = (typeof workspaceStatus.enumValues)[number];

/** Pracovní plocha. Jedna na lead. Přístup se odepírá podle `deleteAt` (BRIEF bod 11). */
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey(),
  leadId: uuid("lead_id")
    .notNull()
    .unique()
    .references(() => leads.id),
  status: workspaceStatus("status").notNull().default("active"),
  quotaTotal: integer("quota_total").notNull().default(4),
  quotaUsed: integer("quota_used").notNull().default(0),
  exhaustedAt: timestamp("exhausted_at", { withTimezone: true }),
  deleteAt: timestamp("delete_at", { withTimezone: true }).notNull(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
  settings: jsonb("settings").notNull().default({}),
  createdAt: createdAt(),
});

/** Osobní odkaz z e-mailu. V databázi jen SHA-256 tokenu (D-009). */
export const accessTokens = pgTable("access_tokens", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  createdAt: createdAt(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

/** Přihlášení v prohlížeči (cookie). V databázi jen SHA-256 tokenu. */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  createdAt: createdAt(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

/** Události plochy, zdroj statistiky pro oznámení. Bez obsahu faktur a osobních údajů. */
export const events = pgTable("events", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull().default({}),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
});
