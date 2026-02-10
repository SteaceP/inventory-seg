import { test, expect } from "@playwright/test";

test.describe("Localization", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("switch between French and English", async ({ page }) => {
    // Default should be French based on project settings
    const loginHeader = page.getByRole("heading");

    // Check for French (Se connecter)
    await expect(loginHeader).toContainText(/Se connecter/i);

    // Switch to English
    const enButton = page.getByRole("button", { name: "EN" });
    await enButton.click();

    // Check for English (Sign In)
    await expect(loginHeader).toContainText(/Sign In/i);

    // Switch back to French
    const frButton = page.getByRole("button", { name: "FR" });
    await frButton.click();
    await expect(loginHeader).toContainText(/Se connecter/i);
  });

  test("language persistence across navigation", async ({ page }) => {
    // Switch to English
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.getByRole("heading")).toContainText(/Sign In/i);

    // Navigate to Signup
    await page
      .getByRole("link", { name: /sign\s?up|inscrivez|compte/i })
      .click();

    // Header should still be in English
    await expect(page.getByRole("heading")).toContainText(
      /Create\s(an\s)?Account/i
    );

    // Footer link should be in English
    await expect(page.getByRole("link", { name: /Sign In/i })).toBeVisible();
  });
});
