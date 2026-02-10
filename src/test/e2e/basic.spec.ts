import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Inventaire SEG/i);
});

test("login page has login button", async ({ page }) => {
  await page.goto("/");

  // Check if the login form or a login button is visible
  const loginButton = page.getByRole("button", {
    name: /login|connecter|compte/i,
  });
  await expect(loginButton).toBeVisible();
});
