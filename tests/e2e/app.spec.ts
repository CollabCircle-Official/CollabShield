import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the scanner and scoring guide", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Know what protects/i })).toBeVisible();
  await page.getByRole("button", { name: "Scoring" }).click();
  await expect(page.getByRole("heading", { name: "Score and grade table" })).toBeVisible();
  await page.getByRole("button", { name: "Close scoring guide" }).click();
});

test("handles complete URLs without duplicating protocol", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("Target URL");
  await input.fill("https://example.com");
  await expect(page.locator(".protocol")).toHaveCount(0);
  await input.fill("example.com");
  await expect(page.locator(".protocol")).toHaveText("https://");
});

test("has no automatically detectable serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("serves policy and methodology pages", async ({ page }) => {
  await page.goto("/methodology");
  await expect(page.getByRole("heading", { name: "Transparent by design" })).toBeVisible();
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Minimal data by default" })).toBeVisible();
});
