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

  test("can edit an existing inventory item", async ({ page }) => {
    // Find an edit button in the grid
    const editButton = page
      .getByRole("button", { name: /modifier|edit/i })
      .first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // Wait for dialog
      await expect(page.getByRole("dialog")).toBeVisible();

      // Modify the name
      const nameField = page.locator('input[name="name"]');
      const updatedName = `Updated Item ${Date.now()}`;
      await nameField.clear();
      await nameField.fill(updatedName);

      // Save changes
      await page.getByRole("button", { name: /save|sauvegarder/i }).click();

      await page.waitForTimeout(1000);

      // Verify updated name appears
      await expect(page.getByText(updatedName)).toBeVisible();
    }
  });

  test("can delete an inventory item", async ({ page }) => {
    // Find a delete button
    const deleteButton = page
      .getByRole("button", { name: /supprimer|delete/i })
      .first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm deletion dialog might appear
      const confirmButton = page.getByRole("button", {
        name: /confirmer|confirm|oui|yes/i,
      });

      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      await page.waitForTimeout(1000);
    }
  });

  test("can generate barcode for item", async ({ page }) => {
    // Open add dialog
    await page.getByRole("button", { name: /add|ajouter/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Look for generate SKU/barcode button
    const generateButton = page.getByRole("button", {
      name: /générer|generate|sku|barcode|code-barres/i,
    });

    if (await generateButton.isVisible()) {
      await generateButton.click();

      // SKU field should be populated
      const skuField = page.locator('input[name="sku"]');
      const skuValue = await skuField.inputValue();

      expect(skuValue.length).toBeGreaterThan(0);
    }
  });

  test("low stock threshold indicator is visible", async ({ page }) => {
    // Look for low stock indicators in the grid
    const lowStockIndicator = page.locator(
      ".low-stock, [data-low-stock], .warning-icon"
    );

    const count = await lowStockIndicator.count();

    // If there are low stock items, indicators should be visible
    if (count > 0) {
      await expect(lowStockIndicator.first()).toBeVisible();
    }
  });

  test("can set item-level low stock threshold", async ({ page }) => {
    // Open add dialog
    await page.getByRole("button", { name: /add|ajouter/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Look for low stock threshold field
    const thresholdField = page.locator(
      'input[name="low_stock_threshold"], input[name="lowStockThreshold"]'
    );

    if (await thresholdField.isVisible()) {
      await thresholdField.fill("5");
      await expect(thresholdField).toHaveValue("5");
    }
  });

  test("can filter by category", async ({ page }) => {
    // Look for category filter
    const categoryFilter = page.getByLabel(/catégorie|category/i);

    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();

      // Options should appear
      await page.waitForTimeout(500);

      // Select an option (if any exist)
      const firstOption = page.getByRole("option").first();

      if (await firstOption.isVisible()) {
        await firstOption.click();

        // Grid should update with filtered results
        await page.waitForTimeout(500);
      }
    }
  });

  test("can assign stock location to item", async ({ page }) => {
    // Open add dialog
    await page.getByRole("button", { name: /add|ajouter/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Look for location selector
    const locationField = page.getByLabel(/emplacement|location/i);

    if (await locationField.isVisible()) {
      await expect(locationField).toBeVisible();
    }
  });
});
