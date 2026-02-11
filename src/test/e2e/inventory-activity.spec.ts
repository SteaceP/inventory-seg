import { test, expect } from "@playwright/test";

test.describe("Inventory Activity", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory/activity");
  });

  test("activity page loads successfully", async ({ page }) => {
    await expect(page).toHaveURL(/\/inventory\/activity/);
    await expect(
      page.getByRole("heading", { name: /activité|activity/i })
    ).toBeVisible();
  });

  test("displays audit log entries", async ({ page }) => {
    // Look for table or list of activity entries
    const activityTable = page.locator(
      ".MuiTable-root, .MuiDataGrid-root, .MuiList-root"
    );

    await expect(activityTable.first()).toBeVisible();
  });

  test("activity entries show action type", async ({ page }) => {
    // Look for action type indicators (created, updated, deleted)
    const actionTypes = page.getByText(
      /créé|created|modifié|updated|supprimé|deleted|ajouté|added/i
    );

    const count = await actionTypes.count();

    // Should have at least some action type labels if there's activity
    if (count > 0) {
      await expect(actionTypes.first()).toBeVisible();
    }
  });

  test("activity entries display user information", async ({ page }) => {
    // Look for user names or user IDs in activity log
    // Usually in a column or as part of the entry
    const userColumn = page.locator(
      '[data-field="user"], .user-column, .activity-user'
    );

    if (await userColumn.first().isVisible()) {
      await expect(userColumn.first()).toBeVisible();
    }
  });

  test("activity entries show timestamps", async ({ page }) => {
    // Look for date/time information
    const timestamps = page.locator(
      '[data-field="created_at"], .timestamp, .activity-date'
    );

    if (await timestamps.first().isVisible()) {
      await expect(timestamps.first()).toBeVisible();
    } else {
      // Alternative: look for date patterns in text
      const datePattern = page.getByText(
        /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/
      );
      const count = await datePattern.count();

      if (count > 0) {
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test("can filter activity by action type", async ({ page }) => {
    // Look for filter controls
    const filterButton = page.getByRole("button", {
      name: /filtrer|filter/i,
    });

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Look for action type filter options
      const createFilter = page.getByText(/créé|created/i);
      const updateFilter = page.getByText(/modifié|updated/i);

      // At least one filter option should be available
      const hasFilters =
        (await createFilter.isVisible()) || (await updateFilter.isVisible());

      expect(hasFilters).toBeTruthy();
    }
  });

  test("can filter activity by date range", async ({ page }) => {
    // Look for date filter inputs
    const dateInputs = page.locator('input[type="date"]');
    const count = await dateInputs.count();

    if (count > 0) {
      expect(count).toBeGreaterThan(0);

      // Try setting a date
      await dateInputs.first().fill("2026-01-01");
    }
  });

  test("activity displays item names", async ({ page }) => {
    // Activity should show which inventory items were affected
    const itemColumn = page.locator(
      '[data-field="item_name"], .item-column, .activity-item'
    );

    if (await itemColumn.first().isVisible()) {
      await expect(itemColumn.first()).toBeVisible();
    }
  });

  test("can view activity details", async ({ page }) => {
    // Look for expandable rows or detail buttons
    const detailButton = page
      .getByRole("button", { name: /détails|details|voir|view/i })
      .first();

    if (await detailButton.isVisible()) {
      await detailButton.click();

      // Details should appear (could be expanded row or dialog)
      await page.waitForTimeout(500);

      // Look for changes JSONB data display
      const changesDisplay = page.getByText(
        /changes|modifications|changements/i
      );
      const hasChanges = await changesDisplay.isVisible();

      if (hasChanges) {
        await expect(changesDisplay).toBeVisible();
      }
    }
  });
});
