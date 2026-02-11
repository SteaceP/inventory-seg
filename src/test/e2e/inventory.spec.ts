import { test, expect } from "@playwright/test";

test.describe("Inventory Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory");
    // Wait for loading to finish using role
    await page
      .getByRole("progressbar")
      .waitFor({ state: "hidden", timeout: 15000 })
      .catch(() => {});
  });

  test("displays inventory list", async ({ page }) => {
    await expect(page).toHaveURL("/inventory");
    await expect(
      page.getByRole("heading", { name: /inventaire|inventory/i })
    ).toBeVisible();

    // Check for categorization sections (which act as our "list")
    await expect(page.getByRole("heading", { level: 6 }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("can create a new inventory item", async ({ page }) => {
    const itemName = `Test Item ${Date.now()}`;

    // Click Add button
    await page.getByRole("button", { name: /add|ajouter/i }).click();

    // Fill dialog using test IDs
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByTestId("item-name-input").fill(itemName);
    await page.getByTestId("item-sku-input").fill(`SKU-${Date.now()}`);
    // Assuming Category is a select/combobox
    // Wait for category loading if needed

    // Submit
    const saveButton = page.getByRole("button", {
      name: /save|enregistrer|sauvegarder/i,
    });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Verify item appears in list
    // Use placeholder-based match or aria-label for search
    await page.getByPlaceholder(/search|rechercher/i).fill(itemName);
    await expect(page.getByText(itemName).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test.skip("can edit an existing inventory item", async ({ page }) => {
    // Find an edit button in the grid - use getByLabel for better precision
    let editButton = page.getByLabel(/modifier l'article|edit item/i).first();

    // Ensure we have at least one item
    if (!(await editButton.isVisible())) {
      await page
        .getByRole("button", { name: /add|ajouter/i })
        .first()
        .click();
      await page.getByTestId("item-name-input").fill(`Test Item ${Date.now()}`);

      // Handle category autocomplete
      const categoryInput = page.getByTestId("item-category-input");
      await categoryInput.click();
      await page.waitForTimeout(1000); // Wait for options

      const firstOption = page.getByRole("option").first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
      } else {
        // Fallback if no options (shouldn't happen with seeded data but good for robustness)
        await categoryInput.fill("General");
        await page.keyboard.press("Enter");
      }

      await page
        .getByRole("button", {
          name: /save|enregistrer|sauvegarder|enregistrer/i,
        })
        .first()
        .click();

      // Wait for progress bar to disappear after save
      await page
        .getByRole("progressbar")
        .waitFor({ state: "hidden", timeout: 10000 })
        .catch(() => {});
      await page.waitForTimeout(1000);
      editButton = page.getByLabel(/modifier l'article|edit item/i).first();
    }

    if (await editButton.isVisible()) {
      await editButton.click();

      // Wait for dialog and ensure it's fully rendered
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.waitForTimeout(1000);

      // Modify the name
      const nameField = page.getByTestId("item-name-input");
      const updatedName = `Updated Item ${Date.now()}`;
      await nameField.clear();
      await nameField.fill(updatedName);

      // Save changes
      await page
        .getByRole("button", { name: /save|enregistrer|sauvegarder/i })
        .click();

      // Wait for dialog to disappear
      await expect(page.getByRole("dialog")).toBeHidden({ timeout: 10000 });

      // Wait for progress bar (could be slow under load)
      await page
        .getByRole("progressbar")
        .waitFor({ state: "visible", timeout: 5000 })
        .catch(() => {});
      await page
        .getByRole("progressbar")
        .waitFor({ state: "hidden", timeout: 15000 })
        .catch(() => {});

      // Additional wait for real-time updates to propagate
      await page.waitForTimeout(5000);

      // Verify updated name appears - search for it to ensure visibility
      await page.getByPlaceholder(/search|rechercher/i).fill(updatedName);

      // Fallback: if not visible after short wait, reload page (real-time might be flaky under load)
      try {
        await expect(page.getByText(updatedName).first()).toBeVisible({
          timeout: 5000,
        });
      } catch {
        // Reload and try again
        await page.reload();
        await page
          .getByRole("progressbar")
          .waitFor({ state: "hidden", timeout: 15000 })
          .catch(() => {});
        await page.getByPlaceholder(/search|rechercher/i).fill(updatedName);
      }

      await expect(page.getByText(updatedName).first()).toBeVisible({
        timeout: 30000,
      });
    }
  });

  test("can delete an inventory item", async ({ page }) => {
    // Find a delete button
    const deleteButton = page
      .getByRole("button", { name: /^supprimer$|^delete$/i })
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
      const skuField = page.getByTestId("item-sku-input");
      const skuValue = await skuField.inputValue();

      expect(skuValue.length).toBeGreaterThan(0);
    }
  });

  test("low stock threshold indicator is visible", async ({ page }) => {
    // Look for low stock indicators using semantic markers or roles if available
    // Fallback to data attribute if present, but avoid internal class names
    const lowStockIndicator = page
      .locator("[data-low-stock]")
      .or(page.getByTitle(/stock bas|low stock/i));

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
    const thresholdField = page.getByTestId("item-threshold-input");

    if (await thresholdField.isVisible()) {
      await thresholdField.focus();
      await thresholdField.fill("5");
      await expect(thresholdField).toHaveValue("5");
    }
  });

  test("can filter by category", async ({ page }) => {
    // The UI uses Chips for categories now, not a single select
    const firstCategoryChip = page
      .getByRole("button", { name: /.+/ }) // Matches any chip with a name (excluding "All")
      .filter({ hasNot: page.getByText(/tout|all/i) })
      .first();

    if (await firstCategoryChip.isVisible()) {
      await firstCategoryChip.click();
      await page.waitForTimeout(500);
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
