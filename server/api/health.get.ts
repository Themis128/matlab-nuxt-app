import { getPythonApiUrl } from '../utils/get-python-api-url';

export default defineEventHandler(async (event: any) => {
  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }
  try {
    const pythonApiUrl = getPythonApiUrl(event);
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === '1';

    try {
      const response = await fetch(`${pythonApiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // Increased from 3s to 5s
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        // Handle non-2xx responses
        throw new Error(`Python API returned status ${response.status}`);
      }
    } catch (e) {
      // Suppress error logs during test runs or when API is intentionally disabled
      const isApiDisabled = process.env.NUXT_PUBLIC_PY_API_DISABLED === '1';
      if (!isTestEnv && !isApiDisabled) {
        // Only log if not in test and API is not intentionally disabled
        // Use debug level instead of error to reduce noise
        if (process.env.NODE_ENV === 'development') {
          console.debug(
            'Python API health check failed (this is normal if API is not running):',
            e instanceof Error ? e.message : 'Unknown error'
          );
        }
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
      });
    }
  } catch (error: unknown) {
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === '1';
    const isApiDisabled = process.env.NUXT_PUBLIC_PY_API_DISABLED === '1';

    // Suppress error logs during test runs or when API is intentionally disabled
    if (!isTestEnv && !isApiDisabled) {
      // Only log actual unexpected errors (not connection failures)
      if (process.env.NODE_ENV === 'development') {
        console.debug(
          'Health check error:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
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
    });
  }
});
