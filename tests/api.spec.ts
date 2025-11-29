import { test, expect } from '@playwright/test'

test.describe('API Integration Tests', () => {
  test('should have working health endpoint', async ({ request }) => {
    // Test the health endpoint directly
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('status', 'healthy')
  })

  test('should perform price prediction via API', async ({ request }) => {
    const predictionData = {
      ram: 8,
      battery: 4000,
      screen: 6.1,
      weight: 174,
      year: 2024,
      company: 'Apple'
    }

    const response = await request.post('/api/predict/price', {
      data: predictionData
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('price')
    expect(typeof data.price).toBe('number')
    expect(data.price).toBeGreaterThan(0)
    expect(data.price).toBeLessThan(10000)
  })

  test('should perform RAM prediction via API', async ({ request }) => {
    const predictionData = {
      battery: 4000,
      screen: 6.1,
      weight: 174,
      year: 2024,
      price: 2712,
      company: 'Apple'
    }

    const response = await request.post('/api/predict/ram', {
      data: predictionData
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('ram')
    expect(typeof data.ram).toBe('number')
    expect(data.ram).toBeGreaterThan(0)
    expect(data.ram).toBeLessThan(32)
  })

  test('should perform battery prediction via API', async ({ request }) => {
    const predictionData = {
      ram: 8,
      screen: 6.1,
      weight: 174,
      year: 2024,
      price: 2712,
      company: 'Apple'
    }

    const response = await request.post('/api/predict/battery', {
      data: predictionData
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('battery')
    expect(typeof data.battery).toBe('number')
    expect(data.battery).toBeGreaterThan(1000)
    expect(data.battery).toBeLessThan(10000)
  })

  test('should perform brand prediction via API', async ({ request }) => {
    const predictionData = {
      ram: 8,
      battery: 4000,
      screen: 6.1,
      weight: 174,
      year: 2024,
      price: 2712,
      company: 'Apple'
    }

    const response = await request.post('/api/predict/brand', {
      data: predictionData
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('brand')
    expect(typeof data.brand).toBe('string')
    expect(data.brand.length).toBeGreaterThan(0)
  })

  test('should handle invalid prediction data', async ({ request }) => {
    // Test with missing required fields
    const invalidData = {
      ram: 8
      // Missing other required fields
    }

    const response = await request.post('/api/predict/price', {
      data: invalidData
    })

    // Should return validation error
    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  test('should handle API errors gracefully', async ({ request }) => {
    // Test with invalid data that might cause server errors
    const invalidData = {
      ram: -1, // Invalid negative value
      battery: 4000,
      screen: 6.1,
      weight: 174,
      year: 2024,
      company: 'Apple'
    }

    const response = await request.post('/api/predict/price', {
      data: invalidData
    })

    // Should handle gracefully (either validation error or processed)
    expect([200, 400, 422]).toContain(response.status())
  })

  test('should support enhanced prediction features', async ({ request }) => {
    const enhancedData = {
      ram: 8,
      battery: 4000,
      screen: 6.1,
      weight: 174,
      year: 2024,
      company: 'Apple',
      frontCamera: 12,
      backCamera: 48,
      storage: 128,
      processor: 'A17 Bionic'
    }

    const response = await request.post('/api/predict/price', {
      data: enhancedData
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('price')
    expect(typeof data.price).toBe('number')
  })

  test('should handle concurrent API requests', async ({ request }) => {
    // Make multiple concurrent requests
    const requests = Array(5).fill(null).map(() =>
      request.post('/api/predict/price', {
        data: {
          ram: 8,
          battery: 4000,
          screen: 6.1,
          weight: 174,
          year: 2024,
          company: 'Apple'
        }
      })
    )

    const responses = await Promise.all(requests)

    // All requests should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy()
    })

    // All should return valid price predictions
    const dataPromises = responses.map(r => r.json())
    const dataArray = await Promise.all(dataPromises)

    dataArray.forEach(data => {
      expect(data).toHaveProperty('price')
      expect(typeof data.price).toBe('number')
      expect(data.price).toBeGreaterThan(0)
    })
  })

  test('should have proper CORS headers', async ({ request }) => {
    const response = await request.get('/api/health', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    })

    expect(response.ok()).toBeTruthy()

    // Check CORS headers
    const headers = response.headers()
    expect(headers['access-control-allow-origin']).toBe('*')
    expect(headers['access-control-allow-methods']).toContain('GET')
    expect(headers['access-control-allow-methods']).toContain('POST')
  })

  test('should handle rate limiting gracefully', async ({ request }) => {
    // Make many rapid requests to test rate limiting
    const requests = Array(20).fill(null).map(() =>
      request.post('/api/predict/price', {
        data: {
          ram: 8,
          battery: 4000,
          screen: 6.1,
          weight: 174,
          year: 2024,
          company: 'Apple'
        }
      })
    )

    const responses = await Promise.all(requests)

    // Most requests should succeed, some might be rate limited
    const successCount = responses.filter(r => r.ok()).length
    const rateLimitedCount = responses.filter(r => r.status() === 429).length

    // At least 80% should succeed
    expect(successCount / responses.length).toBeGreaterThan(0.8)

    // If there are rate limited requests, they should have proper status
    if (rateLimitedCount > 0) {
      responses.filter(r => r.status() === 429).forEach(response => {
        expect(response.status()).toBe(429)
      })
    }
  })
})
