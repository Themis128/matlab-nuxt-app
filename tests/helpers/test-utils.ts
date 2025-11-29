/**
 * Reusable test utilities and helpers for Playwright tests
 */

import { expect, type Page, type Locator } from '@playwright/test'

/**
 * Wait for page to be fully loaded and hydrated
 */
export async function waitForPageLoad(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout })
  await page.waitForLoadState('domcontentloaded', { timeout })
}

/**
 * Wait for API health to be ready
 */
export async function waitForApiHealth(page: Page, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await page.request.get('http://localhost:8000/health')
      if (response.ok()) {
        const data = await response.json()
        if (data.status === 'healthy') {
          return true
        }
      }
    } catch (error) {
      // API not ready yet
    }
    await page.waitForTimeout(1000)
  }
  throw new Error('Python API failed to become healthy')
}

/**
 * Fill form fields with validation
 */
export async function fillFormField(
  locator: Locator,
  value: string | number,
  options?: { clear?: boolean; validate?: boolean }
) {
  const opts = { clear: true, validate: true, ...options }
  
  if (opts.clear) {
    await locator.clear()
  }
  
  await locator.fill(String(value))
  
  if (opts.validate) {
    await expect(locator).toHaveValue(String(value))
  }
}

/**
 * Click element with retry logic
 */
export async function clickWithRetry(locator: Locator, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await locator.click({ timeout: 5000 })
      return
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await locator.page().waitForTimeout(500)
    }
  }
}

/**
 * Wait for element and verify visibility
 */
export async function waitAndVerify(locator: Locator, timeout = 10000) {
  await locator.waitFor({ state: 'visible', timeout })
  await expect(locator).toBeVisible()
}

/**
 * Check for error alerts/messages
 */
export async function checkForErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  
  // Check for UAlert error components
  const alerts = page.locator('[role="alert"]').filter({ hasText: /error|failed/i })
  const count = await alerts.count()
  
  for (let i = 0; i < count; i++) {
    const text = await alerts.nth(i).textContent()
    if (text) errors.push(text.trim())
  }
  
  // Check console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`)
    }
  })
  
  return errors
}

/**
 * Assert no errors occurred on page
 */
export async function assertNoErrors(page: Page) {
  const errors = await checkForErrors(page)
  expect(errors, `Expected no errors but found: ${errors.join(', ')}`).toHaveLength(0)
}

/**
 * Get text content from locator with fallback
 */
export async function getTextSafe(locator: Locator, fallback = ''): Promise<string> {
  try {
    const text = await locator.textContent({ timeout: 2000 })
    return text?.trim() || fallback
  } catch {
    return fallback
  }
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(locator: Locator) {
  await locator.scrollIntoViewIfNeeded()
  await locator.page().waitForTimeout(300) // Allow for smooth scroll
}

/**
 * Assert URL contains expected path
 */
export async function assertUrlContains(page: Page, expectedPath: string) {
  const url = page.url()
  expect(url, `Expected URL to contain '${expectedPath}' but got '${url}'`).toContain(expectedPath)
}

/**
 * Wait for network to be idle (no pending requests)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Take screenshot with unique name
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = Date.now()
  await page.screenshot({ path: `screenshots/${name}-${timestamp}.png`, fullPage: true })
}

/**
 * Assert element count matches expected
 */
export async function assertCount(locator: Locator, expected: number) {
  const count = await locator.count()
  expect(count, `Expected ${expected} elements but found ${count}`).toBe(expected)
}

/**
 * Verify API response structure
 */
export function verifyApiResponse<T>(
  data: any,
  requiredFields: (keyof T)[]
): asserts data is T {
  for (const field of requiredFields) {
    expect(data, `Missing required field: ${String(field)}`).toHaveProperty(String(field))
  }
}
