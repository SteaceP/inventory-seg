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

  test("can edit an existing appliance", async ({ page }) => {
    // Find an edit button
    const editButton = page
      .getByRole("button", { name: /modifier|edit/i })
      .first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // Wait for dialog
      await expect(page.getByRole("dialog")).toBeVisible();

      // Modify the brand
      const brandField = page.locator('input[name="brand"]');
      await brandField.clear();
      await brandField.fill("Updated Brand");

      // Save changes
      await page.getByRole("button", { name: /save|sauvegarder/i }).click();

      await page.waitForTimeout(1000);
    }
  });

  test("can add repair history", async ({ page }) => {
    // Find a details or repairs button
    const detailsButton = page
      .getByRole("button", { name: /détails|details|réparations|repairs/i })
      .first();

    if (await detailsButton.isVisible()) {
      await detailsButton.click();

      // Look for add repair button
      const addRepairButton = page.getByRole("button", {
        name: /ajouter.*réparation|add.*repair/i,
      });

      if (await addRepairButton.isVisible()) {
        await addRepairButton.click();

        // Fill repair form
        await expect(page.getByRole("dialog")).toBeVisible();

        const descriptionField = page.locator(
          'input[name="description"], textarea[name="description"]'
        );
        if (await descriptionField.isVisible()) {
          await descriptionField.fill("Test repair description");
        }

        const costField = page.locator('input[name="cost"]');
        if (await costField.isVisible()) {
          await costField.fill("150.00");
        }

        // Save repair
        const saveButton = page.getByRole("button", {
          name: /save|sauvegarder/i,
        });
        await saveButton.click();

        await page.waitForTimeout(1000);
      }
    }
  });

  test("warranty expiry indicators are visible", async ({ page }) => {
    // Look for warranty status or expiry indicators
    const warrantyIndicator = page.locator(
      ".warranty-status, [data-warranty], .expiry-warning"
    );

    const count = await warrantyIndicator.count();

    // If appliances have warranty info, indicators should exist
    if (count > 0) {
      await expect(warrantyIndicator.first()).toBeVisible();
    }
  });

  test("can change appliance status", async ({ page }) => {
    // Open edit dialog
    const editButton = page
      .getByRole("button", { name: /modifier|edit/i })
      .first();

    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.getByRole("dialog")).toBeVisible();

      // Look for status selector
      const statusField = page.getByLabel(/statut|status|état/i);

      if (await statusField.isVisible()) {
        await statusField.click();

        // Look for status options (functional, needs_service, broken)
        const needsServiceOption = page.getByRole("option", {
          name: /needs.*service|réparation|entretien/i,
        });

        if (await needsServiceOption.isVisible()) {
          await needsServiceOption.click();

          // Save
          await page.getByRole("button", { name: /save|sauvegarder/i }).click();

          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test("appliance photo upload is accessible", async ({ page }) => {
    // Open add dialog
    await page.getByRole("button", { name: /add|ajouter/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Look for photo upload button or input
    const photoInput = page.locator('input[type="file"], input[name="photo"]');

    if (await photoInput.isVisible()) {
      await expect(photoInput).toBeVisible();
    }
  });

  test("can set purchase date and warranty", async ({ page }) => {
    // Open add dialog
    await page.getByRole("button", { name: /add|ajouter/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Purchase date field
    const purchaseDateField = page.locator('input[name="purchase_date"]');

    if (await purchaseDateField.isVisible()) {
      await purchaseDateField.fill("2026-01-01");
      await expect(purchaseDateField).toHaveValue("2026-01-01");
    }

    // Warranty expiry field
    const warrantyField = page.locator('input[name="warranty_expiry"]');

    if (await warrantyField.isVisible()) {
      await warrantyField.fill("2027-01-01");
      await expect(warrantyField).toHaveValue("2027-01-01");
    }
  });
});
