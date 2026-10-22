const UNIQUE_VIOLATION = "23505";

/**
 * Porušení jedinečnosti konkrétního omezení v Postgresu. Drizzle obaluje chybu ovladače
 * (`DrizzleQueryError.cause`), proto se hledá v celém řetězu příčin.
 */
export function isUniqueViolation(error: unknown, constraint: string): boolean {
  for (let current = error; current instanceof Error; current = current.cause) {
    const details = current as Error & { code?: unknown; constraint?: unknown };
    if (details.code === UNIQUE_VIOLATION && details.constraint === constraint) return true;
  }
  return false;
}
