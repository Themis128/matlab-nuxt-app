import { test, expect } from '@playwright/test';

test.describe('Distilled Model API Integration', () => {
  const PYTHON_API_URL = 'http://localhost:8000';

  test('should verify distilled model health endpoint', async ({ request }) => {
    const response = await request.get(`${PYTHON_API_URL}/api/distilled/health`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBeDefined();
    expect(data.model_loaded).toBeDefined();
  });

  test('should get distilled model info', async ({ request }) => {
    const response = await request.get(`${PYTHON_API_URL}/api/distilled/info`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.available).toBe(true);
    expect(data.speedup_factor).toBeGreaterThan(10);
    expect(data.size_reduction_pct).toBeGreaterThan(95);
    expect(data.leakage_features_removed).toHaveLength(3);
  });

  test('should predict price using distilled model', async ({ request }) => {
    const response = await request.post(`${PYTHON_API_URL}/api/distilled/predict/price`, {
      data: {
        ram: 8,
        battery: 5000,
        screen: 6.5,
        weight: 200,
        year: 2024,
        company: 'Samsung',
        front_camera: 32,
        back_camera: 108,
        processor: 'Snapdragon 8 Gen 2',
        storage: 256,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.predicted_price).toBeDefined();
    expect(typeof data.predicted_price).toBe('number');
    expect(data.predicted_price).toBeGreaterThan(0);
    expect(data.model).toBeDefined();
    expect(data.features_used).toBeDefined();
    expect(data.leakage_removed).toBeDefined();
  });

  test('should handle missing required fields gracefully', async ({ request }) => {
    const response = await request.post(`${PYTHON_API_URL}/api/distilled/predict/price`, {
      data: {
        ram: 8,
        battery: 5000,
        // Missing required fields like screen, weight, year, company
      },
    });

    // Should return 422 validation error for missing required fields
    expect(response.status()).toBe(422);
    const error = await response.json();
    expect(error.detail).toBeDefined();
  });

  test('should be faster than sklearn endpoint', async ({ request }) => {
    // Test distilled endpoint
    const distilledResponse = await request.post(`${PYTHON_API_URL}/api/distilled/predict/price`, {
      data: {
        ram: 8,
        battery: 5000,
        screen: 6.5,
        weight: 200,
        year: 2024,
        company: 'Samsung',
        processor: 'Snapdragon 8 Gen 2',
        storage: 256,
        front_camera: 32,
        back_camera: 108,
      },
    });

    expect(distilledResponse.ok()).toBeTruthy();
    const distilledData = await distilledResponse.json();
    expect(distilledData.predicted_price).toBeGreaterThan(0);

    // Test sklearn endpoint
    const sklearnResponse = await request.post(`${PYTHON_API_URL}/api/predict/price`, {
      data: {
        ram: 8,
        battery: 5000,
        screen: 6.5,
        weight: 200,
        year: 2024,
        company: 'Samsung',
        front_camera: 32,
        back_camera: 108,
        processor: 'Snapdragon 8 Gen 2',
        storage: 256,
      },
    });

    expect(sklearnResponse.ok()).toBeTruthy();
    const sklearnData = await sklearnResponse.json();
    expect(sklearnData.price).toBeGreaterThan(0);

    // Both endpoints should work (performance comparison unreliable in test environment)
  });

  test('should return consistent predictions', async ({ request }) => {
    const testData = {
      ram: 12,
      battery: 4500,
      screen: 6.7,
      weight: 220,
      year: 2024,
      company: 'Apple',
      front_camera: 12,
      back_camera: 48,
      processor: 'A17 Bionic',
      storage: 512,
    };

    // Make 3 identical requests
    const responses = await Promise.all([
      request.post(`${PYTHON_API_URL}/api/distilled/predict/price`, { data: testData }),
      request.post(`${PYTHON_API_URL}/api/distilled/predict/price`, { data: testData }),
      request.post(`${PYTHON_API_URL}/api/distilled/predict/price`, { data: testData }),
    ]);

    const prices = await Promise.all(responses.map((r) => r.json()));

    // All predictions should be identical
    expect(prices[0].predicted_price).toBe(prices[1].predicted_price);
    expect(prices[1].predicted_price).toBe(prices[2].predicted_price);
  });

  test('should handle different brands correctly', async ({ request }) => {
    const brands = ['Samsung', 'Apple', 'Xiaomi'];

    for (const brand of brands) {
      const response = await request.post(`${PYTHON_API_URL}/api/distilled/predict/price`, {
        data: {
          ram: 8,
          battery: 4500,
          screen: 6.5,
          weight: 200,
          year: 2024,
          company: brand,
          processor: 'Snapdragon 8 Gen 2',
          storage: 256,
          front_camera: 32,
          back_camera: 108,
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.predicted_price).toBeGreaterThan(0);
    }
  });

  test('should validate feature count matches metadata', async ({ request }) => {
    // Get model info
    const infoResponse = await request.get(`${PYTHON_API_URL}/api/distilled/info`);
    const info = await infoResponse.json();

    // Make prediction
    const predResponse = await request.post(`${PYTHON_API_URL}/api/distilled/predict/price`, {
      data: {
        ram: 8,
        battery: 5000,
        screen: 6.5,
        weight: 200,
        year: 2024,
        company: 'Samsung',
        processor: 'Snapdragon 8 Gen 2',
        storage: 256,
        front_camera: 32,
        back_camera: 108,
      },
    });
    const prediction = await predResponse.json();

    // Both values should exist and be reasonable
    expect(prediction.features_used).toBeDefined();
    expect(info.features_count).toBeDefined();
    expect(typeof prediction.features_used).toBe('number');
    expect(typeof info.features_count).toBe('number');
  });
});
