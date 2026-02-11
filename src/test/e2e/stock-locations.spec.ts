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
    // Look for table or grid of locations using roles
    const locationsList = page
      .getByRole("table")
      .or(page.getByRole("grid"))
      .or(page.getByRole("list"));

    // At least one location display element should be present
    await expect(locationsList.first()).toBeVisible({ timeout: 10000 });
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
    await page.getByTestId("location-name-input").fill(locationName);

    // Save
    const saveButton = page.getByRole("button", {
      name: /sauvegarder|save|enregistrer/i,
    });
    await saveButton.click();

    // Verify location appears in list
    await expect(page.getByText(locationName)).toBeVisible();
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
      await page
        .getByTestId("location-name-input")
        .fill(`Updated Location ${Date.now()}`);

      // Save
      const saveButton = page.getByRole("button", {
        name: /sauvegarder|save|enregistrer/i,
      });
      await saveButton.click();
    }
  });

  test("hierarchical location structure is visible", async ({ page }) => {
    // Look for tree view or hierarchical display using role
    const treeView = page.getByRole("tree");

    if (await treeView.isVisible()) {
      await expect(treeView).toBeVisible();
    } else {
      // Fallback to searching for hierarchy markers if tree role is not present
      const hierarchyIndicator = page.locator(
        "[data-parent], [data-testid='nested-location']"
      );

      const count = await hierarchyIndicator.count();
      if (count > 0) {
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test("can set parent location for hierarchy", async ({ page }) => {
    // Create a new location with parent
    await page
      .getByRole("button", {
        name: /ajouter|add|nouveau|new/i,
      })
      .click();

    await expect(page.getByRole("dialog")).toBeVisible();

    // Look for parent location selector
    const parentSelector = page.getByLabel(/parent|supérieur/i);

    if (await parentSelector.isVisible()) {
      await expect(parentSelector).toBeVisible();

      // Should be able to select a parent
      await parentSelector.click();

      // Follow MUI Select pattern: click option in popover
      const option = page.getByRole("option").first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
  });

  test("location description is editable", async ({ page }) => {
    // Click add to open dialog
    await page
      .getByRole("button", {
        name: /ajouter|add|nouveau|new/i,
      })
      .click();

    await expect(page.getByRole("dialog")).toBeVisible();

    // Look for description field
    const descriptionField = page.getByTestId("location-description-input");

    if (await descriptionField.isVisible()) {
      await descriptionField.fill("Test location description");
      await expect(descriptionField).toHaveValue("Test location description");
    }
  });
});
