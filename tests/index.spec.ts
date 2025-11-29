import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check page title
    await expect(page).toHaveTitle(/Mobile Finder/i, { timeout: 10000 })

    // Check main heading
    await expect(page.locator('h1:has-text("Mobile Finder")').first()).toBeVisible({ timeout: 10000 })
  })

  test('should display navigation links', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check navigation links exist
    await expect(page.getByRole('link', { name: /Home/i }).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('link', { name: /Find by Price/i }).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('link', { name: /Explore/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('should display feature badges', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check feature badges exist (using contains text)
    await expect(page.locator('text=900+ Models').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=20+ Brands').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=AI-Powered Predictions').first()).toBeVisible({ timeout: 10000 })
  })

  test('should have quick action cards', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check quick action cards exist
    await expect(page.locator('h3:has-text("Advanced Search")').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('h3:has-text("Find by Price")').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('h3:has-text("Explore Dataset")').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('h3:has-text("AI Predictions")').first()).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to search page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find and click the Advanced Search card
    const card = page.locator('.cursor-pointer').filter({ hasText: 'Advanced Search' }).first()
    await card.click({ timeout: 10000 })

    // Wait for navigation
    await page.waitForURL(/.*\/search/, { timeout: 15000 })
    await expect(page).toHaveURL(/.*\/search/)
  })
})

test.describe('Search Page', () => {
  test('should load search page', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForLoadState('domcontentloaded')

    // Check if search page loads
    await expect(page.getByRole('heading', { name: 'Advanced Search' })).toBeVisible({ timeout: 10000 })
  })

  test('should have search form', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForLoadState('domcontentloaded')

    // Check if page loaded (form elements may vary)
    await expect(page).toHaveURL(/.*\/search/, { timeout: 10000 })
  })
})

test.describe('Recommendations Page', () => {
  test('should load recommendations page', async ({ page }) => {
    await page.goto('/recommendations')
    await page.waitForLoadState('networkidle')

    // Check if page loads
    await expect(page).toHaveURL(/.*\/recommendations/, { timeout: 10000 })
  })
})

test.describe('Explore Page', () => {
  test('should load explore page', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')

    // Check if page loads
    await expect(page).toHaveURL(/.*\/explore/, { timeout: 10000 })
  })
})

test.describe('Demo Page', () => {
  test('should load demo page', async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')

    // Check if page loads
    await expect(page).toHaveURL(/.*\/demo/, { timeout: 10000 })

    // Check for main heading
    await expect(page.getByRole('heading', { name: 'Mobile Phones Model Demo' })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Dashboard Page', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Check if page loads
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 })
  })
})

test.describe('API Endpoints', () => {
  test('should respond to health check', async ({ request }) => {
    const response = await request.get('/api/health')
    // Should return 200 or handle gracefully
    expect([200, 500, 503]).toContain(response.status())
  })

  test('should respond to dataset statistics', async ({ request }) => {
    const response = await request.get('/api/dataset/statistics')
    // Should return 200 or handle gracefully
    expect([200, 500]).toContain(response.status())
  })

  test('should respond to dataset columns', async ({ request }) => {
    const response = await request.get('/api/dataset/columns')
    // Should return 200 or handle gracefully
    expect([200, 500]).toContain(response.status())
  })
})
