import { test, expect } from '@playwright/test';

test.describe('UI Accessibility & Navigation', () => {
  test('Skip link is visible and works', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a.skip-to-main');
    await expect(skipLink).toBeVisible();
    await skipLink.click();
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('Navigation bar has ARIA roles and labels', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  test('Theme toggle is accessible', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('button[aria-label="theme toggle"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    // Should toggle dark mode (may take a moment to apply)
    await page.waitForTimeout(500);
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toMatch(/dark/);
  });

  test('All main routes are reachable', async ({ page }) => {
    const routes = [
      '/',
      '/search',
      '/compare',
      '/recommendations',
      '/explore',
      '/demo',
      '/api-docs',
    ];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('Footer has correct ARIA role', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer[role="contentinfo"]');
    await expect(footer).toBeVisible();
  });
});
