import { test, expect } from "@playwright/test";

test.describe("Localization", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("switch between French and English", async ({ page }) => {
    // Default should be French based on project settings
    const loginHeader = page.getByRole("heading");

    // Check for French (Se connecter)
    await expect(loginHeader).toContainText(/Se connecter/i);

    // Switch to English
    const enButton = page.getByRole("button", { name: "EN" });
    await enButton.click();

    // Check for English (Sign In)
    await expect(loginHeader).toContainText(/Sign In/i);

    // Switch back to French
    const frButton = page.getByRole("button", { name: "FR" });
    await frButton.click();
    await expect(loginHeader).toContainText(/Se connecter/i);
  });

  test("language persistence across navigation", async ({ page }) => {
    // Switch to English
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.getByRole("heading")).toContainText(/Sign In/i);

    // Navigate to Signup
    await page
      .getByRole("link", { name: /sign\s?up|inscrivez|compte/i })
      .click();

    // Header should still be in English
    await expect(page.getByRole("heading")).toContainText(
      /Create\s(an\s)?Account/i
    );

    // Footer link should be in English
    await expect(page.getByRole("link", { name: /Sign In/i })).toBeVisible();
  });

  test("edit button localization", async ({ page }) => {
    // Go to inventory
    await page.goto("/inventory");

    // Wait for initial load
    await page
      .getByRole("progressbar")
      .waitFor({ state: "hidden", timeout: 15000 })
      .catch(() => {});

    // Ensure we have at least one item to test the edit button
    const editButtonFr = page.getByLabel(/modifier l'article/i).first();

    if (!(await editButtonFr.isVisible())) {
      // Create a test item if none exists
      await page
        .getByRole("button", { name: /ajouter|add/i })
        .first()
        .click();
      const itemName = `Test Item ${Date.now()}`;
      await page.getByTestId("item-name-input").fill(itemName);

      // Select category
      const categoryInput = page.getByTestId("item-category-input");
      await categoryInput.click();
      await page.waitForTimeout(500); // Wait for options

      // Select first option or fallback
      const firstOption = page.getByRole("option").first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
      } else {
        await categoryInput.fill("General");
      }

      await page
        .getByRole("button", { name: /enregistrer|save/i })
        .first()
        .click();
      await page.waitForTimeout(1000);

      // Search for the item to ensure it's visible
      await page
        .getByRole("textbox", { name: /rechercher|search/i })
        .fill(itemName);
      await page.waitForTimeout(500);
    }

    // Now check for French button
    await expect(editButtonFr).toBeVisible();

    // Switch to English
    const enButton = page.getByRole("button", { name: "EN" });
    await enButton.click();

    // Wait for language switch to be reflected in state
    await expect(enButton).toHaveAttribute("aria-pressed", "true");

    // Button should now be in English - use getByLabel as it's more direct for aria-label
    const editButtonEn = page.getByLabel(/edit item/i).first();
    await expect(editButtonEn).toBeVisible();

    // Click it to ensure it opens the dialog
    await editButtonEn.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Click cancel to close
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
