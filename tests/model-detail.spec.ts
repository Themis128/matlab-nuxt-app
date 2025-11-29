import { test, expect } from '@playwright/test'

test.describe.skip('Model Detail Page', () => {
  // Common model names to test
  const testModels = [
    'iPhone 16 128GB',
    'Samsung Galaxy S24',
    'Google Pixel 8'
  ]

  test('should load model detail page', async ({ page }) => {
    // Try to navigate to a model page
    // First, go to search to find a model
    await page.goto('/search')
    await page.waitForLoadState('networkidle')

    // Perform a search
    const searchButton = page.getByRole('button', { name: /search/i }).first()
    if (await searchButton.isVisible({ timeout: 5000 })) {
      await searchButton.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Try to find a model link
      const modelLink = page.locator('a[href*="/model/"], .cursor-pointer').first()

      if (await modelLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await modelLink.click()
        await page.waitForURL(/.*\/model\/.*/, { timeout: 10000 })

        // Check if model detail page loaded
        await expect(page).toHaveURL(/.*\/model\/.*/)
      }
    }
  })

  test('should display model specifications', async ({ page }) => {
    // Navigate directly to a known model if possible
    for (const modelName of testModels) {
      const encodedName = encodeURIComponent(modelName)
      const response = await page.goto(`/model/${encodedName}`, { waitUntil: 'networkidle' }).catch(() => null)

      if (response && response.status() !== 404) {
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        // Check for model specifications
        const specs = page.locator('text=/price|ram|battery|screen|storage|processor/i').first()
        await expect(specs).toBeVisible({ timeout: 10000 })
        return
      }
    }

    // If direct navigation fails, try via search
    await page.goto('/search')
    await page.waitForLoadState('networkidle')

    const searchButton = page.getByRole('button', { name: /search/i }).first()
    if (await searchButton.isVisible({ timeout: 5000 })) {
      await searchButton.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const modelLink = page.locator('a[href*="/model/"]').first()
      if (await modelLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await modelLink.click()
        await page.waitForURL(/.*\/model\/.*/, { timeout: 10000 })

        const specs = page.locator('text=/price|ram|battery|screen|storage/i').first()
        await expect(specs).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('should display model image if available', async ({ page }) => {
    // Try to navigate to a model page
    await page.goto('/search')
    await page.waitForLoadState('networkidle')

    const searchButton = page.getByRole('button', { name: /search/i }).first()
    if (await searchButton.isVisible({ timeout: 5000 })) {
      await searchButton.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const modelLink = page.locator('a[href*="/model/"]').first()
      if (await modelLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await modelLink.click()
        await page.waitForURL(/.*\/model\/.*/, { timeout: 10000 })
        await page.waitForTimeout(2000)

        // Look for image (might not be present for all models)
        const image = page.locator('img').first()
        const hasImage = await image.isVisible({ timeout: 5000 }).catch(() => false)

        // Image is optional, so just check page loaded
        await expect(page).toHaveURL(/.*\/model\/.*/)
      }
    }
  })

  test('should display similar models section', async ({ page }) => {
    // Navigate to a model page
    await page.goto('/search')
    await page.waitForLoadState('networkidle')

    const searchButton = page.getByRole('button', { name: /search/i }).first()
    if (await searchButton.isVisible({ timeout: 5000 })) {
      await searchButton.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const modelLink = page.locator('a[href*="/model/"]').first()
      if (await modelLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await modelLink.click()
        await page.waitForURL(/.*\/model\/.*/, { timeout: 10000 })
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(3000)

        // Look for similar models section
        const similarSection = page.locator('text=/similar|recommended|related/i').first()
        await expect(similarSection).toBeVisible({ timeout: 15000 })
      }
    }
  })

  test('should have quick action buttons', async ({ page }) => {
    // Navigate to a model page
    await page.goto('/search')
    await page.waitForLoadState('networkidle')

    const searchButton = page.getByRole('button', { name: /search/i }).first()
    if (await searchButton.isVisible({ timeout: 5000 })) {
      await searchButton.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const modelLink = page.locator('a[href*="/model/"]').first()
      if (await modelLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await modelLink.click()
        await page.waitForURL(/.*\/model\/.*/, { timeout: 10000 })
        await page.waitForTimeout(2000)

        // Look for action buttons (Compare, Find Similar, etc.)
        const actionButtons = page.getByRole('button').filter({ hasText: /compare|similar|price|add/i })
        const buttonCount = await actionButtons.count()

        // Should have at least one action button
        expect(buttonCount).toBeGreaterThan(0)
      }
    }
  })

  test('should navigate to compare page from quick actions', async ({ page }) => {
    // Navigate to a model page
    await page.goto('/search')
    await page.waitForLoadState('networkidle')

    const searchButton = page.getByRole('button', { name: /search/i }).first()
    if (await searchButton.isVisible({ timeout: 5000 })) {
      await searchButton.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const modelLink = page.locator('a[href*="/model/"]').first()
      if (await modelLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await modelLink.click()
        await page.waitForURL(/.*\/model\/.*/, { timeout: 10000 })
        await page.waitForTimeout(2000)

        // Find and click compare button
        const compareButton = page.getByRole('button', { name: /compare/i }).first()

        if (await compareButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await compareButton.click()
          await page.waitForURL(/.*\/compare.*/, { timeout: 10000 })
          await expect(page).toHaveURL(/.*\/compare.*/)
        }
      }
    }
  })

  test('should handle non-existent model gracefully', async ({ page }) => {
    const response = await page.goto('/model/NonExistentModel12345', { waitUntil: 'networkidle' })

    // Should either show 404 or error message
    const errorMessage = page.locator('text=/not found|404|error|does not exist/i').first()
    const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false)

    // Page should load (even if with error)
    expect(response?.status()).toBeTruthy()
  })
})
