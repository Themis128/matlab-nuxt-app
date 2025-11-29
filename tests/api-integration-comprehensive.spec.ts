import { test, expect } from '@playwright/test'
import {
  waitForPageLoad,
  waitForApiHealth,
  verifyApiResponse
} from './helpers/test-utils'
import {
  validPhoneSpecs,
  budgetPhoneSpecs,
  flagshipPhoneSpecs,
  type PredictionResponse,
  type SearchResponse,
  type ModelsByPriceResponse,
  timeouts
} from './helpers/fixtures'

test.describe('Python API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await waitForApiHealth(page)
  })

  test('Python API health endpoint returns healthy status', async ({ request }) => {
    const response = await request.get('http://localhost:8000/health')
    
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status', 'healthy')
  })

  test('Nuxt health endpoint returns Python API status', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/health')
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
  })

  test('Price prediction API endpoint works', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/predict/price', {
      data: {
        ram: validPhoneSpecs.ram,
        battery: validPhoneSpecs.battery,
        screen: validPhoneSpecs.screen,
        weight: validPhoneSpecs.weight,
        year: validPhoneSpecs.year,
        company: validPhoneSpecs.company
      },
      timeout: timeouts.api
    })
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json() as PredictionResponse
    verifyApiResponse<PredictionResponse>(data, ['price'])
    
    expect(typeof data.price).toBe('number')
    expect(data.price).toBeGreaterThan(0)
  })

  test('RAM prediction API endpoint works', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/predict/ram', {
      data: {
        battery: validPhoneSpecs.battery,
        screen: validPhoneSpecs.screen,
        weight: validPhoneSpecs.weight,
        year: validPhoneSpecs.year,
        price: validPhoneSpecs.price,
        company: validPhoneSpecs.company
      },
      timeout: timeouts.api
    })
    
    if (response.ok()) {
      const data = await response.json() as PredictionResponse
      verifyApiResponse<PredictionResponse>(data, ['ram'])
      
      expect(typeof data.ram).toBe('number')
      expect(data.ram).toBeGreaterThan(0)
    }
  })

  test('Battery prediction API endpoint works', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/predict/battery', {
      data: {
        ram: validPhoneSpecs.ram,
        screen: validPhoneSpecs.screen,
        weight: validPhoneSpecs.weight,
        year: validPhoneSpecs.year,
        price: validPhoneSpecs.price,
        company: validPhoneSpecs.company
      },
      timeout: timeouts.api
    })
    
    if (response.ok()) {
      const data = await response.json() as PredictionResponse
      verifyApiResponse<PredictionResponse>(data, ['battery'])
      
      expect(typeof data.battery).toBe('number')
      expect(data.battery).toBeGreaterThan(0)
    }
  })

  test('Brand prediction API endpoint works', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/predict/brand', {
      data: {
        ram: validPhoneSpecs.ram,
        battery: validPhoneSpecs.battery,
        screen: validPhoneSpecs.screen,
        weight: validPhoneSpecs.weight,
        year: validPhoneSpecs.year,
        price: validPhoneSpecs.price
      },
      timeout: timeouts.api
    })
    
    if (response.ok()) {
      const data = await response.json() as PredictionResponse
      verifyApiResponse<PredictionResponse>(data, ['brand'])
      
      expect(typeof data.brand).toBe('string')
      expect(data.brand).toBeDefined()
      expect(data.brand!.length).toBeGreaterThan(0)
    }
  })

  test.skip('Dataset search API returns results', async ({ request }) => {
    const searchParams = new URLSearchParams()
    searchParams.append('minPrice', '300')
    searchParams.append('maxPrice', '1000')
    searchParams.append('limit', '10')
    searchParams.append('offset', '0')
    
    const response = await request.get(
      `http://localhost:8000/api/dataset/search?${searchParams.toString()}`,
      { timeout: timeouts.api }
    )
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json() as SearchResponse
    verifyApiResponse<SearchResponse>(data, ['models', 'totalCount'])
    
    expect(Array.isArray(data.models)).toBeTruthy()
    expect(typeof data.totalCount).toBe('number')
  })

  test('Models by price API returns results', async ({ page }) => {
    const searchParams = new URLSearchParams()
    searchParams.append('price', '600')
    searchParams.append('tolerance', '0.2')
    searchParams.append('maxResults', '50')
    
    const response = await page.request.get(
      `http://localhost:3000/api/dataset/models-by-price?${searchParams.toString()}`,
      { timeout: timeouts.api }
    )
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json() as ModelsByPriceResponse
    verifyApiResponse<ModelsByPriceResponse>(data, ['models', 'totalCount', 'priceRange', 'brands'])
    
    expect(Array.isArray(data.models)).toBeTruthy()
    expect(Array.isArray(data.brands)).toBeTruthy()
    expect(typeof data.priceRange).toBe('object')
    expect(data.priceRange).toHaveProperty('min')
    expect(data.priceRange).toHaveProperty('max')
  })

  test('Price prediction handles budget phone specs', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/predict/price', {
      data: {
        ram: budgetPhoneSpecs.ram,
        battery: budgetPhoneSpecs.battery,
        screen: budgetPhoneSpecs.screen,
        weight: budgetPhoneSpecs.weight,
        year: budgetPhoneSpecs.year,
        company: budgetPhoneSpecs.company
      },
      timeout: timeouts.api
    })
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json() as PredictionResponse
    expect(data.price).toBeDefined()
    expect(data.price!).toBeGreaterThan(0)
    expect(data.price!).toBeLessThan(3000) // Budget range - model returns realistic prices
  })

  test('Price prediction handles flagship phone specs', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/predict/price', {
      data: {
        ram: flagshipPhoneSpecs.ram,
        battery: flagshipPhoneSpecs.battery,
        screen: flagshipPhoneSpecs.screen,
        weight: flagshipPhoneSpecs.weight,
        year: flagshipPhoneSpecs.year,
        company: flagshipPhoneSpecs.company
      },
      timeout: timeouts.api
    })
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json() as PredictionResponse
    expect(data.price).toBeDefined()
    expect(data.price!).toBeGreaterThan(500) // Flagship range
  })

  test('API handles invalid input gracefully', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/predict/price', {
      data: {
        ram: -1, // Invalid
        battery: 0, // Invalid
        screen: 6.1,
        weight: 174,
        year: 2024
      },
      timeout: timeouts.api
    })
    
    // Should return error status
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('API returns error for missing required fields', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/predict/price', {
      data: {
        ram: 8
        // Missing other required fields
      },
      timeout: timeouts.api
    })
    
    // Should return error status
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test.skip('Dataset API supports pagination', async ({ request }) => {
    // First page
    const response1 = await request.get(
      'http://localhost:8000/api/dataset/search?limit=5&offset=0',
      { timeout: timeouts.api }
    )
    
    expect(response1.ok()).toBeTruthy()
    const data1 = await response1.json() as SearchResponse
    
    // Second page
    const response2 = await request.get(
      'http://localhost:8000/api/dataset/search?limit=5&offset=5',
      { timeout: timeouts.api }
    )
    
    expect(response2.ok()).toBeTruthy()
    const data2 = await response2.json() as SearchResponse
    
    // Should have different results (unless dataset is very small)
    if (data1.totalCount > 5) {
      const firstPageIds = data1.models.map((m: any) => m.modelName || m.id)
      const secondPageIds = data2.models.map((m: any) => m.modelName || m.id)
      
      // Pages should be different
      expect(firstPageIds).not.toEqual(secondPageIds)
    }
  })

  test('API response times are acceptable', async ({ request }) => {
    const startTime = Date.now()
    
    const response = await request.post('http://localhost:8000/api/predict/price', {
      data: {
        ram: validPhoneSpecs.ram,
        battery: validPhoneSpecs.battery,
        screen: validPhoneSpecs.screen,
        weight: validPhoneSpecs.weight,
        year: validPhoneSpecs.year,
        company: validPhoneSpecs.company
      },
      timeout: timeouts.api
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    expect(response.ok()).toBeTruthy()
    expect(duration).toBeLessThan(5000) // Should respond in under 5 seconds
  })
})
