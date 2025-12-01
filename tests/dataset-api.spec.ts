import { test, expect } from '@playwright/test'

const baseUrl = process.env.NUXT_API_URL || 'http://localhost:3000/api'

test.describe('Dataset API Endpoints', () => {
  test('GET /dataset/columns returns columns', async ({ request }) => {
    const response = await request.get(`${baseUrl}/dataset/columns`)
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBeGreaterThan(0)
  })

  test('GET /dataset/cleaned-data returns cleaned data', async ({ request }) => {
    const response = await request.get(`${baseUrl}/dataset/cleaned-data`)
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBeGreaterThan(0)
  })

  test('POST /dataset/compare returns comparison', async ({ request }) => {
    const response = await request.post(`${baseUrl}/dataset/compare`, {
      data: { modelNames: ['iPhone 16 Pro', 'Galaxy S24 Ultra'] },
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('models')
    expect(Array.isArray(data.models)).toBeTruthy()
    expect(data.models.length).toBeGreaterThan(1)
  })

  test('GET /dataset/statistics returns statistics', async ({ request }) => {
    const response = await request.get(`${baseUrl}/dataset/statistics`)
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('totalModels')
    expect(data).toHaveProperty('brands')
  })

  test('GET /dataset/preprocessing-status returns status', async ({ request }) => {
    const response = await request.get(`${baseUrl}/dataset/preprocessing-status`)
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('status')
  })
})
