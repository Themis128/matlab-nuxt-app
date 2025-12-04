import { test, expect } from '@playwright/test';

test.describe('Explore Dataset Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore');
  });

  test('should load explore page with heading', async ({ page }) => {
    await expect(page.locator('text=Explore Dataset')).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator('text=/Discover insights from \\d+\\+ mobile phone models/i')
    ).toBeVisible();
  });

  test('should display dataset statistics cards', async ({ page }) => {
    // Look for Total Models card
    await expect(page.locator('text=Total Models')).toBeVisible({ timeout: 10000 });

    // Check for numerical values
    const statsNumbers = page.locator('text=/^\\d{3,4}$/').first();
    await expect(statsNumbers).toBeVisible({ timeout: 5000 });
  });

  test('should show last updated date', async ({ page }) => {
    await expect(page.locator('text=/Last updated:/i')).toBeVisible({ timeout: 10000 });
  });

  test('should display multiple statistic cards', async ({ page }) => {
    const cards = page.locator('.bg-white.dark\\:bg-gray-800.rounded-lg.shadow-sm');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should have responsive layout', async ({ page }) => {
    // Check for grid layout
    const gridElements = page.locator('[class*="grid"]');
    await expect(gridElements.first()).toBeVisible({ timeout: 10000 });
  });

  test('should support dark mode', async ({ page }) => {
    const darkElements = page.locator(
      '.dark\\:bg-gray-900, .dark\\:bg-gray-800, .dark\\:text-white'
    );
    const count = await darkElements.count();
    expect(count).toBeGreaterThan(0);
  });
});
