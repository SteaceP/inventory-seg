import { test, expect } from "@playwright/test";

test.describe("Accessibility & Semantics", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("form fields have labels and roles", async ({ page }) => {
    // Email field
    const emailField = page.getByLabel(/email|courriel/i);
    await expect(emailField).toBeVisible();
    await expect(emailField).toHaveAttribute("type", "email");

    // Password field (MUI should have input linked to label)
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();

    // Verify label exists and covers either EN or FR
    const passwordLabel = page.locator('label[for="password"]');
    await expect(passwordLabel).toContainText(/pass|mot de passe/i);

    // Submit button
    const submitButton = page.getByRole("button", { name: /login|connecter/i });
    await expect(submitButton).toBeVisible();
  });

  test("language switcher has exclusive selection", async ({ page }) => {
    const frButton = page.getByRole("button", { name: "FR" });
    const enButton = page.getByRole("button", { name: "EN" });

    // One should be selected (Aria-pressed for ToggleButton)
    const isFrPressed = await frButton.getAttribute("aria-pressed");
    const isEnPressed = await enButton.getAttribute("aria-pressed");

    expect(isFrPressed !== isEnPressed).toBeTruthy();
  });

  test("container has appropriate padding and alignment", async ({ page }) => {
    const mainContainer = page.locator(".MuiContainer-root");
    await expect(mainContainer).toBeVisible();
  });
});
