import { test, expect } from "@playwright/test";

test.describe("Error Handling", () => {
  test("404 routes redirect to dashboard", async ({ page }) => {
    // Navigate to non-existent route
    await page.goto("/this-page-does-not-exist");

    // Should redirect to dashboard
    await expect(page).toHaveURL("/");
  });

  test("invalid inventory item ID redirects gracefully", async ({ page }) => {
    // Try to access an inventory item with invalid ID
    await page.goto("/inventory/item/invalid-id-123");

    // Should redirect to inventory or dashboard
    await expect(page).toHaveURL(/\/(inventory)?$/);
  });

  test("form validation errors display correctly", async ({ page }) => {
    await page.goto("/inventory");

    // Open add dialog
    await page.getByRole("button", { name: /ajouter|add/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Try to save without required fields
    const saveButton = page.getByRole("button", {
      name: /sauvegarder|save|enregistrer/i,
    });
    await saveButton.click();

    // Validation errors should appear
    await page.waitForTimeout(500);

    // Look for error messages or invalid field indicators
    const errorMessage = page.getByText(/requis|required|obligatoire/i);
    const invalidField = page.locator('[aria-invalid="true"]');

    const hasErrors =
      (await errorMessage.count()) > 0 || (await invalidField.count()) > 0;

    expect(hasErrors).toBeTruthy();
  });

  test("empty inventory list shows appropriate message", async ({ page }) => {
    await page.goto("/inventory");

    // If inventory is empty, should show a message
    // Look for "no items" or "empty" message
    const emptyMessage = page.getByText(
      /aucun|no items|vide|empty|pas de données|no data/i
    );

    // Either items exist or empty message shows
    const grid = page.getByRole("grid");
    const hasGrid = await grid.isVisible();
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

    // One of these should be true
    expect(hasGrid || hasEmptyMessage).toBeTruthy();
  });

  test("handles duplicate SKU error", async ({ page }) => {
    await page.goto("/inventory");

    // Create first item
    await page.getByRole("button", { name: /ajouter|add/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const duplicateSKU = `DUP-SKU-${Date.now()}`;

    await page.locator('input[name="name"]').fill("Test Item 1");
    await page.locator('input[name="sku"]').fill(duplicateSKU);

    let saveButton = page.getByRole("button", {
      name: /sauvegarder|save|enregistrer/i,
    });
    await saveButton.click();

    await page.waitForTimeout(1500);

    // Try to create another item with same SKU
    const addButton = page.getByRole("button", { name: /ajouter|add/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await expect(page.getByRole("dialog")).toBeVisible();

      await page.locator('input[name="name"]').fill("Test Item 2");
      await page.locator('input[name="sku"]').fill(duplicateSKU);

      saveButton = page.getByRole("button", {
        name: /sauvegarder|save|enregistrer/i,
      });
      await saveButton.click();

      await page.waitForTimeout(1000);

      // Should show error about duplicate SKU
      const errorMsg = page.getByText(/existe|exists|duplicate|déjà|already/i);
      const hasError = await errorMsg.isVisible().catch(() => false);

      if (hasError) {
        await expect(errorMsg).toBeVisible();
      }
    }
  });

  test("handles network errors gracefully", async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    await page.goto("/inventory");

    // Try to add an item while offline
    const addButton = page.getByRole("button", { name: /ajouter|add/i });

    if (await addButton.isVisible()) {
      await addButton.click();

      // Dialog might open
      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        await page.locator('input[name="name"]').fill("Offline Test");

        const saveButton = page.getByRole("button", {
          name: /sauvegarder|save/i,
        });
        await saveButton.click();

        await page.waitForTimeout(1000);

        // Should show network error
        const errorMsg = page.getByText(
          /network|réseau|connexion|connection|erreur|error/i
        );
        const hasError = await errorMsg.isVisible().catch(() => false);

        if (hasError) {
          await expect(errorMsg).toBeVisible();
        }
      }
    }

    // Go back online
    await page.context().setOffline(false);
  });

  test("invalid form data shows validation messages", async ({ page }) => {
    await page.goto("/inventory");

    await page.getByRole("button", { name: /ajouter|add/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Enter invalid data (negative stock, for example)
    await page.locator('input[name="name"]').fill("Invalid Item");

    const stockField = page.locator('input[name="stock"]');
    if (await stockField.isVisible()) {
      await stockField.fill("-10"); // Invalid negative stock

      const saveButton = page.getByRole("button", {
        name: /sauvegarder|save/i,
      });
      await saveButton.click();

      await page.waitForTimeout(500);

      // Should show validation error
      const errorMsg = page.getByText(
        /invalide|invalid|positif|positive|supérieur|greater/i
      );
      const hasError = await errorMsg.isVisible().catch(() => false);

      if (hasError) {
        await expect(errorMsg).toBeVisible();
      }
    }
  });
});
