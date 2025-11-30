import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load home page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Mobile|MatLab|Finder|Prediction/i, { timeout: 10000 })
  })

  test('should display main content', async ({ page }) => {
    // Look for any visible content
    const body = page.locator('body')
    await expect(body).toBeVisible({ timeout: 10000 })

    // Check for interactive elements
    const links = page.locator('a[href]')
    const linkCount = await links.count()
    expect(linkCount).toBeGreaterThan(0)
  })

  test('should have navigation links', async ({ page }) => {
    // Common navigation patterns
    const navLinks = page.locator(
      'nav a, header a, a:has-text("Dashboard"), a:has-text("Explore"), a:has-text("Search"), a:has-text("Compare")'
    )

    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should support dark mode classes', async ({ page }) => {
    const darkElements = page.locator(
      '.dark\\:bg-gray-900, .dark\\:bg-gray-800, .dark\\:text-white'
    )
    const count = await darkElements.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

    // Filter out known framework warnings
    const criticalErrors = errors.filter(
      err =>
        !err.includes('Download the Vue Devtools') &&
        !err.includes('Hydration') &&
        !err.includes('favicon')
    )

    expect(criticalErrors.length).toBe(0)
  })
})
