import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load home page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Mobile Finder/)

    // Check main heading
    await expect(page.locator('h1')).toContainText('Mobile Finder')

    // Check navigation links exist
    await expect(page.locator('a[href="/demo"]')).toBeVisible()
    await expect(page.locator('a[href="/search"]')).toBeVisible()
    await expect(page.locator('a[href="/explore"]')).toBeVisible()
    await expect(page.locator('a[href="/compare"]')).toBeVisible()
    await expect(page.locator('a[href="/recommendations"]')).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    // Test navigation to demo page
    await page.locator('a[href="/demo"]').click()
    await expect(page).toHaveURL(/.*\/demo/)
    await expect(page.locator('h1')).toContainText('AI Predictions Lab')

    // Go back to home
    await page.goto('/')

    // Test navigation to search page
    await page.locator('a[href="/search"]').click()
    await expect(page).toHaveURL(/.*\/search/)

    // Go back to home
    await page.goto('/')

    // Test navigation to explore page
    await page.locator('a[href="/explore"]').click()
    await expect(page).toHaveURL(/.*\/explore/)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that navigation is still accessible
    await expect(page.locator('a[href="/demo"]')).toBeVisible()

    // Check that content is readable
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /Mobile Finder/)

    // Check meta keywords
    const metaKeywords = page.locator('meta[name="keywords"]')
    await expect(metaKeywords).toHaveAttribute('content', /mobile.*phone/)
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
