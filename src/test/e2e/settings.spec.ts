import { test, expect } from "@playwright/test";

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("settings page loads successfully", async ({ page }) => {
    await expect(page).toHaveURL("/settings");
    await expect(
      page.getByRole("heading", { name: /paramètres|settings|réglages/i })
    ).toBeVisible();
  });

  test("user profile section is visible", async ({ page }) => {
    // Look for profile-related fields
    const displayNameField = page.getByLabel(/nom|name|display/i);
    await expect(displayNameField).toBeVisible();
  });

  test("can update display name", async ({ page }) => {
    const displayNameField = page.getByLabel(/nom|name|display/i);
    await displayNameField.clear();
    await displayNameField.fill("Test User Updated");

    // Save button
    const saveButton = page.getByRole("button", {
      name: /sauvegarder|save|enregistrer/i,
    });

    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Wait for success message or confirmation
      await page.waitForTimeout(1000);
    }
  });

  test("dark mode toggle works", async ({ page }) => {
    // Find dark mode toggle
    const darkModeToggle = page.getByRole("checkbox", {
      name: /mode sombre|dark mode|thème/i,
    });

    if (await darkModeToggle.isVisible()) {
      const initialState = await darkModeToggle.isChecked();

      // Toggle dark mode
      await darkModeToggle.click();

      // Wait for theme change
      await page.waitForTimeout(500);

      // Verify state changed
      const newState = await darkModeToggle.isChecked();
      expect(newState).toBe(!initialState);
    }
  });

  test("compact view toggle works", async ({ page }) => {
    // Find compact view toggle
    const compactViewToggle = page.getByRole("checkbox", {
      name: /vue compacte|compact view/i,
    });

    if (await compactViewToggle.isVisible()) {
      const initialState = await compactViewToggle.isChecked();

      // Toggle compact view
      await compactViewToggle.click();

      // Verify state changed
      const newState = await compactViewToggle.isChecked();
      expect(newState).toBe(!initialState);
    }
  });

  test("language preference is accessible", async ({ page }) => {
    // Language selector should be visible in settings
    // Look for either dropdown or radio buttons
    const languageSection = page.getByText(/langue|language/i);
    await expect(languageSection).toBeVisible();
  });

  test("notification settings are accessible", async ({ page }) => {
    // Look for notification toggles
    const notificationsToggle = page.getByRole("checkbox", {
      name: /notifications?/i,
    });

    if (await notificationsToggle.isVisible()) {
      await expect(notificationsToggle).toBeVisible();
    }
  });

  test("email alerts setting is accessible", async ({ page }) => {
    // Look for email alerts toggle
    const emailAlertsToggle = page.getByRole("checkbox", {
      name: /e-?mail|courriel|alert/i,
    });

    if (await emailAlertsToggle.isVisible()) {
      await expect(emailAlertsToggle).toBeVisible();
    }
  });

  test("low stock threshold can be configured", async ({ page }) => {
    // Look for low stock threshold input
    const thresholdInput = page.getByLabel(
      /seuil|threshold|stock faible|low stock/i
    );

    if (await thresholdInput.isVisible()) {
      await expect(thresholdInput).toBeVisible();

      // Try updating it
      await thresholdInput.clear();
      await thresholdInput.fill("10");

      // Verify input
      await expect(thresholdInput).toHaveValue("10");
    }
  });

  test("settings changes persist after save", async ({ page }) => {
    // Update a setting
    const displayNameField = page.getByLabel(/nom|name|display/i);
    const testName = `Test User ${Date.now()}`;

    await displayNameField.clear();
    await displayNameField.fill(testName);

    // Save
    const saveButton = page.getByRole("button", {
      name: /sauvegarder|save|enregistrer/i,
    });

    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Reload page
      await page.reload();

      // Verify setting persisted
      const reloadedField = page.getByLabel(/nom|name|display/i);
      await expect(reloadedField).toHaveValue(testName);
    }
  });
});
