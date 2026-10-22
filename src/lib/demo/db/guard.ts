/**
 * Pojistka, aby se migrace dema nikdy nespustily proti jiné databázi (AGENTS-demo.md, pravidlo 8).
 *
 * Dvě nezávislé kontroly:
 * 1. Hostitel v `DATABASE_URL` se musí shodovat s `DEMO_DATABASE_HOST`.
 * 2. Databáze musí mít značku `demo_marker`, nebo být úplně prázdná (první migrace).
 *    Ostrá databáze má tabulky a značku nemá, takže neprojde.
 *
 * Čisté funkce bez importů aliasu `@/`, používá je i `scripts/db-migrate.ts`.
 */

export const DEMO_MARKER_ID = 1;
export const DEMO_MARKER_VALUE = "prvotka-demo";

export class DemoDatabaseGuardError extends Error {
  constructor(message: string) {
    super(`Migrace zastavena: ${message}`);
    this.name = "DemoDatabaseGuardError";
  }
}

/** Ověří hostitele. Ve zprávě je jen hostitel, nikdy heslo nebo celé URL. */
export function assertDemoHost(databaseUrl: string, expectedHost: string): void {
  let host: string;
  try {
    host = new URL(databaseUrl).hostname;
  } catch {
    throw new DemoDatabaseGuardError("DATABASE_URL není platná adresa.");
  }
  if (!expectedHost || host !== expectedHost.trim()) {
    throw new DemoDatabaseGuardError(
      `hostitel ${host} neodpovídá DEMO_DATABASE_HOST. Zkontrolujte, že míříte na demo větev Neonu.`,
    );
  }
}

export interface DatabaseState {
  /** Hodnota `environment` ze značky, `null` když tabulka nebo řádek chybí. */
  marker: string | null;
  /** Počet tabulek ve schématu `public` (bez tabulek Drizzle). */
  publicTableCount: number;
}

export type GuardVerdict = "marked" | "fresh";

/** `marked`: demo databáze se značkou. `fresh`: prázdná databáze, značka se zapíše po migraci. */
export function evaluateDatabaseState(state: DatabaseState): GuardVerdict {
  if (state.marker === DEMO_MARKER_VALUE) return "marked";
  if (state.marker !== null) {
    throw new DemoDatabaseGuardError(`databáze má cizí značku „${state.marker}“.`);
  }
  if (state.publicTableCount > 0) {
    throw new DemoDatabaseGuardError(
      "databáze obsahuje tabulky, ale nemá značku demo databáze. Může jít o ostrou databázi.",
    );
  }
  return "fresh";
}
