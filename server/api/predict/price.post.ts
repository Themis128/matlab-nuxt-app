import { callPythonAPI } from '~/server/utils/python-api'

export default defineEventHandler(async (event) => {
  // Set CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true }
  }

  try {
    const body = await readBody(event)

    // Validate required fields
    const requiredFields = ['ram', 'battery', 'screen', 'weight', 'year', 'company']
    const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0)

    if (missingFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    const result = await callPythonAPI<{ price: number }>('/api/predict/price', body)

    if (!result) {
      throw new Error('Python API is not available')
    }

    return result
  } catch (error: unknown) {
    console.error('Error in price prediction:', error)
    throw error
  }
})
