import { test, expect } from '@playwright/test'

test.describe('Compare Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compare')
  })

  test('should load compare page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Compare Models")')).toBeVisible({ timeout: 10000 })
  })

  test('should have comparison functionality', async ({ page }) => {
    // Look for comparison-related elements
    const compareElements = page.locator('text=/compare|select|choose/i')
    const count = await compareElements.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should support dark mode', async ({ page }) => {
    const darkElements = page.locator(
      '.dark\\:bg-gray-900, .dark\\:bg-gray-800, .dark\\:text-white'
    )
    const count = await darkElements.count()
    expect(count).toBeGreaterThan(0)
  })
})
