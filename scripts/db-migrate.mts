/**
 * Spustí migrace demo databáze: `npm run db:migrate`.
 *
 * Před migrací ověří pojistku z `src/lib/demo/db/guard.ts` (hostitel + značka demo databáze).
 * Proměnné čte z `.env.local` stejně jako Next.js. Nikdy nevypisuje připojovací řetězec.
 */
import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { assertDemoHost, DEMO_MARKER_VALUE, evaluateDatabaseState } from "../src/lib/demo/db/guard.ts";

nextEnv.loadEnvConfig(process.cwd());

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  assertDemoHost(databaseUrl, process.env.DEMO_DATABASE_HOST ?? "");

  const sql = neon(databaseUrl);
  const [{ marker_table: markerTable }] = (await sql`
    select to_regclass('public.demo_marker')::text as marker_table
  `) as { marker_table: string | null }[];
  const markerRows = markerTable
    ? ((await sql`select environment from demo_marker limit 1`) as { environment: string }[])
    : [];
  const [{ count }] = (await sql`
    select count(*)::int as count from information_schema.tables where table_schema = 'public'
  `) as { count: number }[];

  const verdict = evaluateDatabaseState({ marker: markerRows[0]?.environment ?? null, publicTableCount: count });
  console.info(verdict === "fresh" ? "Prázdná databáze, první migrace zapíše značku dema." : `Značka ${DEMO_MARKER_VALUE} v pořádku.`);

  await migrate(drizzle({ client: sql }), { migrationsFolder: "drizzle" });
  console.info("Migrace hotové.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Migrace selhala.");
  process.exit(1);
});
