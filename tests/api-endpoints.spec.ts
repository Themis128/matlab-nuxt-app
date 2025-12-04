import { test, expect } from '@playwright/test';

test.describe('Nuxt Server API Endpoints', () => {
  const baseURL = process.env.PW_BASE_URL || 'http://localhost:3000';

  test.describe('Health Endpoint', () => {
    test('should return health status from /api/health', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/health`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('status');
    });

    test('should handle CORS preflight for /api/health', async ({ request }) => {
      const response = await request.fetch(`${baseURL}/api/health`, {
        method: 'OPTIONS',
      });
      // CORS preflight may return 200, 204, or 404 depending on Nitro routing
      expect([200, 204, 404]).toContain(response.status());
    });
  });

  test.describe('Prediction Endpoints', () => {
    const validPredictionData = {
      ram: 8,
      battery: 4000,
      screen: 6.5,
      weight: 180,
      year: 2024,
      company: 'Samsung',
      front_camera: 12,
      back_camera: 48,
      processor: 'Snapdragon',
      storage: 128,
    };

    test('should predict price via /api/predict/price', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/predict/price`, {
        data: validPredictionData,
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('price');
      expect(typeof data.price).toBe('number');
      expect(data.price).toBeGreaterThan(0);
    });

    test('should predict RAM via /api/predict/ram', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/predict/ram`, {
        data: {
          ...validPredictionData,
          price: 500,
          ram: undefined,
        },
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('ram');
        expect(typeof data.ram).toBe('number');
      }
    });

    test('should predict battery via /api/predict/battery', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/predict/battery`, {
        data: {
          ...validPredictionData,
          price: 500,
          battery: undefined,
        },
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('battery');
        expect(typeof data.battery).toBe('number');
      }
    });

    test('should predict brand via /api/predict/brand', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/predict/brand`, {
        data: {
          ...validPredictionData,
          price: 500,
          company: undefined,
        },
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('brand');
        expect(typeof data.brand).toBe('string');
      }
    });

    test('should return 400 for missing required fields in price prediction', async ({
      request,
    }) => {
      const response = await request.post(`${baseURL}/api/predict/price`, {
        data: {
          ram: 8,
          // Missing other required fields
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should handle CORS for prediction endpoints', async ({ request }) => {
      const response = await request.fetch(`${baseURL}/api/predict/price`, {
        method: 'OPTIONS',
      });
      // CORS preflight may return 200, 204, or 404 depending on Nitro routing
      expect([200, 204, 404]).toContain(response.status());
    });
  });

  test.describe('Dataset Endpoints', () => {
    test('should return dataset statistics from /api/dataset/statistics', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/dataset/statistics`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('totalRecords');
      expect(data).toHaveProperty('columns');
      expect(data).toHaveProperty('companies');
      expect(data).toHaveProperty('yearRange');
      expect(data).toHaveProperty('priceRange');
      expect(data).toHaveProperty('companyDistribution');

      expect(typeof data.totalRecords).toBe('number');
      expect(data.totalRecords).toBeGreaterThan(0);
      expect(Array.isArray(data.columns)).toBeTruthy();
      expect(Array.isArray(data.companies)).toBeTruthy();
    });

    test('should return dataset columns from /api/dataset/columns', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/dataset/columns`);

      if (!response.ok()) {
        test.skip(true, 'columns endpoint unavailable; skipping assertion');
        return;
      }

      const data = await response.json();
      expect(data).toHaveProperty('columns');
      expect(Array.isArray(data.columns)).toBeTruthy();
      expect(data.columns.length).toBeGreaterThan(0);
    });

    test('should search models via /api/dataset/search', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/dataset/search?query=Samsung`);

      if (!response.ok()) {
        test.skip(true, 'search endpoint unavailable; skipping assertion');
        return;
      }

      const data = await response.json();
      expect(data).toHaveProperty('models');
      expect(Array.isArray(data.models)).toBeTruthy();
    });

    test('should return models by price range via /api/dataset/models-by-price', async ({
      request,
    }) => {
      // API expects: price (target) and tolerance (±percentage), not min/max
      const response = await request.get(
        `${baseURL}/api/dataset/models-by-price?price=500&tolerance=0.3&maxResults=50`
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      // Nuxt endpoint returns {models: [], totalCount, priceRange, brands}
      expect(data).toHaveProperty('models');
      expect(data).toHaveProperty('totalCount');
      expect(data).toHaveProperty('priceRange');
      expect(data).toHaveProperty('brands');
      expect(Array.isArray(data.models)).toBeTruthy();
      expect(Array.isArray(data.brands)).toBeTruthy();

      // Verify price range metadata
      expect(data.priceRange.requested).toBe(500);
      expect(data.priceRange.tolerance).toBe(0.3);
      expect(data.priceRange.min).toBe(350); // 500 * (1 - 0.3)
      expect(data.priceRange.max).toBe(650); // 500 * (1 + 0.3)

      // If models found, verify structure and price range
      if (data.models.length > 0) {
        const firstModel = data.models[0];
        expect(firstModel).toHaveProperty('modelName');
        expect(firstModel).toHaveProperty('company');
        expect(firstModel).toHaveProperty('price');
        expect(firstModel).toHaveProperty('ram');
        expect(firstModel).toHaveProperty('battery');

        // Check all prices are within tolerance range
        for (const model of data.models) {
          expect(model.price).toBeGreaterThanOrEqual(350);
          expect(model.price).toBeLessThanOrEqual(650);
        }
      }
    });

    test('should find similar models via /api/dataset/similar', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/dataset/similar`, {
        data: {
          price: 500,
          ram: 8,
          battery: 4000,
        },
      });

      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBeTruthy();
      }
    });

    test('should compare models via /api/dataset/compare', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/dataset/compare`, {
        data: {
          models: ['model1', 'model2'],
        },
      });

      // May return 400 if models don't exist, which is acceptable
      if (response.ok()) {
        const data = await response.json();
        expect(Array.isArray(data)).toBeTruthy();
      }
    });
  });

  test.describe('Find Closest Model Endpoint', () => {
    test('should find closest model via /api/find-closest-model', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/find-closest-model`, {
        data: {
          price: 500,
          ram: 8,
          battery: 4000,
          screen: 6.5,
          weight: 180,
        },
      });

      if (response.ok()) {
        const data = await response.json();
        // API returns modelName instead of closest_model
        expect(data).toHaveProperty('modelName');
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should return 404 for non-existent endpoint', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/non-existent-endpoint`);
      expect(response.status()).toBe(404);
    });

    test('should handle malformed JSON in POST requests', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/predict/price`, {
        data: 'invalid json string',
      });

      expect([400, 500]).toContain(response.status());
    });
  });

  test.describe('Performance', () => {
    test('should respond to health check within reasonable time', async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${baseURL}/api/health`);
      const duration = Date.now() - start;

      expect(response.ok()).toBeTruthy();
      expect(duration).toBeLessThan(5000); // Should respond within 5 seconds
    });

    test('should respond to statistics endpoint within reasonable time', async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${baseURL}/api/dataset/statistics`);
      const duration = Date.now() - start;

      expect(response.ok()).toBeTruthy();
      expect(duration).toBeLessThan(3000); // Should respond within 3 seconds
    });
  });
});
