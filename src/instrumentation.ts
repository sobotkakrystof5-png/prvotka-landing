/**
 * Běží jednou při startu serveru. Se zapnutým demem ověří proměnné prostředí,
 * takže chybějící klíč zastaví start srozumitelnou chybou, ne až první požadavek.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getDemoEnv } = await import("@/lib/demo/env");
  getDemoEnv();
}
