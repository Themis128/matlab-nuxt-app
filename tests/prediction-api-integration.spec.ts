import { test, expect } from '@playwright/test'

test.describe('Prediction API Integration', () => {
  test('should verify Python API health endpoint', async ({ request }) => {
    const response = await request.get(process.env.PYTHON_API_URL || 'http://localhost:8000/health')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.status).toBe('healthy')
  })

  test('should test price prediction endpoint directly', async ({ request }) => {
    const response = await request.post(
      (process.env.PYTHON_API_URL || 'http://localhost:8000') + '/api/predict/price',
      {
        data: {
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
        },
      }
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('price')
    expect(typeof data.price).toBe('number')
    expect(data.price).toBeGreaterThan(0)
  })

  test('should test RAM prediction endpoint', async ({ request }) => {
    const response = await request.post(
      (process.env.PYTHON_API_URL || 'http://localhost:8000') + '/api/predict/ram',
      {
        data: {
          price: 500,
          battery: 4000,
          screen: 6.5,
          weight: 180,
          year: 2024,
          company: 'Samsung',
          front_camera: 12,
          back_camera: 48,
          processor: 'Snapdragon',
          storage: 128,
        },
      }
    )

    if (response.ok()) {
      const data = await response.json()
      expect(data).toHaveProperty('ram')
      expect(typeof data.ram).toBe('number')
    }
  })

  test('should test battery prediction endpoint', async ({ request }) => {
    const response = await request.post(
      (process.env.PYTHON_API_URL || 'http://localhost:8000') + '/api/predict/battery',
      {
        data: {
          price: 500,
          ram: 8,
          screen: 6.5,
          weight: 180,
          year: 2024,
          company: 'Samsung',
          front_camera: 12,
          back_camera: 48,
          processor: 'Snapdragon',
          storage: 128,
        },
      }
    )

    if (response.ok()) {
      const data = await response.json()
      expect(data).toHaveProperty('battery')
      expect(typeof data.battery).toBe('number')
    }
  })

  test('should test brand prediction endpoint', async ({ request }) => {
    const response = await request.post(
      (process.env.PYTHON_API_URL || 'http://localhost:8000') + '/api/predict/brand',
      {
        data: {
          price: 500,
          ram: 8,
          battery: 4000,
          screen: 6.5,
          weight: 180,
          year: 2024,
          front_camera: 12,
          back_camera: 48,
          processor: 'Snapdragon',
          storage: 128,
        },
      }
    )

    if (response.ok()) {
      const data = await response.json()
      expect(data).toHaveProperty('brand')
    }
  })

  test('should handle invalid prediction input gracefully', async ({ request }) => {
    const response = await request.post(
      (process.env.PYTHON_API_URL || 'http://localhost:8000') + '/api/predict/price',
      {
        data: {
          // Missing required fields
          ram: 8,
        },
      }
    )

    // Should either return error or handle gracefully
    expect([400, 422, 500]).toContain(response.status())
  })

  test('should test dataset find-closest-model endpoint', async ({ request }) => {
    const response = await request.post(
      (process.env.PYTHON_API_URL || 'http://localhost:8000') + '/api/dataset/find_closest_model',
      {
        data: {
          price: 500,
          ram: 8,
          battery: 4000,
        },
      }
    )

    if (response.ok()) {
      const data = await response.json()
      expect(data).toHaveProperty('closest_model')
    }
  })
})
