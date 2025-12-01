import { test, expect } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
  })

  test('should load dashboard page with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /AI Model Dashboard/i, level: 1 })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText(/Performance metrics and model analytics/i)).toBeVisible()
  })

  test('should display model performance summary', async ({ page }) => {
    await expect(page.locator('text=Model Performance Summary')).toBeVisible({ timeout: 10000 })
  })

  test('should show model performance cards', async ({ page }) => {
    // Look for performance metrics
    await expect(page.getByText(/Price Prediction/i)).toBeVisible({ timeout: 10000 })

    // Check for percentage indicators
    const percentageText = page.locator('text=/\\d+\\.\\d+%/')
    await expect(percentageText.first()).toBeVisible({ timeout: 5000 })
  })

  test('should display models online indicator', async ({ page }) => {
    await expect(page.getByText(/Models Online/i)).toBeVisible({ timeout: 10000 })

    // Wait for health check to complete before asserting indicator (up to 30s)
    await page.waitForFunction(
      () => {
        const el = document.querySelector('.bg-green-500.rounded-full')
        return !!el
      },
      { timeout: 45000 }
    )

    // There should be 5 status indicators (one per model: Price, RAM, Battery, Brand + preferences/settings)
    // Exclude hidden elements (like the demo test indicator)
    const statusIndicator = page.locator('.bg-green-500.rounded-full:not([style*="display: none"])')
    await expect(statusIndicator).toHaveCount(5)
  })

  test('should have multiple model cards', async ({ page }) => {
    // Wait for cards to load
    const cards = page.locator('.bg-white.dark\\:bg-gray-800.rounded-lg.shadow-sm')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })

    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should support dark mode', async ({ page }) => {
    // Check for dark mode classes
    const darkElements = page.locator('.dark\\:bg-gray-900, .dark\\:bg-gray-800')
    const count = await darkElements.count()
    expect(count).toBeGreaterThan(0)
  })
})
