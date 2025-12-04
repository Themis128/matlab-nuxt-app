import { test, expect } from '@playwright/test';

const baseUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';

test.describe('Prediction API Endpoints', () => {
  test('POST /api/predict/price returns valid price', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/predict/price`, {
      data: {
        ram: 8,
        battery: 5000,
        screen: 6.5,
        weight: 180,
        year: 2024,
        company: 'Samsung',
        front_camera: 12,
        back_camera: 108,
        processor: 'Snapdragon 8 Gen 2',
        storage: 256,
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('price');
    expect(data.price).toBeGreaterThan(0);
  });

  test('POST /api/predict/ram returns valid ram', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/predict/ram`, {
      data: {
        battery: 5000,
        screen: 6.5,
        weight: 180,
        year: 2024,
        price: 1200,
        company: 'Samsung',
        front_camera: 12,
        back_camera: 108,
        processor: 'Snapdragon 8 Gen 2',
        storage: 256,
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('ram');
    expect(data.ram).toBeGreaterThan(0);
  });

  test('POST /api/predict/battery returns valid battery', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/predict/battery`, {
      data: {
        ram: 8,
        screen: 6.5,
        weight: 180,
        year: 2024,
        price: 1200,
        company: 'Samsung',
        front_camera: 12,
        back_camera: 108,
        processor: 'Snapdragon 8 Gen 2',
        storage: 256,
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('battery');
    expect(data.battery).toBeGreaterThan(0);
  });

  test('POST /api/predict/brand returns valid brand', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/predict/brand`, {
      data: {
        ram: 8,
        battery: 5000,
        screen: 6.5,
        weight: 180,
        year: 2024,
        price: 1200,
        front_camera: 12,
        back_camera: 108,
        processor: 'Snapdragon 8 Gen 2',
        storage: 256,
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('brand');
    expect(typeof data.brand).toBe('string');
    expect(data.brand.length).toBeGreaterThan(0);
  });

  test('GET /health returns healthy status', async ({ request }) => {
    const response = await request.get(`${baseUrl}/health`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('version');
  });
});
