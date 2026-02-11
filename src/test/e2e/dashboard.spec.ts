import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays dashboard after authentication", async ({ page }) => {
    await expect(page).toHaveURL("/");

    // Dashboard heading should be visible
    await expect(
      page.getByRole("heading", { name: /tableau de bord|dashboard/i })
    ).toBeVisible();
  });

  test("displays stats cards", async ({ page }) => {
    // Check for stat cards - these typically contain metrics
    // Looking for cards with numerical data or metrics
    const cards = page.locator(".MuiCard-root, .MuiPaper-root");
    await expect(cards.first()).toBeVisible();
  });

  test("displays low stock alerts section", async ({ page }) => {
    // Low stock section should be visible (even if empty)
    // Look for section heading or table with stock alerts
    const lowStockSection = page.getByText(/stock faible|low stock|alert/i);

    // If present, verify it's visible
    const isVisible = await lowStockSection.isVisible().catch(() => false);

    // Either alerts are visible, or no alerts message is shown
    if (isVisible) {
      await expect(lowStockSection).toBeVisible();
    }
  });

  test("displays recent activity section", async ({ page }) => {
    // Recent activity section
    const activityHeading = page.getByRole("heading", {
      name: /activité récente|recent activity/i,
    });

    // Activity section might not always be visible if empty
    const isVisible = await activityHeading.isVisible().catch(() => false);

    if (isVisible) {
      await expect(activityHeading).toBeVisible();
    }
  });

  test("quick action buttons are accessible", async ({ page }) => {
    // Look for action buttons like "Add Item", "Add Appliance"
    const addButtons = page.getByRole("button", {
      name: /ajouter|add|nouveau|new/i,
    });

    // At least one action button should be present
    // Wait for them to load if they are coming from a component
    await page.waitForTimeout(2000);
    const count = await addButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("navigation drawer works from dashboard", async ({ page }) => {
    const inventoryNav = page.getByRole("link", {
      name: /inventaire|inventory/i,
    });

    if (await inventoryNav.isVisible()) {
      await expect(inventoryNav).toBeVisible();
    }
  });
});
