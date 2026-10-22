import { expect, test, type Page } from "@playwright/test";

/** Sbírá chyby konzole včetně porušení CSP, které Chrome hlásí jako chybu. */
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

for (const { path, heading } of [{ path: "/demo", heading: "Demo Prvotky" }]) {
  test(`${path} renders in the site design without the marketing navigation`, async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(path);

    // Přístupný název bez kurzoru `_` (aria-hidden).
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(heading);
    await expect(page.getByText("Demo", { exact: true })).toBeVisible();
    await expect(page.getByRole("navigation")).toHaveCount(0);

    // Tokeny webu: papírové pozadí a písma Newsreader na nadpisu.
    await expect(page.locator("section.ledger")).toHaveCSS("background-color", "rgb(246, 241, 232)");
    const headingFont = await page.getByRole("heading", { level: 1 }).evaluate((node) => getComputedStyle(node).fontFamily);
    expect(headingFont).toContain("newsreader");

    expect(errors).toEqual([]);
  });
}

test("the workspace without a session redirects to the gate", async ({ page }) => {
  await page.goto("/demo/app");
  await expect(page).toHaveURL(/\/demo$/);
});

test("a forged session cookie is rejected before any database lookup", async ({ page, context, baseURL }) => {
  const errors = collectConsoleErrors(page);
  await context.addCookies([{ name: "prvotka_demo", value: "podvrh.podpis", url: `${baseURL}/demo` }]);
  await page.goto("/demo/app");
  await expect(page).toHaveURL(/\/demo$/);
  expect(errors).toEqual([]);
});

test("the demo pages are not indexed", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
