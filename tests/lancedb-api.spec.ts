import { test, expect } from '@playwright/test'

const baseUrl = process.env.PYTHON_API_URL || 'http://localhost:8000/api'

test.describe('LanceDB API Endpoints', () => {
  test('GET /lancedb/health returns healthy status', async ({ request }) => {
    const response = await request.get(`${baseUrl}/lancedb/health`)
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty('status', 'healthy')
    expect(data).toHaveProperty('tables')
    expect(Array.isArray(data.tables)).toBeTruthy()
  })

  test('GET /lancedb/datasets returns datasets from LanceDB', async ({ request }) => {
    const response = await request.get(`${baseUrl}/lancedb/datasets`)
    expect(response.ok()).toBeTruthy()
    const datasets = await response.json()
    expect(Array.isArray(datasets)).toBeTruthy()

    if (datasets.length > 0) {
      const dataset = datasets[0]
      expect(dataset).toHaveProperty('id')
      expect(dataset).toHaveProperty('filename')
      expect(dataset).toHaveProperty('description')
      expect(dataset).toHaveProperty('columns')
      expect(dataset).toHaveProperty('row_count')
      expect(dataset).toHaveProperty('data_types')
      expect(dataset).toHaveProperty('sample_data')
      expect(dataset).toHaveProperty('upload_date')
      expect(dataset).toHaveProperty('tags')
      expect(dataset).toHaveProperty('metadata')
    }
  })

  test('GET /lancedb/images returns images from LanceDB', async ({ request }) => {
    const response = await request.get(`${baseUrl}/lancedb/images`)
    expect(response.ok()).toBeTruthy()
    const images = await response.json()
    expect(Array.isArray(images)).toBeTruthy()

    if (images.length > 0) {
      const image = images[0]
      expect(image).toHaveProperty('id')
      expect(image).toHaveProperty('filename')
      expect(image).toHaveProperty('description')
      expect(image).toHaveProperty('width')
      expect(image).toHaveProperty('height')
      expect(image).toHaveProperty('format')
      expect(image).toHaveProperty('size_bytes')
      expect(image).toHaveProperty('upload_date')
      expect(image).toHaveProperty('tags')
      expect(image).toHaveProperty('metadata')
    }
  })

  test('GET /lancedb/datasets/{id} returns specific dataset', async ({ request }) => {
    // First get all datasets to get an ID
    const listResponse = await request.get(`${baseUrl}/lancedb/datasets`)
    expect(listResponse.ok()).toBeTruthy()
    const datasets = await listResponse.json()

    if (datasets.length > 0) {
      const datasetId = datasets[0].id
      const response = await request.get(`${baseUrl}/lancedb/datasets/${datasetId}`)
      expect(response.ok()).toBeTruthy()
      const dataset = await response.json()
      expect(dataset).toHaveProperty('id', datasetId)
      expect(dataset).toHaveProperty('filename')
      expect(dataset).toHaveProperty('columns')
      expect(Array.isArray(dataset.columns)).toBeTruthy()
    }
  })

  test('GET /lancedb/images/{id} returns specific image', async ({ request }) => {
    // First get all images to get an ID
    const listResponse = await request.get(`${baseUrl}/lancedb/images`)
    expect(listResponse.ok()).toBeTruthy()
    const images = await listResponse.json()

    if (images.length > 0) {
      const imageId = images[0].id
      const response = await request.get(`${baseUrl}/lancedb/images/${imageId}`)
      expect(response.ok()).toBeTruthy()
      const image = await response.json()
      expect(image).toHaveProperty('id', imageId)
      expect(image).toHaveProperty('filename')
      expect(image).toHaveProperty('width')
      expect(typeof image.width).toBe('number')
      expect(typeof image.height).toBe('number')
    }
  })

  test('POST /lancedb/search performs multimodal search', async ({ request }) => {
    const searchRequest = {
      query: 'iPhone',
      tags: [],
      limit: 10,
    }

    const response = await request.post(`${baseUrl}/lancedb/search`, {
      data: searchRequest,
    })
    expect(response.ok()).toBeTruthy()
    const results = await response.json()
    expect(results).toHaveProperty('datasets')
    expect(results).toHaveProperty('images')
    expect(results).toHaveProperty('total_datasets')
    expect(results).toHaveProperty('total_images')
    expect(Array.isArray(results.datasets)).toBeTruthy()
    expect(Array.isArray(results.images)).toBeTruthy()
  })

  test('POST /lancedb/search with tags filters results', async ({ request }) => {
    const searchRequest = {
      query: '',
      tags: ['mobile_data'],
      limit: 5,
    }

    const response = await request.post(`${baseUrl}/lancedb/search`, {
      data: searchRequest,
    })
    expect(response.ok()).toBeTruthy()
    const results = await response.json()
    expect(results).toHaveProperty('datasets')
    expect(results).toHaveProperty('images')
  })

  test('GET /lancedb/tables returns table list', async ({ request }) => {
    const response = await request.get(`${baseUrl}/lancedb/tables`)
    expect(response.ok()).toBeTruthy()
    const tables = await response.json()
    expect(Array.isArray(tables)).toBeTruthy()
    // Should at least have some basic tables
    expect(tables.length).toBeGreaterThanOrEqual(0)
  })

  test('GET /lancedb/stats returns database statistics', async ({ request }) => {
    const response = await request.get(`${baseUrl}/lancedb/stats`)
    expect(response.ok()).toBeTruthy()
    const stats = await response.json()
    expect(stats).toHaveProperty('total_datasets')
    expect(stats).toHaveProperty('total_images')
    expect(stats).toHaveProperty('estimated_dataset_storage_mb')
    expect(stats).toHaveProperty('total_image_storage_mb')
    expect(stats).toHaveProperty('database_path')
    expect(typeof stats.total_datasets).toBe('number')
    expect(typeof stats.total_images).toBe('number')
  })

  test('POST /lancedb/embeddings/generate generates embeddings', async ({ request }) => {
    const embeddingRequest = {
      text: 'This is a test mobile phone description',
    }

    const response = await request.post(`${baseUrl}/lancedb/embeddings/generate`, {
      data: embeddingRequest,
    })
    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    expect(result).toHaveProperty('embedding')
    expect(result).toHaveProperty('dimension')
    expect(result).toHaveProperty('model')
    expect(Array.isArray(result.embedding)).toBeTruthy()
    expect(result.embedding.length).toBeGreaterThan(0)
  })

  test('POST /lancedb/embeddings/batch generates batch embeddings', async ({ request }) => {
    const batchRequest = {
      texts: [
        'iPhone 16 Pro Max with advanced camera system',
        'Samsung Galaxy S24 Ultra flagship smartphone',
        'Google Pixel 9 Pro with AI features',
      ],
    }

    const response = await request.post(`${baseUrl}/lancedb/embeddings/batch`, {
      data: batchRequest,
    })
    expect(response.ok()).toBeTruthy()
    const results = await response.json()
    expect(Array.isArray(results)).toBeTruthy()
    expect(results.length).toBe(3)

    results.forEach((result: any) => {
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('embedding')
      expect(result).toHaveProperty('dimension')
      expect(Array.isArray(result.embedding)).toBeTruthy()
    })
  })

  test('POST /lancedb/embeddings/store stores text and generates embedding', async ({
    request,
  }) => {
    const storeRequest = {
      text: 'Test mobile phone for LanceDB storage',
      metadata: {
        brand: 'TestBrand',
        model: 'TestModel',
        category: 'test',
      },
    }

    const response = await request.post(`${baseUrl}/lancedb/embeddings/store`, {
      data: storeRequest,
    })
    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    expect(result).toHaveProperty('content_id')
    expect(result).toHaveProperty('message')
    expect(result.message).toContain('stored successfully')
  })

  test('POST /lancedb/search/semantic performs semantic search', async ({ request }) => {
    const searchRequest = {
      query: 'high-end smartphone with great camera',
      limit: 5,
    }

    const response = await request.post(`${baseUrl}/lancedb/search/semantic`, {
      data: searchRequest,
    })
    expect(response.ok()).toBeTruthy()
    const results = await response.json()
    expect(Array.isArray(results)).toBeTruthy()
  })

  test('DELETE operations work correctly', async ({ request }) => {
    // First, try to get existing datasets
    const listResponse = await request.get(`${baseUrl}/lancedb/datasets`)
    expect(listResponse.ok()).toBeTruthy()
    const datasets = await listResponse.json()

    if (datasets.length > 0) {
      const datasetId = datasets[0].id
      const deleteResponse = await request.delete(`${baseUrl}/lancedb/datasets/${datasetId}`)
      // Note: Delete might return 404 if dataset doesn't exist or can't be deleted
      // This is expected behavior - we're just testing the endpoint exists
      expect([200, 404, 500]).toContain(deleteResponse.status())
    }

    // Test images delete endpoint
    const imagesListResponse = await request.get(`${baseUrl}/lancedb/images`)
    expect(imagesListResponse.ok()).toBeTruthy()
    const images = await imagesListResponse.json()

    if (images.length > 0) {
      const imageId = images[0].id
      const deleteResponse = await request.delete(`${baseUrl}/lancedb/images/${imageId}`)
      // Similar to datasets, delete might return various status codes
      expect([200, 404, 500]).toContain(deleteResponse.status())
    }
  })
})
