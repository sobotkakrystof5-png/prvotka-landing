import { z } from "zod";

/**
 * Proměnné prostředí dema (docs/demo/phases/F0-priprava.md, úkol 3).
 *
 * Bez `DEMO_ENABLED=true` je demo vypnuté a jeho proměnné se nevyžadují, aby
 * marketingový web běžel dál i bez nich. Se zapnutým demem chybějící nebo
 * neplatná proměnná zastaví start (`src/instrumentation.ts`).
 *
 * Soubor nesmí importovat `server-only`: používá ho i skript migrací (`scripts/`).
 * Chybové hlášky obsahují jen názvy proměnných, nikdy hodnoty.
 */

const SECRET_MIN_LENGTH = 32;

const enabledFlag = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

const required = z.string("chybí").trim().min(1, "chybí");
const secret = z.string("chybí").trim().min(SECRET_MIN_LENGTH, `musí mít aspoň ${SECRET_MIN_LENGTH} znaků`);

const postgresUrl = required.refine(
  (value) => /^postgres(ql)?:\/\//.test(value),
  "musí začínat postgres:// nebo postgresql://",
);

// Q-001: dodavatel úložiště není rozhodnutý. `memory` je jen pro vývoj a testy.
const storageSchema = z.discriminatedUnion("STORAGE_DRIVER", [
  z.object({
    STORAGE_DRIVER: z.literal("r2"),
    STORAGE_R2_ACCOUNT_ID: required,
    STORAGE_R2_ACCESS_KEY_ID: required,
    STORAGE_R2_SECRET_ACCESS_KEY: required,
    STORAGE_BUCKET: required,
  }),
  z.object({ STORAGE_DRIVER: z.literal("memory") }),
]);

const baseSchema = z.object({
  DATABASE_URL: postgresUrl,
  DEMO_DATABASE_HOST: required,
  ANTHROPIC_API_KEY: required,
  EXTRACTION_MODEL: required,
  RESEND_API_KEY: required,
  NOTIFY_EMAIL_TO: z.email("musí být e-mail"),
  NOTIFY_EMAIL_FROM: required,
  TURNSTILE_SECRET_KEY: required,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: required,
  SESSION_SECRET: secret,
  CRON_SECRET: secret,
  DEMO_DAILY_EXTRACTION_CAP: z.coerce.number("musí být číslo").int("musí být celé číslo").positive("musí být kladné"),
});

const enabledSchema = baseSchema.and(storageSchema);

export type DemoConfig = z.infer<typeof enabledSchema>;
export type DemoEnv = { enabled: false } | ({ enabled: true } & DemoConfig);

export class DemoEnvError extends Error {
  constructor(public readonly issues: readonly string[]) {
    super(`Demo je zapnuté (DEMO_ENABLED=true), ale proměnné prostředí nejsou v pořádku:\n${issues.map((issue) => `  - ${issue}`).join("\n")}\nVzor je v .env.example.`);
    this.name = "DemoEnvError";
  }
}

type EnvSource = Readonly<Record<string, string | undefined>>;

/** Čistá funkce: ze zdroje proměnných vrátí konfiguraci dema, nebo vyhodí `DemoEnvError`. */
export function parseDemoEnv(source: EnvSource, nodeEnv = source.NODE_ENV): DemoEnv {
  const flag = enabledFlag.safeParse(source.DEMO_ENABLED);
  if (!flag.success) throw new DemoEnvError(["DEMO_ENABLED: musí být true nebo false"]);
  if (!flag.data) return { enabled: false };

  const result = enabledSchema.safeParse(source);
  if (!result.success) {
    throw new DemoEnvError(
      result.error.issues.map((issue) => `${issue.path.join(".") || "STORAGE_DRIVER"}: ${issue.message}`),
    );
  }
  if (result.data.STORAGE_DRIVER === "memory" && nodeEnv === "production") {
    throw new DemoEnvError(["STORAGE_DRIVER: memory nesmí běžet v produkci"]);
  }
  return { enabled: true, ...result.data };
}
