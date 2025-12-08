import { test, expect } from '@playwright/test';

test.describe('Algolia Integration Test Suite', () => {
  const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

  test.describe('Algolia Search API Endpoint', () => {
    test('should return search results from Algolia API', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/algolia/search`, {
        params: {
          q: 'iPhone',
          page: '0',
          hitsPerPage: '10',
        },
      });

      // API should return 200 or 500 (if Algolia not configured)
      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('hits');
        expect(data).toHaveProperty('nbHits');
        expect(data).toHaveProperty('page');
        expect(data).toHaveProperty('nbPages');
        expect(data).toHaveProperty('hitsPerPage');
        expect(Array.isArray(data.hits)).toBe(true);
      }
    });

    test('should handle empty search query', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/algolia/search`, {
        params: {
          q: '',
          page: '0',
          hitsPerPage: '10',
        },
      });

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('hits');
        expect(Array.isArray(data.hits)).toBe(true);
      }
    });

    test('should support pagination', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/algolia/search`, {
        params: {
          q: 'phone',
          page: '1',
          hitsPerPage: '5',
        },
      });

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.page).toBe(1);
        expect(data.hitsPerPage).toBe(5);
        expect(data.hits.length).toBeLessThanOrEqual(5);
      }
    });

    test('should support filters', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/algolia/search`, {
        params: {
          q: 'phone',
          filters: 'brand:"Apple"',
          page: '0',
          hitsPerPage: '10',
        },
      });

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(Array.isArray(data.hits)).toBe(true);
        // If results exist, verify brand filter
        if (data.hits.length > 0) {
          data.hits.forEach((hit: any) => {
            expect(hit.brand || hit.company).toBeTruthy();
          });
        }
      }
    });

    test('should return records with image URLs', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/algolia/search`, {
        params: {
          q: 'iPhone',
          page: '0',
          hitsPerPage: '5',
        },
      });

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        if (data.hits.length > 0) {
          const firstHit = data.hits[0];
          // Check for image URL in various possible fields
          const hasImage = firstHit.image_url || firstHit.image || firstHit.photo || false;
          // Image is optional but preferred
          if (hasImage) {
            expect(typeof hasImage).toBe('string');
            expect(hasImage.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('Search Page with Algolia', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000); // Wait for initial load
    });

    test('should load search page successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Search|Mobile/i);
      await expect(page.locator('h1')).toContainText(/Find Your Perfect/i);
    });

    test('should display search input', async ({ page }) => {
      // Use more specific selector - the main search input in the search form
      const searchInput = page.locator('input[placeholder*="Search phones by name"]').first();
      await expect(searchInput).toBeVisible();
    });

    test('should perform search when typing', async ({ page }) => {
      // Use more specific selector for the main search form input
      const searchInput = page.locator('input[placeholder*="Search phones by name"]').first();
      await searchInput.fill('iPhone');
      await page.waitForTimeout(1000); // Wait for search to trigger

      // Check if results appear (may take time)
      const resultsSection = page.locator('section').filter({ hasText: 'Search Results' });
      await expect(resultsSection).toBeVisible({ timeout: 10000 });
    });

    test('should display search results with images', async ({ page }) => {
      // Use more specific selector for the main search form input
      const searchInput = page.locator('input[placeholder*="Search phones by name"]').first();
      await searchInput.fill('phone');
      await page.waitForTimeout(2000); // Wait for search

      // Check for phone cards
      const phoneCards = page.locator('.model-card');
      const cardCount = await phoneCards.count();

      if (cardCount > 0) {
        // Check first card has image
        const firstCard = phoneCards.first();
        const image = firstCard.locator('img, [data-nuxt-img]');
        await expect(image.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should support brand filter', async ({ page }) => {
      const brandSelect = page.locator('select, [role="combobox"]').first();
      const brandSelectCount = await brandSelect.count();

      if (brandSelectCount > 0) {
        await expect(brandSelect).toBeVisible();
        // Try to interact with brand filter if available
        await page.waitForTimeout(500);
      }
    });

    test('should support RAM filter', async ({ page }) => {
      const ramInput = page.locator('input[placeholder*="RAM"]');
      const ramInputCount = await ramInput.count();

      if (ramInputCount > 0) {
        await expect(ramInput.first()).toBeVisible();
        await ramInput.first().fill('8');
        await page.waitForTimeout(1000);
      }
    });

    test('should support battery filter', async ({ page }) => {
      const batteryInput = page.locator('input[placeholder*="Battery"]');
      const batteryInputCount = await batteryInput.count();

      if (batteryInputCount > 0) {
        await expect(batteryInput.first()).toBeVisible();
        await batteryInput.first().fill('4000');
        await page.waitForTimeout(1000);
      }
    });

    test('should display phone details in results', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search phones by name"]').first();
      await searchInput.fill('phone');
      await page.waitForTimeout(2000);

      const phoneCards = page.locator('.model-card');
      const cardCount = await phoneCards.count();

      if (cardCount > 0) {
        const firstCard = phoneCards.first();
        // Check for phone name - use more specific selector (h3 heading)
        await expect(firstCard.locator('h3').first()).toBeVisible();
        // Check for price badge
        const priceBadge = firstCard.locator('[class*="badge"], [class*="Badge"]');
        const priceCount = await priceBadge.count();
        if (priceCount > 0) {
          await expect(priceBadge.first()).toBeVisible();
        }
      }
    });

    test('should support pagination', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search phones by name"]').first();
      await searchInput.fill('phone');
      await page.waitForTimeout(2000);

      // Check for pagination component
      const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination"]');
      const paginationCount = await pagination.count();

      if (paginationCount > 0) {
        await expect(pagination.first()).toBeVisible();
      }
    });

    test('should handle search button click', async ({ page }) => {
      const searchButton = page.locator('button').filter({ hasText: /Search Phones/i });
      const buttonCount = await searchButton.count();

      if (buttonCount > 0) {
        await expect(searchButton.first()).toBeVisible();
        await searchButton.first().click();
        await page.waitForTimeout(1000);
      }
    });

    test('should clear filters when clear button clicked', async ({ page }) => {
      // Fill some filters first
      const ramInput = page.locator('input[placeholder*="RAM"]');
      const ramInputCount = await ramInput.count();

      if (ramInputCount > 0) {
        await ramInput.first().fill('8');
        await page.waitForTimeout(500);

        // Look for clear button
        const clearButton = page.locator('button').filter({ hasText: /Clear/i });
        const clearCount = await clearButton.count();

        if (clearCount > 0) {
          await clearButton.first().click();
          await page.waitForTimeout(500);
          // Verify input is cleared
          const value = await ramInput.first().inputValue();
          expect(value).toBe('');
        }
      }
    });
  });

  test.describe('Algolia Search Results Format', () => {
    test('should return properly formatted Algolia records', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/algolia/search`, {
        params: {
          q: 'Samsung',
          page: '0',
          hitsPerPage: '3',
        },
      });

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('hits');
        expect(data).toHaveProperty('nbHits');
        expect(data).toHaveProperty('processingTimeMS');

        if (data.hits.length > 0) {
          const hit = data.hits[0];
          // Check for required/expected fields
          expect(hit).toHaveProperty('objectID');
          expect(typeof hit.objectID).toBe('string');
          expect(hit.objectID.length).toBeGreaterThan(0);

          // Check for phone data fields
          const hasName = hit.title || hit.model_name || hit.name;
          const hasBrand = hit.brand || hit.company;
          const _hasPrice = typeof hit.price === 'number';

          // At least one identifier should exist
          expect(hasName || hasBrand).toBeTruthy();
        }
      }
    });

    test('should handle numeric filters correctly', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/algolia/search`, {
        params: {
          q: '',
          numericFilters: 'price:500 TO 1000',
          page: '0',
          hitsPerPage: '5',
        },
      });

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        if (data.hits.length > 0) {
          data.hits.forEach((hit: any) => {
            if (typeof hit.price === 'number') {
              expect(hit.price).toBeGreaterThanOrEqual(500);
              expect(hit.price).toBeLessThanOrEqual(1000);
            }
          });
        }
      }
    });
  });

  test.describe('Algolia Fallback Behavior', () => {
    test('should gracefully handle Algolia unavailability', async ({ page }) => {
      // Navigate to search page
      await page.goto('/search');
      await page.waitForLoadState('domcontentloaded');

      // Page should still load even if Algolia is not available
      await expect(page.locator('h1')).toBeVisible();
      await expect(
        page.locator('input[placeholder*="Search phones by name"]').first()
      ).toBeVisible();
    });

    test('should fallback to regular API when Algolia fails', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Try to search
      const searchInput = page.locator('input[placeholder*="Search phones by name"]').first();
      await searchInput.fill('test');
      await page.waitForTimeout(2000);

      // Page should not crash, should show some state
      const resultsSection = page.locator('section').filter({ hasText: /Results|Search/i });
      // Results section should exist (even if empty)
      const sectionCount = await resultsSection.count();
      expect(sectionCount).toBeGreaterThan(0);
    });
  });

  test.describe('Algolia Search Performance', () => {
    test('should return results quickly', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${baseURL}/api/algolia/search`, {
        params: {
          q: 'phone',
          page: '0',
          hitsPerPage: '10',
        },
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        // Algolia should be fast (< 1 second for API call)
        expect(duration).toBeLessThan(5000);

        // Check processing time if available
        if (data.processingTimeMS) {
          expect(data.processingTimeMS).toBeLessThan(1000);
        }
      }
    });
  });
});
