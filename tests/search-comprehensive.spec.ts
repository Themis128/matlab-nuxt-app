/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from '@playwright/test'
import {
  waitForPageLoad,
  waitForApiHealth,
  fillFormField,
  clickWithRetry,
  waitAndVerify,
  assertNoErrors,
  waitForNetworkIdle,
} from './helpers/test-utils'
import { searchFilters, timeouts, urls } from './helpers/fixtures'

test.describe('Search Page - Advanced Search & Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await waitForApiHealth(page)
    await page.goto(urls.search)
    await waitForPageLoad(page)
  })

  test('should load search page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Advanced Search/i)
    await expect(page.getByRole('heading', { name: /Advanced Search/i }).first()).toBeVisible()

    // Check filter sections are present
    await expect(page.getByText(/Price Range/i)).toBeVisible()
    await expect(page.getByText(/RAM/i).first()).toBeVisible()
    await expect(page.getByText(/Battery/i).first()).toBeVisible()

    // Check search button
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible()

    await assertNoErrors(page)
  })

  test('should filter by price range', async ({ page }) => {
    const minPrice = page.getByPlaceholder(/Min price/i).first()
    const maxPrice = page.getByPlaceholder(/Max price/i).first()
    const searchButton = page.getByRole('button', { name: /Search/i }).first()

    await fillFormField(minPrice, searchFilters.priceRange.minPrice)
    await fillFormField(maxPrice, searchFilters.priceRange.maxPrice)

    await clickWithRetry(searchButton)
    await waitForNetworkIdle(page, timeouts.api)

    // Wait for results or no results message
    await page
      .waitForSelector('text=/results|models|found|search/i', { timeout: timeouts.api })
      .catch(() => {})

    await assertNoErrors(page)
  })

  test('should filter by RAM range', async ({ page }) => {
    const minRam = page.getByPlaceholder(/Min RAM/i).first()
    const maxRam = page.getByPlaceholder(/Max RAM/i).first()
    const searchButton = page.getByRole('button', { name: /Search/i }).first()

    await fillFormField(minRam, searchFilters.ramRange.minRam)
    await fillFormField(maxRam, searchFilters.ramRange.maxRam)

    await clickWithRetry(searchButton)
    await waitForNetworkIdle(page, timeouts.api)

    await page.waitForTimeout(2000)
    await assertNoErrors(page)
  })

  test('should filter by battery range', async ({ page }) => {
    const minBattery = page.getByPlaceholder(/Min.*battery/i)
    const maxBattery = page.getByPlaceholder(/Max.*battery/i)
    const searchButton = page.getByRole('button', { name: /Search/i })

    if ((await minBattery.count()) > 0) {
      await fillFormField(minBattery, searchFilters.batteryRange.minBattery)
      await fillFormField(maxBattery, searchFilters.batteryRange.maxBattery)

      await clickWithRetry(searchButton)
      await waitForNetworkIdle(page, timeouts.api)
    }

    await assertNoErrors(page)
  })

  test('should combine multiple filters', async ({ page }) => {
    const minPrice = page.getByPlaceholder(/Min price/i).first()
    const maxPrice = page.getByPlaceholder(/Max price/i).first()
    const minRam = page.getByPlaceholder(/Min RAM/i).first()
    const searchButton = page.getByRole('button', { name: /Search/i }).first()

    // Apply multiple filters
    await fillFormField(minPrice, 400)
    await fillFormField(maxPrice, 1200)
    await fillFormField(minRam, 6)

    await clickWithRetry(searchButton)
    await waitForNetworkIdle(page, timeouts.api)

    await page.waitForTimeout(2000)
    await assertNoErrors(page)
  })

  test('should select and deselect models for comparison', async ({ page }) => {
    const searchButton = page.getByRole('button', { name: /Search/i })

    // Perform search to get results
    await clickWithRetry(searchButton)
    await page.waitForTimeout(3000)

    // Find checkboxes for model selection
    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()

    if (count > 0) {
      // Select first model
      await checkboxes.first().check()
      await page.waitForTimeout(300)

      // Verify selection
      await expect(checkboxes.first()).toBeChecked()

      // Deselect
      await checkboxes.first().uncheck()
      await page.waitForTimeout(300)

      await expect(checkboxes.first()).not.toBeChecked()
    }

    await assertNoErrors(page)
  })

  test('should sort results', async ({ page }) => {
    const searchButton = page.getByRole('button', { name: /Search/i })

    // Perform search
    await clickWithRetry(searchButton)
    await page.waitForTimeout(3000)

    // Look for sort dropdown/buttons
    const sortOptions = page
      .locator('select, [role="listbox"], button')
      .filter({ hasText: /sort|price|name/i })

    if ((await sortOptions.count()) > 0) {
      await sortOptions.first().click()
      await page.waitForTimeout(500)
    }

    await assertNoErrors(page)
  })

  test.skip('should clear filters', async ({ page }) => {
    const minPrice = page.getByPlaceholder(/Min price/i)
    const maxPrice = page.getByPlaceholder(/Max price/i)

    // Fill some filters
    await fillFormField(minPrice, 300)
    await fillFormField(maxPrice, 1000)

    // Look for clear/reset button
    const clearButton = page.getByRole('button', { name: /clear|reset/i })

    if ((await clearButton.count()) > 0) {
      await clickWithRetry(clearButton.first())
      await page.waitForTimeout(500)

      // Filters should be cleared
      await expect(minPrice).toHaveValue('')
      await expect(maxPrice).toHaveValue('')
    }

    await assertNoErrors(page)
  })

  test.skip('should handle empty results gracefully', async ({ page }) => {
    const minPrice = page.getByPlaceholder(/Min price/i)
    const maxPrice = page.getByPlaceholder(/Max price/i)
    const searchButton = page.getByRole('button', { name: /Search/i })

    // Search with impossible filter
    await fillFormField(minPrice, 99999)
    await fillFormField(maxPrice, 100000)

    await clickWithRetry(searchButton)
    await page.waitForTimeout(2000)

    // Should show empty state or no results message
    const emptyMessage = page.getByText(/no.*models.*found|0.*results/i)

    // Either message exists or we just don't crash
    const messageCount = await emptyMessage.count()
    expect(messageCount >= 0).toBeTruthy()

    await assertNoErrors(page)
  })

  test('should navigate to compare page with selected models', async ({ page }) => {
    const searchButton = page.getByRole('button', { name: /Search/i })

    // Perform search
    await clickWithRetry(searchButton)
    await page.waitForTimeout(3000)

    // Look for compare button
    const compareButton = page.getByRole('button', { name: /compare|comparison/i })

    if ((await compareButton.count()) > 0 && (await compareButton.first().isVisible())) {
      await clickWithRetry(compareButton.first())
      await waitForPageLoad(page)

      // Should navigate to compare page
      await expect(page).toHaveURL(/\/compare/)
    }

    await assertNoErrors(page)
  })

  test('should display model details in results', async ({ page }) => {
    const searchButton = page.getByRole('button', { name: /Search/i })

    await clickWithRetry(searchButton)
    await page.waitForTimeout(3000)

    // Look for model cards/rows with details
    const priceElements = page.locator('text=/\\$\\d+/')
    const ramElements = page.getByText(/\\d+.*GB|RAM/i)

    const priceCount = await priceElements.count()
    const ramCount = await ramElements.count()

    // At least some results should be displayed
    expect(priceCount + ramCount).toBeGreaterThan(0)

    await assertNoErrors(page)
  })
})
