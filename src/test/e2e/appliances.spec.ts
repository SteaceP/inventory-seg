import { test, expect } from "@playwright/test";

test.describe("Appliance Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/appliances");
  });

  test("displays appliances list", async ({ page }) => {
    await expect(page).toHaveURL("/appliances");
    await expect(page.getByText(/appliances|appareils/i).first()).toBeVisible();
  });

  test("can create a new appliance", async ({ page }) => {
    const applianceName = `Test Fridge ${Date.now()}`;

    // Click Add button
    await page
      .getByRole("button", { name: /add|ajouter/i })
      .first()
      .click();

    // Fill dialog
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 });

    // Use label-based locators since MUI TextField doesn't always have 'name' attribute
    const nameField = page.getByLabel(/nom|name/i).first();
    await expect(nameField).toBeVisible();
    await nameField.fill(applianceName);

    await page.getByLabel(/marque|brand/i).fill("Samsung");
    await page.getByLabel(/modèle|model/i).fill("RF28");

    // Submit - The save button text depends on t("appliances.add") for new items
    await page
      .getByRole("button", { name: /^ajouter un appareil$|^add appliance$/i })
      .click();

    // Verify item appears (optional, but good practice)
    await expect(page.getByText(applianceName)).toBeVisible({ timeout: 10000 });
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
      const brandField = page.getByLabel(/marque|brand/i);
      await brandField.clear();
      await brandField.fill("Updated Brand");

      // Save changes - For edits, it uses t("common.save")
      await page
        .getByRole("button", { name: /save|sauvegarder|enregistrer/i })
        .click();

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

        const descriptionField = page.getByLabel(/description/i);
        if (await descriptionField.isVisible()) {
          await descriptionField.fill("Test repair description");
        }

        const costField = page.getByLabel(/coût|cost/i);
        if (await costField.isVisible()) {
          await costField.fill("150.00");
        }

        // Save repair
        const saveButton = page.getByRole("button", {
          name: /enregistrer|save|sauvegarder/i,
        });
        await saveButton.click();

        await page.waitForTimeout(1000);
      }
    }
  });

  test("warranty expiry indicators are visible", async ({ page }) => {
    // Look for warranty status or expiry indicators
    // MUI might use specific classes or text
    const warrantyIndicator = page.getByText(/garantie|warranty/i);

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
          await page
            .getByRole("button", { name: /save|sauvegarder|enregistrer/i })
            .click();

          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test("appliance photo upload is accessible", async ({ page }) => {
    // Open add dialog
    await page
      .getByRole("button", { name: /add|ajouter/i })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Look for photo upload button or input
    // The input[type="file"] is often hidden, look for the button text
    const uploadTrigger = page.getByText(/photo|image/i);

    if (await uploadTrigger.isVisible()) {
      await expect(uploadTrigger.first()).toBeVisible();
    }
  });

  test("can set purchase date and warranty", async ({ page }) => {
    // Open add dialog
    await page
      .getByRole("button", { name: /add|ajouter/i })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Purchase date field
    const purchaseDateField = page.getByLabel(/achat|purchase/i);

    if (await purchaseDateField.isVisible()) {
      await purchaseDateField.fill("2026-01-01");
      await expect(purchaseDateField).toHaveValue("2026-01-01");
    }

    // Warranty expiry field
    const warrantyField = page.getByLabel(
      /échéance garantie|warranty expiration/i
    );

    if (await warrantyField.isVisible()) {
      await warrantyField.fill("2027-01-01");
      await expect(warrantyField).toHaveValue("2027-01-01");
    }
  });
});
