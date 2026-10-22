import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { requireDemoConfig } from "@/lib/demo/env";
import * as schema from "./schema";

export type DemoDb = NeonHttpDatabase<typeof schema>;

let db: DemoDb | undefined;

/**
 * Připojení k demo databázi (Neon serverless přes HTTP). Vytvoří se až při prvním použití,
 * takže web bez zapnutého dema databázi nepotřebuje.
 * Tabulky plochy se nedotazují napřímo, ale přes `workspaceScope.ts`.
 */
export function getDemoDb(): DemoDb {
  db ??= drizzle({ client: neon(requireDemoConfig().DATABASE_URL), schema });
  return db;
}
