import { test, expect } from '@playwright/test'

test.describe('Recommendations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recommendations')
  })

  test('should load recommendations page', async ({ page }) => {
    await expect(page.locator('text=/Recommendation/i')).toBeVisible({ timeout: 10000 })
  })

  test('should display recommendation content', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

    // Check for recommendation-related content
    const hasContent = await page.locator('text=/recommend|suggest|phone|mobile|model/i').count()
    expect(hasContent).toBeGreaterThan(0)
  })

  test('should have interactive elements', async ({ page }) => {
    // Look for buttons, inputs, or cards
    const interactiveElements = page.locator('button, input, a, [role="button"]')
    const count = await interactiveElements.count()
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
