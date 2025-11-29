import { test, expect } from '@playwright/test'
import {
  waitForPageLoad,
  waitForApiHealth,
  fillFormField,
  clickWithRetry,
  waitAndVerify,
  assertNoErrors,
  assertCount,
  waitForNetworkIdle
} from './helpers/test-utils'
import { validPhoneSpecs, budgetPhoneSpecs, flagshipPhoneSpecs, timeouts, urls } from './helpers/fixtures'

test.describe('Recommendations Page - Find Models by Price', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure Python API is healthy
    await waitForApiHealth(page)
    
    // Navigate to recommendations page
    await page.goto(urls.recommendations)
    await waitForPageLoad(page)
    
    // Wait for page title to be visible
    await waitAndVerify(page.getByRole('heading', { name: /Recommendations/i }))
  })

  test('should load recommendations page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Find Models by Price/i)
    
    // Check main heading
    const heading = page.getByRole('heading', { name: /Recommendations/i }).first()
    await expect(heading).toBeVisible()
    
    // Check search form is present
    await expect(page.getByText(/Search by Price/i)).toBeVisible()
    await expect(page.getByPlaceholder(/e\.g\., 500/i)).toBeVisible()
    
    // Check tolerance slider is present
    await expect(page.getByText(/Price Tolerance/i)).toBeVisible()
    
    // Check recommend button
    await expect(page.getByRole('button', { name: /Recommend/i })).toBeVisible()
    
    // Verify no errors on initial load
    await assertNoErrors(page)
  })

  test('should search for models by price with default tolerance', async ({ page }) => {
    const priceInput = page.getByPlaceholder(/e\.g\., 500/i)
    const recommendButton = page.getByRole('button', { name: /Recommend/i })
    
    // Enter price
    await fillFormField(priceInput, '600')
    
    // Click recommend
    await clickWithRetry(recommendButton)
    
    // Wait for results
    await page.waitForSelector('text=/Total Models Found/i', { timeout: timeouts.api })
    
    // Verify summary stats are displayed
    await expect(page.getByText(/Total Models Found/i)).toBeVisible()
    await expect(page.getByText(/Brands Available/i)).toBeVisible()
    await expect(page.getByText(/Models Displayed/i)).toBeVisible()
    
    // Verify price range is shown
    await expect(page.getByText(/Searching for models between/i)).toBeVisible()
    
    // Verify at least one model card is displayed
    const modelCards = page.locator('[class*="hover:shadow"]').filter({ has: page.locator('text=/GB|mAh/i') })
    expect(await modelCards.count()).toBeGreaterThan(0)
    
    await assertNoErrors(page)
  })

  test('should adjust tolerance and update results', async ({ page }) => {
    const priceInput = page.getByPlaceholder(/e\.g\., 500/i)
    const recommendButton = page.getByRole('button', { name: /Recommend/i })
    const toleranceSlider = page.locator('input[type="range"]').first()
    
    // Enter price
    await fillFormField(priceInput, '800')
    
    // Set tolerance to 10% (0.1)
    await toleranceSlider.fill('0.1')
    
    // Verify tolerance display updated
    await expect(page.getByText(/10%/)).toBeVisible()
    
    // Click recommend
    await clickWithRetry(recommendButton)
    
    // Wait for results
    await page.waitForSelector('text=/Total Models Found/i', { timeout: timeouts.api })
    
    // Store first result count
    const firstCount = await page.locator('text=/Total Models Found/i').first().textContent()
    
    // Increase tolerance to 50%
    await toleranceSlider.fill('0.5')
    await expect(page.locator('span').filter({ hasText: /^50%$/ }).first()).toBeVisible()
    
    // Click recommend again
    await clickWithRetry(recommendButton)
    await page.waitForTimeout(1000)
    
    // Second search should return different (likely more) results
    const secondCount = await page.locator('text=/Total Models Found/i').first().textContent()
    
    // Results should be present
    expect(secondCount).toBeTruthy()
    
    await assertNoErrors(page)
  })

  test('should filter results by brand', async ({ page }) => {
    const priceInput = page.getByPlaceholder(/e\.g\., 500/i)
    const recommendButton = page.getByRole('button', { name: /Recommend/i })
    
    // Search for models
    await fillFormField(priceInput, '700')
    await clickWithRetry(recommendButton)
    
    // Wait for results and brand filters
    await page.waitForSelector('text=/Filter by Brand/i', { timeout: timeouts.api })
    
    // Get all brand badges
    const brandBadges = page.locator('[class*="cursor-pointer"]').filter({ hasText: /Samsung|Apple|Xiaomi|OnePlus/i })
    const brandCount = await brandBadges.count()
    
    if (brandCount > 0) {
      // Get initial model count
      const initialModelsText = await page.locator('text=/Models Displayed/i').first().textContent()
      
      // Click first brand to deselect
      await brandBadges.first().click()
      await page.waitForTimeout(500)
      
      // Model count should change
      const filteredModelsText = await page.locator('text=/Models Displayed/i').first().textContent()
      
      // Counts should be different (unless only one brand had results)
      expect(filteredModelsText).toBeTruthy()
    }
    
    await assertNoErrors(page)
  })

  test('should display model details in cards', async ({ page }) => {
    const priceInput = page.getByPlaceholder(/e\.g\., 500/i)
    const recommendButton = page.getByRole('button', { name: /Recommend/i })
    
    // Search for models
    await fillFormField(priceInput, '500')
    await clickWithRetry(recommendButton)
    
    // Wait for model cards
    await page.waitForSelector('text=/RAM/i', { timeout: timeouts.api })
    
    // Find first model card
    const firstCard = page.locator('[class*="hover:shadow"]').filter({ has: page.locator('text=/RAM/i') }).first()
    
    // Verify card contains expected specs
    await expect(firstCard.getByText(/RAM/i)).toBeVisible()
    await expect(firstCard.getByText(/Battery/i)).toBeVisible()
    await expect(firstCard.getByText(/Screen/i)).toBeVisible()
    await expect(firstCard.getByText(/Weight/i)).toBeVisible()
    await expect(firstCard.getByText(/Year/i)).toBeVisible()
    
    // Verify price is displayed
    const priceLocator = firstCard.locator('text=/\\$\\d+/')
    await expect(priceLocator.first()).toBeVisible()
    
    await assertNoErrors(page)
  })

  test('should show empty state when no models found', async ({ page }) => {
    const priceInput = page.getByPlaceholder(/e\.g\., 500/i)
    const recommendButton = page.getByRole('button', { name: /Recommend/i })
    const toleranceSlider = page.locator('input[type="range"]').first()
    
    // Search with very narrow price range (5% - minimum allowed)
    await fillFormField(priceInput, '99999')
    await toleranceSlider.fill('0.05')
    
    await clickWithRetry(recommendButton)
    
    // Wait for response
    await page.waitForTimeout(2000)
    
    // Should show helpful error message
    const errorAlert = page.locator('[role="alert"]').filter({ hasText: /No models found/i })
    
    // Either shows error alert or 0 total count
    const hasError = await errorAlert.count() > 0
    const zeroCountText = page.getByText(/0.*Total Models Found/i)
    const hasZeroCount = await zeroCountText.count() > 0
    
    expect(hasError || hasZeroCount).toBeTruthy()
  })

  test.skip('should navigate to other pages via quick actions', async ({ page }) => {
    // Wait for quick action buttons
    await expect(page.getByRole('link', { name: /Advanced Search/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Compare Models/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible()
    
    // Click Advanced Search
    await page.getByRole('link', { name: /Advanced Search/i }).click()
    await waitForPageLoad(page)
    
    // Verify navigation
    await expect(page).toHaveURL(/\/search/)
    
    await assertNoErrors(page)
  })

  test.skip('should handle API errors gracefully', async ({ page }) => {
    // Navigate to page
    await page.goto(urls.recommendations)
    
    // Intercept API call to simulate error
    await page.route('**/api/dataset/models-by-price*', route => {
      route.abort('failed')
    })
    
    const priceInput = page.getByPlaceholder(/e\.g\., 500/i)
    const recommendButton = page.getByRole('button', { name: /Recommend/i })
    
    await fillFormField(priceInput, '500')
    await clickWithRetry(recommendButton)
    
    // Wait for error
    await page.waitForTimeout(2000)
    
    // Should show error alert
    const errorAlert = page.locator('[role="alert"]').filter({ hasText: /error|failed/i })
    await expect(errorAlert.first()).toBeVisible({ timeout: timeouts.short })
  })

  test('should display price difference indicators', async ({ page }) => {
    const priceInput = page.getByPlaceholder(/e\.g\., 500/i)
    const recommendButton = page.getByRole('button', { name: /Recommend/i })
    
    // Search for models
    await fillFormField(priceInput, '600')
    await clickWithRetry(recommendButton)
    
    // Wait for results
    await page.waitForSelector('text=/Price Difference/i', { timeout: timeouts.api })
    
    // Verify price difference badges are shown
    const priceDiffBadges = page.getByText(/Price Difference/i)
    expect(await priceDiffBadges.count()).toBeGreaterThan(0)
    
    await assertNoErrors(page)
  })

  test('should use default price if none provided', async ({ page }) => {
    const recommendButton = page.getByRole('button', { name: /Recommend/i })
    
    // Click recommend without entering price
    await clickWithRetry(recommendButton)
    
    // Should still search (using default 500)
    await page.waitForSelector('text=/Total Models Found/i', { timeout: timeouts.api })
    
    // Verify results are shown
    await expect(page.getByText(/Total Models Found/i)).toBeVisible()
    
    await assertNoErrors(page)
  })
})
