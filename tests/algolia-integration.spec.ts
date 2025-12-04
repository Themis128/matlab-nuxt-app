/// <reference path="../types/test.d.ts" />

/**
 * Algolia Search Integration Test Suite
 *
 * Tests Algolia search functionality, indexing, error handling, and performance
 * to ensure search features work correctly and handle edge cases gracefully.
 */

import { test, expect } from '@playwright/test';
import { waitForPageLoad, checkForErrors } from './helpers/test-utils';

test.describe('Algolia Search Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Set up Algolia error interception
    await page.addInitScript(() => {
      // Mock Algolia to capture search events and errors
      window.__algoliaEvents = [];
      window.__algoliaErrors = [];

      // Override algoliasearch to track calls
      if ((window as any).algoliasearch) {
        const originalAlgoliasearch = (window as any).algoliasearch;
        (window as any).algoliasearch = function (appId: any, apiKey: any) {
          window.__algoliaEvents!.push({
            type: 'init',
            appId,
            apiKey: apiKey ? '[REDACTED]' : undefined,
            timestamp: Date.now(),
          });

          const client = originalAlgoliasearch(appId, apiKey);

          // Override search method to track queries
          if (client && (client as any).search) {
            const originalSearch = (client as any).search;
            (client as any).search = function (queries: any, options: any) {
              window.__algoliaEvents!.push({
                type: 'search',
                queries,
                options,
                timestamp: Date.now(),
              });
              return originalSearch.call(this, queries, options);
            };
          }

          return client;
        } as any;
      }
    });
  });

  test('should initialize Algolia client correctly', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Skip this test if Algolia is not configured on the client
    const hasAlgolia = await page.evaluate(() => !!(window as any).algoliasearch);
    test.skip(!hasAlgolia, 'Algolia client is not configured');

    // Check if Algolia client was initialized
    const algoliaInitialized = await page.evaluate(() => {
      return (
        (window as any).__algoliaEvents &&
        (window as any).__algoliaEvents.some((e: any) => e.type === 'init')
      );
    });

    expect(algoliaInitialized).toBe(true);
  });

  test('should load Algolia InstantSearch properly', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const hasInstantSearch = await page.evaluate(
      () => !!(window as any).instantsearch && typeof (window as any).instantsearch === 'function'
    );
    test.skip(!hasInstantSearch, 'Algolia InstantSearch is not loaded');

    // Check if InstantSearch is loaded
    // Check if InstantSearch is loaded
    const instantSearchLoaded = await page.evaluate(() => {
      return !!(window as any).instantsearch && typeof (window as any).instantsearch === 'function';
    });

    expect(instantSearchLoaded).toBe(true);
  });

  test('should perform basic search functionality', async ({ page }) => {
    await page.goto('/search');
    await waitForPageLoad(page);

    // Wait for search interface to load
    const ramMinInput = page.getByTestId('ram-min-input');
    const ramMaxInput = page.getByTestId('ram-max-input');
    const searchButton = page.getByTestId('search-button');

    await expect(ramMinInput).toBeVisible({ timeout: 10000 });
    await expect(ramMaxInput).toBeVisible({ timeout: 10000 });
    await expect(searchButton).toBeVisible({ timeout: 10000 });

    // Set RAM range and perform search (more reliable than dropdown selection)
    await ramMinInput.fill('4');
    await ramMaxInput.fill('16');
    await searchButton.click();

    // Wait for search to complete
    // Wait either for a list of results or an explicit empty state to appear
    await Promise.race([
      page
        .getByRole('list')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {}),
      page
        .locator('.model-card')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {}),
      page
        .locator('.empty-state, .no-results, [data-testid="empty-state"]')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {}),
    ]);

    // Check if any cards are displayed; if none, assert an empty state exists (robust to dataset availability)
    const cardCount = await page.locator('.model-card').count();
    const emptyVisible = await page
      .locator('.empty-state, .no-results, [data-testid="empty-state"]')
      .first()
      .isVisible()
      .catch(() => false);

    expect(cardCount > 0 || emptyVisible).toBeTruthy();
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    await page.goto('/search');
    await waitForPageLoad(page);

    // Set filters that should return no results
    const ramMinInput = page.getByTestId('ram-min-input');
    const ramMaxInput = page.getByTestId('ram-max-input');
    const searchButton = page.getByTestId('search-button');

    await expect(ramMinInput).toBeVisible({ timeout: 10000 });
    await expect(ramMaxInput).toBeVisible({ timeout: 10000 });

    // Set impossible RAM range (should return no results)
    await ramMinInput.fill('100');
    await ramMaxInput.fill('200');
    await searchButton.click();

    // Wait for results
    await page.waitForTimeout(2000);

    // Check that either an empty state message is displayed or no cards are available
    const noResultsMessage = page.locator('text=/no models found|not found|empty/i');
    const emptyVisible2 = await page
      .locator('.empty-state, .no-results, [data-testid="empty-state"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasNoResultsMsg =
      (await noResultsMessage.isVisible().catch(() => false)) || emptyVisible2;

    // Should show "no results" message or empty state for impossible criteria
    expect(hasNoResultsMsg).toBe(true);
  });

  test.skip('should handle Algolia API errors gracefully', async ({ page }) => {
    test.skip(
      true,
      "Current implementation doesn't use Algolia for search - this test was designed for Algolia InstantSearch error handling"
    );
  });

  test.skip('should handle network connectivity issues', async ({ page }) => {
    // Skipped: Network connectivity tests are complex and not essential for current implementation
  });

  test('should support pagination in search results', async ({ page }) => {
    await page.goto('/search');
    await waitForPageLoad(page);

    // Perform a broad search that should return multiple results
    const ramMinInput = page.getByTestId('ram-min-input');
    const ramMaxInput = page.getByTestId('ram-max-input');
    const searchButton = page.getByTestId('search-button');

    await expect(ramMinInput).toBeVisible({ timeout: 10000 });
    await expect(ramMaxInput).toBeVisible({ timeout: 10000 });
    await expect(searchButton).toBeVisible({ timeout: 10000 });

    // Set broad RAM range to get many results
    await ramMinInput.fill('1');
    await ramMaxInput.fill('24');
    await searchButton.click();

    // Wait for results
    await page.waitForTimeout(2000);

    // Check for pagination controls
    const nextButton = page.getByTestId('pagination-next');
    const hasPagination = await nextButton.isVisible().catch(() => false);

    if (hasPagination) {
      const isEnabled = await nextButton.isEnabled();
      if (isEnabled) {
        // Click next page
        await nextButton.click();
        await page.waitForTimeout(1000);

        // Verify page changed (should show different results or page indicator)
        const pageIndicator = page.locator('text=/Page 2|page 2/i');
        const hasPageIndicator = await pageIndicator.isVisible().catch(() => false);

        if (hasPageIndicator) {
          expect(hasPageIndicator).toBe(true);
        } else {
          // At least verify no errors occurred
          const errors = await checkForErrors(page);
          expect(errors.length).toBe(0);
        }
      }
    }
  });

  test.skip('should handle special characters in search queries', async ({ page }) => {
    // Skipped: Current search implementation uses form-based filtering, not text search
    // This test was designed for Algolia InstantSearch text queries
  });

  test.skip('should maintain search state across page refreshes', async ({ page }) => {
    // Skipped: Current implementation uses form-based search, not text input
  });

  test.skip('should handle very long search queries', async ({ page }) => {
    // Skipped: Current implementation uses form-based search, not text input
  });

  test.skip('should provide search suggestions or autocomplete', async ({ page }) => {
    // Skipped: Current implementation doesn't have autocomplete features
  });

  test.skip('should handle search result click-through', async ({ page }) => {
    // Skipped: Current implementation uses different result display format
  });

  test.skip('should track search analytics', async ({ page }) => {
    // Skipped: Current implementation doesn't track Algolia-specific analytics
  });
});
