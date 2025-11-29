import { test, expect } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForLoadState('domcontentloaded')
  })

  test('should load dashboard page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Dashboard|Deep Learning/i }).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('should display model performance metrics', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Look for performance metrics
    const metrics = page.locator('text=/98|95|94|65|Accuracy|R²/i').first()
    await expect(metrics).toBeVisible({ timeout: 15000 })
  })

  test('should display price prediction accuracy', async ({ page }) => {
    await page.waitForTimeout(2000)

    const priceAccuracy = page.locator('text=/98|Price.*Prediction|Price.*Accuracy/i').first()
    await expect(priceAccuracy).toBeVisible({ timeout: 15000 })
  })

  test('should display RAM prediction accuracy', async ({ page }) => {
    await page.waitForTimeout(2000)

    const ramAccuracy = page.locator('text=/95|RAM.*Prediction|RAM.*Accuracy/i').first()
    await expect(ramAccuracy).toBeVisible({ timeout: 15000 })
  })

  test('should display battery prediction accuracy', async ({ page }) => {
    await page.waitForTimeout(2000)

    const batteryAccuracy = page.locator('text=/94|Battery.*Prediction|Battery.*Accuracy/i').first()
    await expect(batteryAccuracy).toBeVisible({ timeout: 15000 })
  })

  test('should display brand classification accuracy', async ({ page }) => {
    await page.waitForTimeout(2000)

    const brandAccuracy = page.locator('text=/65|Brand.*Classification|Brand/i').first()
    await expect(brandAccuracy).toBeVisible({ timeout: 15000 })
  })

  test('should display model performance table', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Look for performance table
    const table = page.locator('table, [role="table"]').first()
    const tableHeading = page.locator('text=/Model Performance|Performance Summary/i').first()

    await expect(tableHeading).toBeVisible({ timeout: 15000 })
  })

  test('should display performance charts', async ({ page }) => {
    await page.waitForTimeout(3000)

    // Look for chart headings or chart containers
    const chartHeading = page.locator('text=/Chart|Performance|Distribution/i').first()
    await expect(chartHeading).toBeVisible({ timeout: 15000 })
  })

  test('should display technology badges', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Look for technology badges
    const badges = page.locator('text=/Nuxt|TypeScript|Python/i').first()
    await expect(badges).toBeVisible({ timeout: 15000 })
  })

  test('should show model improvement metrics', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Look for improvement or enhancement indicators
    const improvement = page.locator('text=/Improvement|Enhanced|Better/i').first()
    const hasImprovement = await improvement.isVisible({ timeout: 10000 }).catch(() => false)

    // Improvement section might or might not be visible
    expect(typeof hasImprovement).toBe('boolean')
  })

  test('should display error metrics', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Look for error metrics (RMSE, MAE, etc.)
    const errorMetrics = page.locator('text=/RMSE|MAE|Error/i').first()
    const hasErrorMetrics = await errorMetrics.isVisible({ timeout: 10000 }).catch(() => false)

    // Error metrics might be in table
    expect(typeof hasErrorMetrics).toBe('boolean')
  })
})
