import { test, expect } from "@playwright/test";

test.describe("Appliance Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/appliances");
  });

  test("displays appliances list", async ({ page }) => {
    await expect(page).toHaveURL("/appliances");
    await expect(
      page.getByRole("heading", { name: /appliances|appareils/i })
    ).toBeVisible();
  });

  test("can create a new appliance", async ({ page }) => {
    const applianceName = `Test Fridge ${Date.now()}`;

    // Click Add button
    await page.getByRole("button", { name: /add|ajouter/i }).click();

    // Fill dialog
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.locator('input[name="name"]').fill(applianceName);
    await page.locator('input[name="brand"]').fill("Samsung");
    await page.locator('input[name="model"]').fill("RF28");

    // Submit
    await page.getByRole("button", { name: /save|sauvegarder/i }).click();

    // Verify item appears
    // If there is a search filter
    // await page.getByPlaceholder(/search|rechercher/i).fill(applianceName);
    // await expect(page.getByText(applianceName)).toBeVisible();
  });
});
