import { getPythonApiUrl } from '../utils/get-python-api-url'

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
    const pythonApiUrl = getPythonApiUrl(event)
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === '1'

    try {
      const response = await fetch(`${pythonApiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // Increased from 3s to 5s
      })

      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        // Handle non-2xx responses
        throw new Error(`Python API returned status ${response.status}`)
      }
    } catch (e) {
      // Suppress error logs during test runs to reduce spam
      if (!isTestEnv) {
        console.error('Error fetching Python API health:', e)
      }

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
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === '1'

    // Suppress error logs during test runs to reduce spam
    if (!isTestEnv) {
      console.error('Unexpected error in health check:', error)
    }

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
