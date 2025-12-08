import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with multiple wait strategies for reliability
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded');

    // Wait for network to be idle, but with fallback
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      // If networkidle times out, wait a bit and continue
      await page.waitForTimeout(1000);
    }

    // Ensure main content is loaded
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should load the homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/MATLAB/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/Advanced AI Analytics/i);
  });

  test('should display hero section with buttons', async ({ page }) => {
    // Check hero section is visible
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(/Advanced AI Analytics/i);

    // Check CTA buttons
    const exploreButton = page.getByRole('button', { name: /Explore Analytics/i });
    const modelButton = page.getByRole('button', { name: /Model Performance/i });

    await expect(exploreButton).toBeVisible();
    await expect(modelButton).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    // Wait for stats cards to load with longer timeout
    await page.waitForSelector(
      'h3:has-text("Total Models"), h3:has-text("Dataset Size"), h3:has-text("Accuracy"), h3:has-text("Active Sessions")',
      {
        timeout: 15000,
        state: 'visible',
      }
    );

    // Check stats cards are visible with explicit timeouts
    await expect(page.locator('h3:has-text("Total Models")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h3:has-text("Dataset Size")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h3:has-text("Accuracy")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h3:has-text("Active Sessions")')).toBeVisible({ timeout: 10000 });

    // Check stat values are displayed (using more specific selectors to avoid strict mode violations)
    await expect(page.getByText('24', { exact: true }).first()).toBeVisible({ timeout: 10000 }); // Total Models
    await expect(page.getByText('2.4M', { exact: true })).toBeVisible({ timeout: 10000 }); // Dataset Size
    // For Accuracy, just verify the text exists on the page (it appears multiple times)
    await expect(page.getByText(/94\.7%/).first()).toBeVisible({ timeout: 10000 }); // Accuracy - use regex and take first match
    await expect(page.getByText('573', { exact: true })).toBeVisible({ timeout: 10000 }); // Active Sessions
  });

  test('should display feature cards', async ({ page }) => {
    // Check feature cards are visible
    await expect(page.locator('h3:has-text("Analytics Dashboard")')).toBeVisible();
    await expect(page.locator('h3:has-text("Model Performance")')).toBeVisible();
    await expect(page.locator('h3:has-text("Data Visualization")')).toBeVisible();

    // Check feature card buttons
    await expect(page.getByRole('button', { name: /Explore Dashboard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /View Performance/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Explore Visualizations/i })).toBeVisible();
  });

  test('should have navigation elements', async ({ page }) => {
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();

    // Check for logo/home link (it has href="/" and aria-label="Home")
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    // Check footer content directly (footer might be rendered as contentinfo role)
    const footerContent = page.locator('text=/© 2025 MATLAB Analytics Platform/i');
    await expect(footerContent).toBeVisible({ timeout: 5000 });

    // Also check for contentinfo role
    const contentInfo = page.locator('[role="contentinfo"]');
    if ((await contentInfo.count()) > 0) {
      await expect(contentInfo.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for layout to adjust
    await page.waitForTimeout(500);

    // Wait for page state with fallback
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      await page.waitForLoadState('domcontentloaded');
    }

    // Check if page is still visible and functional
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

    // Check if mobile menu button exists
    const mobileMenuButton = page.getByRole('button', { name: /Open mobile menu/i });
    await expect(mobileMenuButton).toBeVisible({ timeout: 10000 });
  });

  test('should handle button clicks', async ({ page }) => {
    // Test that buttons are clickable
    const exploreButton = page.getByRole('button', { name: /Explore Analytics/i });
    await expect(exploreButton).toBeEnabled({ timeout: 10000 });
    await expect(exploreButton).toBeVisible({ timeout: 10000 });

    // Click button and verify it doesn't break
    await exploreButton.click({ timeout: 15000 });

    // Wait a moment for any navigation
    await page.waitForTimeout(500);

    // Verify we're still on a valid page
    const url = page.url();
    expect(url).toMatch(/http:\/\/localhost:3000/);
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate and wait with timeout
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for page to be ready
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      // If networkidle times out, wait a bit and continue
      await page.waitForTimeout(2000);
    }

    // Filter out known non-critical warnings and errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('Deprecated API') &&
        !error.includes('experimental') &&
        !error.includes('favicon') &&
        !error.includes('Failed to load resource')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should have proper accessibility structure', async ({ page }) => {
    // Navigate with timeout
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for page to be ready
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main.first()).toBeVisible({ timeout: 10000 });

    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible({ timeout: 10000 });

    // Check heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible({ timeout: 10000 });
  });
});
