import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * End-to-end testy dema (`npm run test:e2e`). Server běží se zapnutým demem a vymyšlenými
 * hodnotami, skutečné klíče ani databáze nejsou potřeba.
 * Proměnné zadané tady mají přednost před `.env.local`.
 */
const testEnv = {
  DEMO_ENABLED: "true",
  DATABASE_URL: "postgresql://e2e:e2e@e2e.invalid/e2e",
  DEMO_DATABASE_HOST: "e2e.invalid",
  // Produkční build úložiště v paměti odmítne. R2 kostra se v testech nevolá.
  STORAGE_DRIVER: "r2",
  STORAGE_R2_ACCOUNT_ID: "e2e",
  STORAGE_R2_ACCESS_KEY_ID: "e2e",
  STORAGE_R2_SECRET_ACCESS_KEY: "e2e",
  STORAGE_BUCKET: "e2e",
  ANTHROPIC_API_KEY: "e2e-not-a-key",
  EXTRACTION_MODEL: "e2e-model",
  RESEND_API_KEY: "e2e-not-a-key",
  NOTIFY_EMAIL_TO: "notify@example.com",
  NOTIFY_EMAIL_FROM: "Demo <demo@example.com>",
  TURNSTILE_SECRET_KEY: "e2e-not-a-key",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "e2e-site-key",
  SESSION_SECRET: "e2e-session-secret-at-least-32-characters",
  CRON_SECRET: "e2e-cron-secret-at-least-32-characters-x",
  DEMO_DAILY_EXTRACTION_CAP: "10",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Produkční build: CSP jako na Vercelu a souběh s `next dev` (dva dev servery nad jednou složkou Next 16 nedovolí).
    command: `npx next build && npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}/demo`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: testEnv,
  },
});
