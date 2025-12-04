import { test, expect } from '@playwright/test';

test.describe('Advanced Page - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/advanced');
  });

  test('should load advanced page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Advanced Model Predictions');
    await expect(page.locator('text=Advanced AI Models')).toBeVisible();
    // Check for rocket emoji in header (not button)
    await expect(page.locator('span.text-2xl').filter({ hasText: '🚀' })).toBeVisible();
  });

  test('should have working model selector', async ({ page }) => {
    // Check model selector cards exist (these are clickable divs, not select elements)
    await expect(page.locator('text=Sklearn Price')).toBeVisible();
    await expect(page.locator('text=EUR Price Model')).toBeVisible();
    await expect(page.locator('text=INR Price Model')).toBeVisible();

    // Check currency selector (actual select element)
    const currencySelector = page.locator('select').filter({ hasText: 'USD' }).first();
    await expect(currencySelector).toBeVisible();
  });

  test('should have complete prediction form', async ({ page }) => {
    // Check all required form fields exist
    await expect(page.locator('input[placeholder="8"]')).toBeVisible(); // RAM
    await expect(page.locator('input[placeholder="4500"]')).toBeVisible(); // Battery
    await expect(page.locator('input[placeholder="6.5"]')).toBeVisible(); // Screen
    await expect(page.locator('input[placeholder="180"]')).toBeVisible(); // Weight
    await expect(page.locator('input[placeholder="2023"]')).toBeVisible(); // Year

    // Check brand selector exists
    await expect(page.locator('select').filter({ hasText: 'Samsung' })).toBeVisible();

    // Check predict button exists (but may be disabled)
    const predictButton = page.locator('text=🚀 Run Advanced Prediction');
    await expect(predictButton).toBeVisible();
  });

  test('should have proper page structure', async ({ page }) => {
    // Check for header section
    await expect(page.locator('text=Advanced Model Predictions')).toBeVisible();

    // Check for model selection section
    await expect(page.locator('text=🎯 Select AI Model')).toBeVisible();

    // Check for form section
    await expect(page.locator('text=📊 Phone Specifications')).toBeVisible();

    // Check for navigation links
    await expect(page.locator('text=Basic Predictions')).toBeVisible();
    await expect(page.locator('text=Smart Search')).toBeVisible();
    await expect(page.locator('text=Compare Models')).toBeVisible();
  });

  test('should show proper initial state', async ({ page }) => {
    // Check that results section is not visible initially
    await expect(page.locator('text=📱 Recommended Phone Images')).not.toBeVisible();

    // Check that predict button is disabled initially (no form data)
    const predictButton = page.locator('text=🚀 Run Advanced Prediction');
    const isDisabled = await predictButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('should allow form data entry', async ({ page }) => {
    // Test that form fields can be filled (functionality verification)
    await page.locator('input[placeholder="8"]').fill('12'); // RAM
    await page.locator('input[placeholder="4500"]').fill('5000'); // Battery
    await page.locator('input[placeholder="6.5"]').fill('6.8'); // Screen
    await page.locator('input[placeholder="180"]').fill('200'); // Weight
    await page.locator('input[placeholder="2023"]').fill('2024'); // Year
    await page.locator('select').filter({ hasText: 'Samsung' }).selectOption('Apple');

    // Verify values were entered
    await expect(page.locator('input[placeholder="8"]')).toHaveValue('12');
    await expect(page.locator('input[placeholder="4500"]')).toHaveValue('5000');
    await expect(page.locator('input[placeholder="6.5"]')).toHaveValue('6.8');
    await expect(page.locator('input[placeholder="180"]')).toHaveValue('200');
    await expect(page.locator('input[placeholder="2023"]')).toHaveValue('2024');

    // Brand selector should have Apple selected
    const brandSelect = page.locator('select').filter({ hasText: 'Apple' });
    await expect(brandSelect).toBeVisible();
  });
});
