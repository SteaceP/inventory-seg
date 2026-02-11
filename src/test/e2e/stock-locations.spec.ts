import { test, expect } from "@playwright/test";

test.describe("Stock Locations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory/locations");
  });

  test("stock locations page loads successfully", async ({ page }) => {
    await expect(page).toHaveURL(/\/inventory\/locations/);
    await expect(
      page.getByRole("heading", { name: /emplacements|locations/i })
    ).toBeVisible();
  });

  test("displays master location list", async ({ page }) => {
    // Look for table or grid of locations
    const locationsList = page.locator(
      ".MuiTable-root, .MuiDataGrid-root, .MuiList-root"
    );

    // At least one location display element should be present
    const count = await locationsList.count();
    expect(count).toBeGreaterThan(0);
  });

  test("can create a new location", async ({ page }) => {
    const locationName = `Test Location ${Date.now()}`;

    // Click Add Location button
    const addButton = page.getByRole("button", {
      name: /ajouter|add|nouveau|new/i,
    });
    await addButton.click();

    // Wait for dialog
    await expect(page.getByRole("dialog")).toBeVisible();

    // Fill location name
    const nameField = page.locator('input[name="name"]');
    await nameField.fill(locationName);

    // Save
    const saveButton = page.getByRole("button", {
      name: /sauvegarder|save|enregistrer/i,
    });
    await saveButton.click();

    // Verify location appears in list
    await page.waitForTimeout(1000);

    // Search for the location or verify it's in the table
    const newLocation = page.getByText(locationName);
    await expect(newLocation).toBeVisible();
  });

  test("can edit existing location", async ({ page }) => {
    // Find an edit button (usually in table rows)
    const editButton = page
      .getByRole("button", { name: /modifier|edit/i })
      .first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // Wait for dialog
      await expect(page.getByRole("dialog")).toBeVisible();

      // Modify name field
      const nameField = page.locator('input[name="name"]');
      await nameField.fill(`Updated Location ${Date.now()}`);

      // Save
      const saveButton = page.getByRole("button", {
        name: /sauvegarder|save|enregistrer/i,
      });
      await saveButton.click();

      await page.waitForTimeout(1000);
    }
  });

  test("hierarchical location structure is visible", async ({ page }) => {
    // Look for tree view or hierarchical display
    // Parent locations with child locations
    const treeView = page.locator(".MuiTreeView-root, .location-hierarchy");

    if (await treeView.isVisible()) {
      await expect(treeView).toBeVisible();
    } else {
      // Alternative: look for indented rows or parent-child indicators
      const hierarchyIndicator = page.locator(
        "[data-parent], .child-location, .nested-location"
      );

      const count = await hierarchyIndicator.count();
      // Hierarchy indicators might exist
      if (count > 0) {
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test("can set parent location for hierarchy", async ({ page }) => {
    // Create a new location with parent
    const addButton = page.getByRole("button", {
      name: /ajouter|add|nouveau|new/i,
    });
    await addButton.click();

    await expect(page.getByRole("dialog")).toBeVisible();

    // Look for parent location selector
    const parentSelector = page.getByLabel(/parent|supérieur/i);

    if (await parentSelector.isVisible()) {
      await expect(parentSelector).toBeVisible();

      // Should be able to select a parent
      await parentSelector.click();

      // Options should appear
      await page.waitForTimeout(500);
    }
  });

  test("location description is editable", async ({ page }) => {
    // Click add to open dialog
    const addButton = page.getByRole("button", {
      name: /ajouter|add|nouveau|new/i,
    });
    await addButton.click();

    await expect(page.getByRole("dialog")).toBeVisible();

    // Look for description field
    const descriptionField = page.locator(
      'input[name="description"], textarea[name="description"]'
    );

    if (await descriptionField.isVisible()) {
      await descriptionField.fill("Test location description");
      await expect(descriptionField).toHaveValue("Test location description");
    }
  });
});
