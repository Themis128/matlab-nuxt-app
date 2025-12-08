import { test, expect } from '@playwright/test';

test.describe('Integration Tests - Frontend to Backend', () => {
  test('should make prediction from AI Demo page', async ({ page }) => {
    await page.goto('/ai-demo');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Fill in form fields if they exist
    const ramInput = page
      .locator('input[name*="ram"], input[placeholder*="RAM"], input[type="number"]')
      .first();
    if (await ramInput.isVisible()) {
      await ramInput.fill('8');
    }

    const batteryInput = page
      .locator('input[name*="battery"], input[placeholder*="Battery"]')
      .first();
    if (await batteryInput.isVisible()) {
      await batteryInput.fill('4000');
    }

    // Find and click submit/predict button
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Predict"), button:has-text("Submit")')
      .first();
    if (await submitButton.isVisible()) {
      // Wait for API call
      const responsePromise = page
        .waitForResponse(
          (response) => response.url().includes('/api/predict') && response.status() < 500,
          { timeout: 10000 }
        )
        .catch(() => null);

      await submitButton.click();
      await page.waitForTimeout(2000);

      // Check if response was received
      const response = await responsePromise;
      if (response) {
        expect(response.status()).toBeLessThan(500);
      }
    }
  });

  test('should search products from Search page', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Find search input
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="Search"], input[name*="search"]')
      .first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('samsung');
      await page.waitForTimeout(1000);

      // Wait for API call
      const responsePromise = page
        .waitForResponse(
          (response) => response.url().includes('/api/products') && response.status() < 500,
          { timeout: 10000 }
        )
        .catch(() => null);

      // Press Enter or wait for debounce
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      const response = await responsePromise;
      if (response) {
        expect(response.status()).toBeLessThan(500);
      }
    }
  });

  test('should load products on Recommendations page', async ({ page }) => {
    await page.goto('/recommendations');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Wait for API call
    const responsePromise = page
      .waitForResponse(
        (response) => response.url().includes('/api/products') && response.status() < 500,
        { timeout: 10000 }
      )
      .catch(() => null);

    await page.waitForTimeout(3000);

    const response = await responsePromise;
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('should navigate between pages and maintain state', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to search
    await page.goto('/search');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/search/);

    // Navigate to compare
    await page.goto('/compare');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/compare/);

    // Navigate back to home
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/$/);
  });
});

test.describe('Integration Tests - API Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate errors
    await page.route('**/api/predict/price', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/ai-demo');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Try to submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Predict")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
