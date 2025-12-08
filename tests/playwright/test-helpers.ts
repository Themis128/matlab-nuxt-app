import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Test Helper Utilities
 * Reusable functions for common test operations
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.page.waitForTimeout(1000); // Additional wait for any animations
  }

  /**
   * Navigate to a page and wait for it to load
   */
  async navigateTo(path: string) {
    await this.page.goto(path, { waitUntil: 'networkidle', timeout: 30000 });
    await this.waitForPageLoad();
  }

  /**
   * Fill a form input by placeholder or name
   */
  async fillInput(selector: string, value: string) {
    const input = this.page.locator(selector).first();
    if (await input.isVisible()) {
      await input.fill(value);
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Click a button by text or role
   */
  async clickButton(selector: string | { role: string; name: RegExp | string }) {
    let button;
    if (typeof selector === 'string') {
      button = this.page.locator(selector).first();
    } else {
      button = this.page.getByRole(selector.role as any, { name: selector.name });
    }

    if (await button.isVisible()) {
      await button.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout = 15000) {
    const pattern = typeof urlPattern === 'string' ? urlPattern : urlPattern.source;
    return await this.page
      .waitForResponse(
        (response) => {
          const url = response.url();
          return typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
        },
        { timeout }
      )
      .catch(() => null);
  }

  /**
   * Check if element is visible (with timeout)
   */
  async isVisible(selector: string, timeout = 5000) {
    try {
      await this.page.locator(selector).first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element count
   */
  async getElementCount(selector: string) {
    return await this.page.locator(selector).count();
  }

  /**
   * Toggle theme
   */
  async toggleTheme() {
    const themeToggle = this.page.locator('button[aria-label*="theme"], [role="switch"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Get current theme
   */
  async getCurrentTheme() {
    return await this.page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
  }

  /**
   * Open mobile menu
   */
  async openMobileMenu() {
    const menuButton = this.page
      .getByRole('button', { name: /menu|Menu|Open mobile menu/i })
      .first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Perform search
   */
  async performSearch(query: string) {
    const searchInput = this.page
      .locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]')
      .first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(2000); // Wait for debounce
    }
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, optionIndex: number) {
    const select = this.page.locator(selector).first();
    if (await select.isVisible()) {
      await select.click();
      await this.page.waitForTimeout(500);

      const options = this.page.locator('option, [role="option"]');
      const optionCount = await options.count();
      if (optionCount > optionIndex) {
        await options.nth(optionIndex).click();
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill form with multiple inputs
   */
  async fillForm(inputs: Array<{ selector: string; value: string }>) {
    for (const input of inputs) {
      await this.fillInput(input.selector, input.value);
    }
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors() {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await this.page.waitForTimeout(1000);
    return errors;
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for element to appear
   */
  async waitForElement(selector: string, timeout = 10000) {
    await this.page.locator(selector).first().waitFor({ state: 'visible', timeout });
  }

  /**
   * Check page performance metrics
   */
  async getPerformanceMetrics() {
    return await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!perfData) return null;

      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
      };
    });
  }

  /**
   * Verify page accessibility basics
   */
  async verifyAccessibility() {
    // Check for h1
    const h1Count = await this.page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);

    // Check for navigation
    const navCount = await this.page.locator('nav, [role="navigation"]').count();
    expect(navCount).toBeGreaterThan(0);

    // Check for main content
    const mainCount = await this.page.locator('main, [role="main"]').count();
    // Main may not always be present, so we just check if it exists
    return { h1Count, navCount, mainCount };
  }
}

/**
 * Create test helpers instance
 */
export function createTestHelpers(page: Page) {
  return new TestHelpers(page);
}

/**
 * Common selectors
 */
export const SELECTORS = {
  navigation: 'nav, [role="navigation"]',
  searchInput: 'input[type="search"], input[placeholder*="Search"]',
  themeToggle: 'button[aria-label*="theme"], [role="switch"]',
  mobileMenuButton: 'button:has-text("menu"), button[aria-label*="menu"]',
  submitButton: 'button[type="submit"]',
  form: 'form',
  card: '[class*="card"]',
  button: 'button',
  input: 'input',
  select: 'select',
} as const;
