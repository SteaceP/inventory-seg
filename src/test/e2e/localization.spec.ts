import { test, expect } from "@playwright/test";

test.describe("Localization", () => {
  test.describe.configure({ mode: "serial" });

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

  test.skip("language preference persists across page reloads", async ({
    page,
  }) => {
    // Go to settings page where language switcher is available
    await page.goto("/settings");

    // Wait for initial load
    await page
      .getByRole("progressbar")
      .waitFor({ state: "hidden", timeout: 15000 })
      .catch(() => {});

    // Determine current language based on heading
    const heading = page.getByRole("heading", { name: /paramètres|settings/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
    const headingText = await heading.textContent();
    const isFrench = headingText?.toLowerCase().includes("paramètres");

    // We want to switch to the OTHER language
    const targetLanguage = isFrench ? "english" : "french"; // for option selection
    const targetHeadingRegex = isFrench ? /settings/i : /paramètres/i;

    // Open language select
    const languageSelect = page.getByRole("combobox", {
      name: /langue|language/i,
    });
    await languageSelect.click();

    // Click the target option
    await page
      .getByRole("option", { name: new RegExp(targetLanguage, "i") })
      .click();

    // Wait for setting to be saved
    await page.waitForTimeout(2000);

    // Reload the page
    await page.reload();

    // Wait for page to load
    await page
      .getByRole("progressbar")
      .waitFor({ state: "hidden", timeout: 15000 })
      .catch(() => {});

    // After reload, verify the page persisted the new language
    await expect(
      page.getByRole("heading", { name: targetHeadingRegex })
    ).toBeVisible({ timeout: 10000 });

    // Switch back to original language to be nice
    const languageSelectAgain = page.getByRole("combobox", {
      name: /langue|language/i,
    });
    await languageSelectAgain.click();

    const originalLanguage = isFrench ? "french" : "english";
    await page
      .getByRole("option", { name: new RegExp(originalLanguage, "i") })
      .click();

    await page.waitForTimeout(2000);
  });
});
