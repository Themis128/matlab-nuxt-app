import { test, expect } from '@playwright/test';

test.describe('Advanced Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/advanced');
  });

  test('should load advanced page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Advanced Model Predictions');
  });

  test('should display model selection cards', async ({ page }) => {
    await expect(page.locator('text=Sklearn Price')).toBeVisible();
    await expect(page.locator('text=EUR Price Model')).toBeVisible();
  });

  test('should show prediction form', async ({ page }) => {
    await expect(page.locator('text=📊 Phone Specifications')).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'RAM (GB)' })).toBeVisible();
  });

  // Note: Prediction tests moved to simple-advanced.spec.ts due to API performance issues
  // The advanced page image functionality is fully tested in simple-advanced.spec.ts
});
