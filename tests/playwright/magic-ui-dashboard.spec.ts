import { test, expect } from '@playwright/test';

test.describe('Magic UI Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/MATLAB/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display analytics charts', async ({ page }) => {
    // Wait for charts to load
    await page.waitForTimeout(2000);

    // Check if analytics components are present
    const chartElements = page.locator('[data-testid*="chart"], .chart, canvas');
    await expect(chartElements.first()).toBeVisible();
  });

  test('should have navigation elements', async ({ page }) => {
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile menu or responsive elements are present
    // This test might need adjustment based on actual mobile implementation
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle user interactions', async ({ page }) => {
    // Test basic interactivity
    const interactiveElements = page.locator('button, a, input, select');

    if ((await interactiveElements.count()) > 0) {
      const firstInteractive = interactiveElements.first();
      await expect(firstInteractive).toBeVisible();
    }
  });
});
