import { defineConfig } from "drizzle-kit";

/**
 * Jen pro `npm run db:generate` (SQL migrace ze schématu, bez připojení k databázi).
 * Migrace se spouští výhradně přes `npm run db:migrate`, který má pojistku proti cizí databázi.
 * `drizzle-kit push` ani `drizzle-kit migrate` se nepoužívají.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/demo/db/schema.ts",
  out: "./drizzle",
});
