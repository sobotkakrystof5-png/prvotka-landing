import "server-only";
import { parseDemoEnv, type DemoConfig, type DemoEnv } from "./envSchema";

let cached: DemoEnv | undefined;

/** Konfigurace dema z `process.env`, ověřená jednou za běh procesu. Jen na serveru. */
export function getDemoEnv(): DemoEnv {
  cached ??= parseDemoEnv(process.env);
  return cached;
}

export function isDemoEnabled(): boolean {
  return getDemoEnv().enabled;
}

/** Pro kód, který bez zapnutého dema nemá smysl (databáze, úložiště, API). */
export function requireDemoConfig(): DemoConfig {
  const env = getDemoEnv();
  if (!env.enabled) throw new Error("Demo je vypnuté (DEMO_ENABLED není true).");
  return env;
}
