import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load home page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Mobile Finder|MATLAB/i)

    // Check main heading
    await expect(page.locator('h1').first()).toContainText('Mobile Finder', { timeout: 10000 })

    // Check navigation links exist
    await expect(page.locator('a[href="/demo"]').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('a[href="/search"]').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('a[href="/explore"]').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('a[href="/compare"]').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('a[href="/recommendations"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('should have working navigation links', async ({ page }) => {
    // Test navigation to demo page
    const demoLink = page.locator('a[href="/demo"]').filter({ hasText: /AI Predictions|Demo/i }).first()
    await demoLink.click({ timeout: 10000 })
    await expect(page).toHaveURL(/.*\/demo/)
    await expect(page.locator('h1').first()).toContainText(/Mobile Phones Model Demo|AI Predictions/i, { timeout: 10000 })

    // Go back to home
    await page.goto('/')

    // Test navigation to search page
    await page.locator('a[href="/search"]').first().click()
    await expect(page).toHaveURL(/.*\/search/)

    // Go back to home
    await page.goto('/')

    // Test navigation to explore page
    await page.locator('a[href="/explore"]').first().click()
    await expect(page).toHaveURL(/.*\/explore/)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that content is readable
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Check that main content cards are visible
    await expect(page.locator('text=/AI Predictions Demo|Dataset Explorer|Smart Search/i').first()).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /deep learning|mobile|MATLAB|explore/i)
  })

  test('should have working external links', async ({ page }) => {
    // Check for any external links (GitHub, docs, etc.)
    const externalLinks = page.locator('a[href^="http"]')
    const linkCount = await externalLinks.count()

    // If there are external links, test they have proper attributes
    if (linkCount > 0) {
      for (let i = 0; i < linkCount; i++) {
        const link = externalLinks.nth(i)
        await expect(link).toHaveAttribute('target', '_blank')
        await expect(link).toHaveAttribute('rel', /noopener/)
      }
    }
  })
})
