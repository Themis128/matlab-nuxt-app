import { test, expect } from '@playwright/test';

test.describe('Search & Filter Flow', () => {
  test('Search for models by brand and RAM', async ({ page }) => {
    await page.goto('/search');
    await page.locator('[data-testid="brand-select"]').click();
    await page.locator('li:has-text("Samsung")').click();
    await page.locator('[data-testid="ram-min-input"]').fill('8');
    await page.locator('[data-testid="ram-max-input"]').fill('12');
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('.model-card')).not.toHaveCount(0);
  });

  test('Pagination works and shows more results', async ({ page }) => {
    await page.goto('/search');
    await page.locator('[data-testid="search-button"]').click();
    const nextBtn = page.locator('[data-testid="pagination-next"]');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await expect(page.locator('.model-card')).toBeVisible();
    }
  });

  test('Invalid filter shows empty state', async ({ page }) => {
    await page.goto('/search');
    await page.locator('[data-testid="ram-min-input"]').fill('100');
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.getByText('No models found matching your criteria')).toBeVisible();
  });
});
