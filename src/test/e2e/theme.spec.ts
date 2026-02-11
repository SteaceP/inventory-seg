import { test, expect } from "@playwright/test";

test.describe("Theme Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("dark mode toggle changes theme", async ({ page }) => {
    // Get the html or body element to check theme
    const htmlElement = page.locator("html, body");

    // Find dark mode toggle
    const darkModeToggle = page.getByRole("checkbox", {
      name: /mode sombre|dark mode|thème/i,
    });

    if (await darkModeToggle.isVisible()) {
      // Check initial state
      const initialChecked = await darkModeToggle.isChecked();

      // Get initial background color or theme class
      const initialBg = await htmlElement.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );

      // Toggle dark mode
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition

      // Verify toggle state changed
      const newChecked = await darkModeToggle.isChecked();
      expect(newChecked).toBe(!initialChecked);

      // Verify background color changed
      const newBg = await htmlElement.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );
      expect(newBg).not.toBe(initialBg);
    }
  });

  test("theme persists across page refresh", async ({ page }) => {
    // Enable dark mode
    const darkModeToggle = page.getByRole("checkbox", {
      name: /mode sombre|dark mode|thème/i,
    });

    if (await darkModeToggle.isVisible()) {
      // Ensure dark mode is on
      if (!(await darkModeToggle.isChecked())) {
        await darkModeToggle.click();
        await page.waitForTimeout(500);
      }

      // Reload page
      await page.reload();

      // Verify dark mode is still on
      const reloadedToggle = page.getByRole("checkbox", {
        name: /mode sombre|dark mode|thème/i,
      });
      await expect(reloadedToggle).toBeChecked();
    }
  });

  test("theme persists across navigation", async ({ page }) => {
    // Enable dark mode
    const darkModeToggle = page.getByRole("checkbox", {
      name: /mode sombre|dark mode|thème/i,
    });

    if (await darkModeToggle.isVisible()) {
      // Turn on dark mode
      if (!(await darkModeToggle.isChecked())) {
        await darkModeToggle.click();
        await page.waitForTimeout(500);
      }

      // Navigate to different page
      await page.goto("/inventory");

      // Check if dark theme is applied
      const htmlElement = page.locator("html, body");
      const bgColor = await htmlElement.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );

      // Dark mode background should be darker (rgb values closer to 0)
      const isDark =
        bgColor.includes("rgb") &&
        (bgColor.includes("18, 18, 18") || // Common dark bg
          bgColor.includes("33, 33, 33") ||
          bgColor
            .match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
            ?.slice(1)
            .every((n) => parseInt(n) < 50));

      expect(isDark).toBeTruthy();
    }
  });

  test("MUI components render correctly in both themes", async ({ page }) => {
    // Test a MUI button in both themes
    const darkModeToggle = page.getByRole("checkbox", {
      name: /mode sombre|dark mode|thème/i,
    });

    if (await darkModeToggle.isVisible()) {
      // Light theme - get button color
      await page.goto("/inventory");
      const addButton = page.getByRole("button", {
        name: /ajouter|add/i,
      });

      if (await addButton.isVisible()) {
        const lightBg = await addButton.evaluate(
          (el) => window.getComputedStyle(el).backgroundColor
        );

        // Switch to dark theme
        await page.goto("/settings");
        const toggle = page.getByRole("checkbox", {
          name: /mode sombre|dark mode|thème/i,
        });

        if (!(await toggle.isChecked())) {
          await toggle.click();
          await page.waitForTimeout(500);
        }

        // Check button in dark theme
        await page.goto("/inventory");
        const darkButton = page.getByRole("button", {
          name: /ajouter|add/i,
        });

        if (await darkButton.isVisible()) {
          const darkBg = await darkButton.evaluate(
            (el) => window.getComputedStyle(el).backgroundColor
          );

          // Colors should be different
          expect(darkBg).not.toBe(lightBg);
        }
      }
    }
  });
});
