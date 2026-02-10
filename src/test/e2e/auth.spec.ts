import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("password visibility toggle", async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.getByRole("button", {
      name: /password|mot de passe/i,
    });

    // Initial state
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click to show
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("navigation to signup and back", async ({ page }) => {
    // Navigate to signup
    const signupLink = page.getByRole("link", {
      name: /sign\s?up|inscrivez|compte/i,
    });
    await signupLink.click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole("heading")).toContainText(
      /créer|signup|compte/i
    );

    // Navigate back to login
    const loginLink = page.getByRole("link", { name: /login|connecter|déjà/i });
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("client-side validation for required fields", async ({ page }) => {
    const submitButton = page.getByRole("button", { name: /login|connecter/i });

    // Attempt to submit empty form
    await submitButton.click();

    // Browser validation should trigger (cannot check message easily, but we can check if it stayed on the page)
    await expect(page).toHaveURL(/\/login/);

    // Check if fields are marked as invalid (MUI uses aria-invalid or required)
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute("required", "");
  });
});
