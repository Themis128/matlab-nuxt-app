import { test, expect } from '@playwright/test';

test.describe('AI Predictions Demo', () => {
  test('Demo page loads and form is visible', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.locator('form')).toBeVisible();
  });

  test('Submitting valid prediction shows result', async ({ page }) => {
    await page.goto('/demo');
    await page.locator('[data-testid="ram-input"]').fill('8');
    await page.locator('[data-testid="battery-input"]').fill('5000');
    await page.locator('[data-testid="predict-button"]').click();
    await expect(page.locator('.prediction-result')).toBeVisible();
  });
});
