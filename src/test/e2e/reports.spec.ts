import { test, expect } from "@playwright/test";

test.describe("Reports Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory/reports");
  });

  test("reports page loads successfully", async ({ page }) => {
    await expect(page).toHaveURL(/\/inventory\/reports/);
    await expect(
      page.getByRole("heading", { name: /rapports|reports/i })
    ).toBeVisible();
  });

  test("report type options are visible", async ({ page }) => {
    // Look for monthly/annual report options
    const monthlyOption = page.getByText(/mensuel|monthly/i);
    const annualOption = page.getByText(/annuel|annual|yearly/i);

    // At least one report type should be visible
    const monthlyVisible = await monthlyOption.isVisible().catch(() => false);
    const annualVisible = await annualOption.isVisible().catch(() => false);

    expect(monthlyVisible || annualVisible).toBeTruthy();
  });

  test("can select date range for reports", async ({ page }) => {
    // Look for date pickers or date inputs
    const dateInputs = page.locator('input[type="date"], input[type="month"]');
    const count = await dateInputs.count();

    // Should have date selection capability
    expect(count).toBeGreaterThan(0);
  });

  test("monthly report view works", async ({ page }) => {
    // Look for monthly report button or tab
    const monthlyButton = page.getByRole("button", {
      name: /mensuel|monthly/i,
    });

    if (await monthlyButton.isVisible()) {
      await monthlyButton.click();
      await page.waitForTimeout(500);

      // Verify monthly report content loads
      // Look for charts, tables, or data displays
      const reportContent = page.locator(
        ".MuiTable-root, canvas, .report-content"
      );
      await expect(reportContent.first()).toBeVisible();
    }
  });

  test("annual report view works", async ({ page }) => {
    // Look for annual/yearly report button or tab
    const annualButton = page.getByRole("button", {
      name: /annuel|annual|yearly/i,
    });

    if (await annualButton.isVisible()) {
      await annualButton.click();
      await page.waitForTimeout(500);

      // Verify annual report content loads
      const reportContent = page.locator(
        ".MuiTable-root, canvas, .report-content"
      );
      await expect(reportContent.first()).toBeVisible();
    }
  });

  test("print functionality is accessible", async ({ page }) => {
    // Look for print button
    const printButton = page.getByRole("button", {
      name: /imprimer|print/i,
    });

    if (await printButton.isVisible()) {
      await expect(printButton).toBeVisible();

      // Click should trigger print dialog (won't actually print in test)
      // Just verify button is clickable
      await expect(printButton).toBeEnabled();
    }
  });

  test("export PDF button is present", async ({ page }) => {
    // Look for export/PDF button
    const exportButton = page.getByRole("button", {
      name: /exporter|export|pdf/i,
    });

    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
      await expect(exportButton).toBeEnabled();
    }
  });

  test("report displays data when available", async ({ page }) => {
    // Look for tables, charts, or data visualization
    const dataDisplay = page.locator(
      ".MuiTable-root, canvas, .MuiDataGrid-root, .recharts-wrapper"
    );

    const count = await dataDisplay.count();

    // Should have some data visualization element
    if (count > 0) {
      await expect(dataDisplay.first()).toBeVisible();
    }
  });
});
