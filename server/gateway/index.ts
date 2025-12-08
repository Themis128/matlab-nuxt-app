/**
 * API Gateway
 *
 * Centralized gateway for all external API communication.
 * Provides unified error handling, retries, caching, and request/response transformation.
 *
 * @module server/gateway
 */

import { getPythonApiUrl } from '../utils/get-python-api-url';
import { circuitBreakers } from '../utils/circuit-breaker';
import { withCache, cacheKey } from '../utils/cache';
import { logger } from '../utils/logger';
import { AppError, ErrorCodes } from '../utils/error-handler';

export interface GatewayOptions {
  useCache?: boolean;
  cacheTTL?: number;
  timeout?: number;
  retries?: number;
  skipCircuitBreaker?: boolean;
}

export interface GatewayResponse<T = any> {
  data: T;
  metadata?: {
    cached?: boolean;
    responseTime?: number;
    retries?: number;
  };
}

/**
 * Python API Client
 */
class PythonAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    gatewayOptions: GatewayOptions = {}
  ): Promise<T> {
    const { timeout = 10000, retries = 2 } = gatewayOptions;

    const makeRequest = async (): Promise<T> => {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Add runtime type checking for the response
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid API response format: expected object');
      }

      return data as T;
    };

    // Retry logic with exponential backoff
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await makeRequest();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries - 1) {
          const delay = 500 * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  // Prediction methods
  async predictPrice(data: any, options?: GatewayOptions): Promise<any> {
    return this.request(
      '/api/predict/price',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      options
    );
  }

  async predictRAM(data: any, options?: GatewayOptions): Promise<any> {
    return this.request(
      '/api/predict/ram',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      options
    );
  }

  async predictBattery(data: any, options?: GatewayOptions): Promise<any> {
    return this.request(
      '/api/predict/battery',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      options
    );
  }

  async predictBrand(data: any, options?: GatewayOptions): Promise<any> {
    return this.request(
      '/api/predict/brand',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      options
    );
  }

  async advancedPredict(data: any, options?: GatewayOptions): Promise<any> {
    return this.request(
      '/api/advanced/predict',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      options
    );
  }

  // Health check
  async health(options?: GatewayOptions): Promise<any> {
    return this.request('/health', { method: 'GET' }, options);
  }
}

/**
 * Algolia Search Client
 */
class AlgoliaSearchClient {
  async search(_query: string, _options?: GatewayOptions): Promise<any> {
    // This would integrate with Algolia search
    // For now, delegate to existing search endpoint
    try {
      // Use fetch instead of $fetch in server context
      const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/algolia/search?q=${encodeURIComponent(_query)}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`Search API returned ${response.status}`);
      }

      return response.json();
    } catch (error) {
      logger.logError(
        'Algolia search failed',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }
}

/**
 * Main API Gateway Class
 */
export class APIGateway {
  private pythonAPI: PythonAPIClient;
  private algoliaSearch: AlgoliaSearchClient;
  private event?: any;

  constructor(event?: any) {
    const pythonApiUrl = getPythonApiUrl(event);
    this.pythonAPI = new PythonAPIClient(pythonApiUrl);
    this.algoliaSearch = new AlgoliaSearchClient();
    this.event = event;
  }

  /**
   * Execute request with gateway features (caching, circuit breaker, etc.)
   */
  private async executeWithGateway<T>(
    fn: () => Promise<T>,
    options: GatewayOptions = {}
  ): Promise<GatewayResponse<T>> {
    const { useCache = false, cacheTTL = 300, skipCircuitBreaker = false } = options;

    const startTime = Date.now();
    const retries = 0;

    // Generate cache key if caching is enabled
    const cacheKeyValue = useCache ? cacheKey('gateway', JSON.stringify(fn.toString())) : null;

    // Try cache first
    if (cacheKeyValue && useCache) {
      try {
        const cached = await withCache<T>(cacheKeyValue, async () => null as T, {
          ttl: cacheTTL,
          keyPrefix: '',
        });
        if (cached) {
          return {
            data: cached,
            metadata: {
              cached: true,
              responseTime: Date.now() - startTime,
            },
          };
        }
      } catch {
        // Cache miss, continue
      }
    }

    try {
      // Execute with circuit breaker if enabled
      const result = await (skipCircuitBreaker
        ? fn()
        : circuitBreakers.pythonAPI.execute(() => fn()));

      const responseTime = Date.now() - startTime;

      // Cache successful responses
      if (cacheKeyValue && useCache && result) {
        try {
          await withCache(cacheKeyValue, async () => result, {
            ttl: cacheTTL,
            keyPrefix: '',
          });
        } catch {
          // Cache failure shouldn't break the request
        }
      }

      return {
        data: result,
        metadata: {
          cached: false,
          responseTime,
          retries,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.logError(
        'Gateway request failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          responseTime,
          retries,
        }
      );

      // Check if circuit breaker is open
      if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
        throw new AppError('Service temporarily unavailable', 503, ErrorCodes.CIRCUIT_BREAKER_OPEN);
      }

      throw error;
    }
  }

  // Prediction methods
  async predictPrice(data: any, options?: GatewayOptions): Promise<GatewayResponse> {
    return this.executeWithGateway(() => this.pythonAPI.predictPrice(data, options), options);
  }

  async predictRAM(data: any, options?: GatewayOptions): Promise<GatewayResponse> {
    return this.executeWithGateway(() => this.pythonAPI.predictRAM(data, options), options);
  }

  async predictBattery(data: any, options?: GatewayOptions): Promise<GatewayResponse> {
    return this.executeWithGateway(() => this.pythonAPI.predictBattery(data, options), options);
  }

  async predictBrand(data: any, options?: GatewayOptions): Promise<GatewayResponse> {
    return this.executeWithGateway(() => this.pythonAPI.predictBrand(data, options), options);
  }

  async advancedPredict(data: any, options?: GatewayOptions): Promise<GatewayResponse> {
    return this.executeWithGateway(() => this.pythonAPI.advancedPredict(data, options), options);
  }

  // Search methods
  async searchPhones(query: string, options?: GatewayOptions): Promise<GatewayResponse> {
    return this.executeWithGateway(() => this.algoliaSearch.search(query, options), {
      ...options,
      useCache: options?.useCache ?? true,
    });
  }

  // Health check
  async health(_options?: GatewayOptions): Promise<GatewayResponse> {
    return this.executeWithGateway(() => this.pythonAPI.health(_options), {
      ..._options,
      skipCircuitBreaker: true,
    });
  }
}

/**
 * Get API Gateway instance
 */
export function getAPIGateway(event?: any): APIGateway {
  return new APIGateway(event);
}
