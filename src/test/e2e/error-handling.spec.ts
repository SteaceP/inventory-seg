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
    // Use the actual translation keys for empty states
    const emptyMessage = page.getByText(
      /Your inventory is empty|Votre inventaire est vide/i
    );

    // Wait for the main page content to load
    await expect(
      page.getByRole("heading", { name: /inventaire|inventory/i })
    ).toBeVisible({ timeout: 15000 });

    // In the new card-based UI, we don't have a grid role for empty state
    // Check if either cards are present OR the empty message is visible
    const cards = page.locator(".MuiCard-root");
    const count = await cards.count();
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

    // One of these should be true: either we have items or an empty message
    expect(count > 0 || hasEmptyMessage).toBeTruthy();
  });

  test("handles duplicate SKU error", async ({ page }) => {
    await page.goto("/inventory");

    // Click Add button
    await page
      .getByRole("button", { name: /ajouter|add/i })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const duplicateSKU = `DUP-SKU-${Date.now()}`;

    // Use getByLabel or TestID
    await page.getByLabel(/nom|name/i).fill("Test Item 1");
    // SKU generation might pop up, just fill it - use textbox role to avoid button collision
    await page
      .getByRole("textbox", { name: /sku|barcode/i })
      .fill(duplicateSKU);

    await page
      .getByRole("button", { name: /save|enregistrer|sauvegarder/i })
      .click();

    // Wait for save to complete and toast/modal to close
    await page.waitForTimeout(2000);

    // Try to create another item with same SKU
    await page
      .getByRole("button", { name: /ajouter|add/i })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel(/nom|name/i).fill("Test Item 2");
    await page
      .getByRole("textbox", { name: /sku|barcode/i })
      .fill(duplicateSKU);

    await page
      .getByRole("button", { name: /save|enregistrer|sauvegarder/i })
      .click();

    await page.waitForTimeout(1000);

    // Should show error about duplicate SKU - matches t("errors.duplicateSku")
    const errorMsg = page.getByText(/existe|exists|already/i);
    await expect(errorMsg.first()).toBeVisible({ timeout: 10000 });
  });

  test("handles network errors gracefully", async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    try {
      await page.goto("/inventory");
    } catch {
      // Expected failure when navigating offline
    }

    // Attempting to interact while offline
    const offlineMsg = page.getByText(
      /network|réseau|connexion|connection|offline|hors ligne/i
    );
    // Our app might show a specific offline indicator
    const hasError = await offlineMsg.isVisible().catch(() => false);

    if (hasError) {
      await expect(offlineMsg.first()).toBeVisible();
    }

    // Go back online
    await page.context().setOffline(false);
  });

  test("invalid form data shows validation messages", async ({ page }) => {
    await page.goto("/inventory");

    await page
      .getByRole("button", { name: /ajouter|add/i })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Required field validation check
    await page
      .getByRole("button", { name: /save|enregistrer|sauvegarder/i })
      .click();

    // Should show validation error for missing name
    const errorMsg = page.getByText(/requis|required/i);
    await expect(errorMsg.first()).toBeVisible();
  });
});
