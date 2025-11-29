import { callPythonAPI } from '~/server/utils/python-api'

export default defineEventHandler(async event => {
  // Set CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true }
  }
  try {
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000'

    try {
      const response = await fetch(`${pythonApiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })

      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        // Handle non-2xx responses
        throw new Error(`Python API returned status ${response.status}`)
      }
    } catch (e) {
      console.error('Error fetching Python API health:', e)

      // Return actual error status instead of mock response
      throw createError({
        statusCode: 503,
        statusMessage: 'Service Unavailable',
        data: {
          status: 'unhealthy',
          message: 'Python API is not available',
          error: e instanceof Error ? e.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      })
    }
  } catch (error: unknown) {
    console.error('Unexpected error in health check:', error)

    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      data: {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    })
  }
})
