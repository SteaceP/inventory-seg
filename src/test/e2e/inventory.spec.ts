import { test, expect } from "@playwright/test";

test.describe("Inventory Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory");
  });

  test("displays inventory list", async ({ page }) => {
    await expect(page).toHaveURL("/inventory");
    await expect(
      page.getByRole("heading", { name: "Inventaire" })
    ).toBeVisible();

    // Check for the DataGrid
    await expect(page.getByRole("grid")).toBeVisible();
  });

  test("can create a new inventory item", async ({ page }) => {
    const itemName = `Test Item ${Date.now()}`;

    // Click Add button
    await page.getByRole("button", { name: /add|ajouter/i }).click();

    // Fill dialog
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.locator('input[name="name"]').fill(itemName);
    await page.locator('input[name="sku"]').fill(`SKU-${Date.now()}`);
    // Assuming Category is a select/combobox
    // Wait for category loading if needed

    // Submit
    await page.getByRole("button", { name: /save|sauvegarder/i }).click();

    // Verify item appears in list (might need search or filter)
    await page.locator('input[type="search"]').fill(itemName);
    await expect(page.getByRole("cell", { name: itemName })).toBeVisible();
  });
});
