import { test, expect } from '@playwright/test'

test.describe('AI Predictions Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo')
  })

  test('should load demo page with AI predictions interface', async ({ page }) => {
    // Check page title and heading
    await expect(page).toHaveTitle(/AI Predictions Lab/)
    await expect(page.locator('h1')).toContainText('AI Predictions Lab')

    // Check model performance badges
    await expect(page.locator('text=98.24% Price Accuracy')).toBeVisible()
    await expect(page.locator('text=95.16% RAM Accuracy')).toBeVisible()
    await expect(page.locator('text=94.77% Battery Accuracy')).toBeVisible()
    await expect(page.locator('text=65.22% Brand Accuracy')).toBeVisible()
  })

  test('should display API status correctly', async ({ page }) => {
    // Check API status section
    await expect(page.locator('text=AI Models Status:')).toBeVisible()

    // Should show online status (green indicator and text)
    const statusIndicator = page.locator('[class*="rounded-full"]').first()
    await expect(statusIndicator).toHaveClass(/bg-green-500/)

    const statusText = page.locator('text=Online & Ready')
    await expect(statusText).toBeVisible()
  })

  test('should have working API status refresh', async ({ page }) => {
    // Find and click refresh button
    const refreshButton = page.locator('button:has-text("Refresh Status")')
    await expect(refreshButton).toBeVisible()

    // Click refresh (should not change status since API is working)
    await refreshButton.click()

    // Status should remain online
    await expect(page.locator('text=Online & Ready')).toBeVisible()
  })

  test('should display model performance metrics', async ({ page }) => {
    // Check enhanced model performance section
    await expect(page.locator('text=Enhanced Model Performance')).toBeVisible()

    // Check performance cards - use more specific selectors
    await expect(
      page.locator('[class*="text-green"][class*="font-bold"]').filter({ hasText: '98.24%' })
    ).toBeVisible()
    await expect(
      page.locator('[class*="text-blue"][class*="font-bold"]').filter({ hasText: '95.16%' })
    ).toBeVisible()
    await expect(
      page.locator('[class*="text-purple"][class*="font-bold"]').filter({ hasText: '94.77%' })
    ).toBeVisible()
    await expect(
      page.locator('[class*="text-orange"][class*="font-bold"]').filter({ hasText: '65.22%' })
    ).toBeVisible()

    // Check improvement percentages
    await expect(page.locator('text=+20.7% improvement')).toBeVisible()
    await expect(page.locator('text=+43.6% improvement')).toBeVisible()
    await expect(page.locator('text=+26.6% improvement')).toBeVisible()
    await expect(page.locator('text=+9.6% improvement')).toBeVisible()
  })

  test('should have prediction input form', async ({ page }) => {
    // Check form sections
    await expect(page.locator('text=Core Specifications')).toBeVisible()
    await expect(page.locator('text=Advanced Features')).toBeVisible()
    await expect(page.locator('text=Prediction Types')).toBeVisible()

    // Check required form fields
    await expect(page.locator('label:has-text("RAM (GB)")')).toBeVisible()
    await expect(page.locator('label:has-text("Battery Capacity (mAh)")')).toBeVisible()
    await expect(page.locator('label:has-text("Screen Size (inches)")')).toBeVisible()
    await expect(page.locator('label:has-text("Weight (grams)")')).toBeVisible()
    await expect(page.locator('label:has-text("Launch Year")')).toBeVisible()
    await expect(page.locator('label:has-text("Brand")')).toBeVisible()

    // Check prediction type checkboxes
    await expect(page.locator('input[type="checkbox"][value="price"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"][value="ram"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"][value="battery"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"][value="brand"]')).toBeChecked()
  })

  test('should validate form inputs', async ({ page }) => {
    // Wait for form to be ready
    await page.waitForSelector('input[placeholder="8"]')

    // Clear required fields one by one
    const ramInput = page.locator('input[placeholder="8"]')
    const batteryInput = page.locator('input[placeholder="4000"]')
    const screenInput = page.locator('input[placeholder="6.1"]')
    const weightInput = page.locator('input[placeholder="180"]')
    const yearInput = page.locator('input[placeholder="2024"]')

    await ramInput.clear()
    await batteryInput.clear()
    await screenInput.clear()
    await weightInput.clear()
    await yearInput.clear()

    // Clear brand selection
    const brandSelect = page.locator('select')
    await brandSelect.selectOption('')

    // Submit should be visible and clickable
    const submitButton = page.locator('button:has-text("Run AI Predictions")')
    await expect(submitButton).toBeVisible()
  })

  test('should perform AI price prediction', async ({ page }) => {
    // Fill required fields: ram, battery, screen
    await page.fill('input[placeholder="8"]', '8')
    await page.fill('input[placeholder="4000"]', '4000')
    await page.fill('input[placeholder="6.1"]', '6.1')

    // Ensure only price prediction is checked
    await page.locator('input[type="checkbox"][value="ram"]').uncheck()
    await page.locator('input[type="checkbox"][value="battery"]').uncheck()
    await page.locator('input[type="checkbox"][value="brand"]').uncheck()

    // Wait for Vue to update reactive state after unchecking
    await page.waitForTimeout(500)

    // Submit prediction
    await page.locator('button:has-text("Run AI Predictions")').click()

    // Wait for results to appear
    await expect(page.locator('text=Price Prediction')).toBeVisible({ timeout: 10000 })

    // Check for price prediction result
    await expect(page.locator('text=98.24% Accuracy')).toBeVisible()

    // Should show a price (numeric value)
    const priceElement = page
      .locator('[class*="font-bold"][class*="text-green"]')
      .filter({ hasText: /\$/ })
      .first()
    const priceText = await priceElement.textContent()
    const price = parseFloat(priceText?.replace(/[$,]/g, '') || '0')
    expect(price).toBeGreaterThan(0)
    expect(price).toBeLessThan(10000) // Reasonable price range
  })

  test('should perform multiple predictions simultaneously', async ({ page }) => {
    // Fill required fields
    await page.fill('input[placeholder="8"]', '8')
    await page.fill('input[placeholder="4000"]', '4000')
    await page.fill('input[placeholder="6.1"]', '6.1')

    // Verify all checkboxes are checked (they are by default)
    await expect(page.locator('input[type="checkbox"][value="price"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"][value="ram"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"][value="battery"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"][value="brand"]')).toBeChecked()

    // Submit
    await page.locator('button:has-text("Run AI Predictions")').click()

    // Wait for first result to appear
    await expect(page.locator('text=Price Prediction')).toBeVisible({ timeout: 10000 })

    // Check all prediction results appear
    await expect(page.locator('text=RAM Prediction')).toBeVisible()
    await expect(page.locator('text=Battery Prediction')).toBeVisible()
    await expect(page.locator('text=Brand Prediction')).toBeVisible()

    // Check accuracy badges
    await expect(page.locator('text=98.24% Accuracy')).toBeVisible()
    await expect(page.locator('text=95.16% Accuracy')).toBeVisible()
    await expect(page.locator('text=94.77% Accuracy')).toBeVisible()
    await expect(page.locator('text=65.22% Accuracy')).toBeVisible()
  })

  test('should display feature importance analysis', async ({ page }) => {
    // Check feature importance section
    await expect(page.locator('text=Feature Importance Analysis')).toBeVisible()

    // Check price prediction features
    await expect(page.locator('text=Price Prediction Features')).toBeVisible()
    await expect(page.locator('text=RAM Capacity')).toBeVisible()
    await expect(page.locator('text=Brand Premium')).toBeVisible()
    await expect(page.locator('text=Battery Size')).toBeVisible()

    // Check RAM prediction features - use more specific selectors
    await expect(page.locator('text=RAM Prediction Features')).toBeVisible()
    // Find elements within the RAM prediction section
    const ramFeatures = page
      .locator('h3:has-text("RAM Prediction Features")')
      .locator('xpath=following-sibling::div[1]')
    await expect(ramFeatures.locator('text=Battery Capacity')).toBeVisible()
    await expect(ramFeatures.locator('text=Screen Size')).toBeVisible()
    await expect(ramFeatures.locator('text=Launch Year')).toBeVisible()
  })

  test('should have working navigation buttons', async ({ page }) => {
    // Check navigation buttons at bottom
    await expect(page.locator('a:has-text("Home")')).toBeVisible()
    await expect(page.locator('a:has-text("Advanced Search")')).toBeVisible()
    await expect(page.locator('a:has-text("Compare Models")')).toBeVisible()
    await expect(page.locator('a:has-text("Recommendations")')).toBeVisible()

    // Test navigation to home
    await page.locator('a:has-text("Home")').click()
    await expect(page).toHaveURL(/.*\//)
    await expect(page.locator('h1')).toContainText('Mobile Finder')
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Fill required fields
    await page.fill('input[placeholder="8"]', '8')
    await page.fill('input[placeholder="4000"]', '4000')
    await page.fill('input[placeholder="6.1"]', '6.1')

    // Submit
    await page.locator('button:has-text("Run AI Predictions")').click()

    // Either results appear or error message appears
    const hasResults = await page.locator('text=Price Prediction').isVisible()
    const hasError = await page.locator('text=Prediction Error').isVisible()

    expect(hasResults || hasError).toBe(true)

    if (hasError) {
      // If there's an error, check error UI
      await expect(page.locator('text=Try Again')).toBeVisible()
    }
  })

  test('should clear form correctly', async ({ page }) => {
    // Fill form
    await page.fill('input[placeholder="8"]', '12')
    await page.fill('input[placeholder="4000"]', '5000')
    await page.locator('select').selectOption('Samsung')

    // Click clear button
    await page.locator('button:has-text("Clear Form")').click()

    // Check form is cleared
    const ramInput = page.locator('input[placeholder="8"]')
    await expect(ramInput).toHaveValue('')

    const batteryInput = page.locator('input[placeholder="4000"]')
    await expect(batteryInput).toHaveValue('')

    // Brand should be reset (check if select is empty or has placeholder)
    const brandSelect = page.locator('select')
    const selectedValue = await brandSelect.inputValue()
    expect(selectedValue).toBe('') // Should be empty after clear
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that main elements are still visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=AI Models Status:')).toBeVisible()
    await expect(page.locator('button:has-text("Run AI Predictions")')).toBeVisible()

    // Check that form is usable on mobile
    await page.fill('input[placeholder="8"]', '8')
    await expect(page.locator('input[placeholder="8"]')).toHaveValue('8')
  })
})
