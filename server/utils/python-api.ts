/**
 * Utility to call Python API endpoints
 * Enhanced with circuit breaker, caching, and improved error handling
 */
import { getPythonApiUrl } from './get-python-api-url';
import { circuitBreakers } from './circuit-breaker';
import { withCache, cacheKey } from './cache';
import { logger } from './logger';
import { AppError, ErrorCodes } from './error-handler';

const PYTHON_API_TIMEOUT_MS = 10000; // Increased from 5s to 10s for ML predictions

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  initialDelay = 500
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt or for non-retryable errors
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Don't retry for client errors (4xx)
      if (error instanceof Error && error.message.includes('4')) {
        throw lastError;
      }

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export interface PythonAPIOptions {
  useCache?: boolean;
  cacheTTL?: number;
  timeout?: number;
  skipCircuitBreaker?: boolean;
}

/**
 * Execute the actual API call
 */
async function executeAPICall<T>(
  pythonApiUrl: string,
  endpoint: string,
  body: Record<string, unknown> | null,
  method: 'GET' | 'POST',
  timeout: number
): Promise<T> {
  return await retryWithBackoff(async () => {
    const requestOptions: RequestInit = {
      method,
      signal: AbortSignal.timeout(timeout),
    };

    // Only add body and content-type for non-GET requests
    if (method !== 'GET' && body) {
      requestOptions.headers = {
        'Content-Type': 'application/json',
      };
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${pythonApiUrl}${endpoint}`, requestOptions);

    // Parse response
    const data = await response.json();

    // If response is not OK, throw error
    if (!response.ok) {
      const error = new Error(`API returned ${response.status}: ${response.statusText}`);
      (error as any).statusCode = response.status;
      throw error;
    }

    return data as T;
  });
}

export async function callPythonAPI<T>(
  endpoint: string,
  body: Record<string, unknown> | null = null,
  event?: any,
  method: 'GET' | 'POST' = 'POST',
  options: PythonAPIOptions = {}
): Promise<T | null> {
  const {
    useCache = method === 'GET', // Cache GET requests by default
    cacheTTL = 300, // 5 minutes default
    timeout = PYTHON_API_TIMEOUT_MS,
    skipCircuitBreaker = false,
  } = options;

  const pythonApiUrl = getPythonApiUrl(event);
  const startTime = Date.now();

  // Generate cache key for GET requests
  const cacheKeyValue =
    method === 'GET' && useCache
      ? cacheKey('python-api', endpoint, JSON.stringify(body || {}))
      : null;

  // Try cache first for GET requests
  if (cacheKeyValue && useCache) {
    try {
      const cached = await withCache<T>(
        cacheKeyValue,
        async () => null as T, // Placeholder, will be replaced
        { ttl: cacheTTL, keyPrefix: '' }
      );
      if (cached) {
        logger.debug('Python API cache hit', { endpoint });
        return cached;
      }
    } catch {
      // Cache miss or error, continue to API call
    }
  }

  try {
    // Use circuit breaker to protect against cascading failures
    const result = await (skipCircuitBreaker
      ? executeAPICall<T>(pythonApiUrl, endpoint, body, method, timeout)
      : circuitBreakers.pythonAPI.execute(() =>
          executeAPICall<T>(pythonApiUrl, endpoint, body, method, timeout)
        ));

    const duration = Date.now() - startTime;
    logger.info('Python API call successful', {
      endpoint,
      method,
      duration,
    });

    // Cache successful GET responses
    if (cacheKeyValue && useCache && result) {
      try {
        await withCache(cacheKeyValue, async () => result, { ttl: cacheTTL, keyPrefix: '' });
      } catch {
        // Cache failure shouldn't break the request
        logger.warn('Failed to cache Python API response', { endpoint });
      }
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Check if circuit breaker is open
    if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
      logger.error('Python API circuit breaker is OPEN', {
        endpoint,
        duration,
        circuitState: circuitBreakers.pythonAPI.getState(),
      });

      throw new AppError(
        'Python API service is temporarily unavailable',
        503,
        ErrorCodes.CIRCUIT_BREAKER_OPEN
      );
    }

    logger.logError('Python API call failed', error as Error, {
      endpoint,
      method,
      duration,
    });

    // Return error structure for client handling
    if (error instanceof Error && 'statusCode' in error) {
      return {
        detail: error.message,
        statusCode: (error as any).statusCode,
      } as T;
    }

    // Python API not available, return null to fallback
    return null;
  }
}
