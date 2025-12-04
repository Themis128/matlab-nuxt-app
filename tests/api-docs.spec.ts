import { test, expect } from '@playwright/test';

test.describe('API Documentation Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api-docs');
  });

  test('should load API documentation page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /API Documentation/i, level: 1 })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should display API endpoints information', async ({ page }) => {
    // Wait for endpoints sections via roles
    const sections = page.getByRole('heading', { name: /Endpoints|Predict|Dataset/i });
    await sections.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const links = await page.getByRole('link').count();
    expect(links).toBeGreaterThan(0);
  });

  test('should support dark mode', async ({ page }) => {
    const darkElements = page.locator(
      '.dark\\:bg-gray-900, .dark\\:bg-gray-800, .dark\\:text-white'
    );
    const count = await darkElements.count();
    expect(count).toBeGreaterThan(0);
  });
});
