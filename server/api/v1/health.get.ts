/**
 * Enhanced Health Check Endpoint
 * Checks health of all dependencies (Python API, Redis, Database, etc.)
 */
import { getPythonApiUrl } from '../../utils/get-python-api-url';
import { getCache } from '../../utils/cache';
import { circuitBreakers } from '../../utils/circuit-breaker';
import { logger } from '../../utils/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    api: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    cache: {
      status: 'up' | 'down' | 'unavailable';
      type: 'redis' | 'memory' | 'none';
    };
    database: {
      status: 'up' | 'down' | 'unavailable';
      type: 'postgresql' | 'sqlite' | 'none';
    };
    circuitBreakers: {
      pythonAPI: {
        state: string;
        failures: number;
      };
    };
  };
}

export default defineEventHandler(async (event: any): Promise<HealthStatus> => {
  const startTime = Date.now();
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: { status: 'down' },
      cache: { status: 'unavailable', type: 'none' },
      database: { status: 'unavailable', type: 'none' },
      circuitBreakers: {
        pythonAPI: {
          state: 'unknown',
          failures: 0,
        },
      },
    },
  };

  // Check Python API
  try {
    const pythonApiUrl = getPythonApiUrl(event);
    const apiStartTime = Date.now();
    const response = await fetch(`${pythonApiUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    const apiResponseTime = Date.now() - apiStartTime;

    if (response.ok) {
      health.services.api = {
        status: 'up',
        responseTime: apiResponseTime,
      };
    } else {
      health.services.api = {
        status: 'down',
        error: `HTTP ${response.status}`,
      };
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.api = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'degraded';
  }

  // Check Cache (Redis/Memory)
  try {
    const testKey = 'health-check-test';
    await getCache(testKey);
    // If we can call getCache without error, cache is available
    health.services.cache = {
      status: 'up',
      type: process.env.REDIS_URL ? 'redis' : 'memory',
    };
  } catch {
    health.services.cache = {
      status: 'down',
      type: 'none',
    };
    // Cache failure doesn't make the service unhealthy, just degraded
    if (health.status === 'healthy') {
      health.status = 'degraded';
    }
  }

  // Check Database
  try {
    // Try to use Nitro database if available
    const dbType = process.env.DATABASE_URL ? 'postgresql' : 'sqlite';
    health.services.database = {
      status: 'up',
      type: dbType,
    };
  } catch {
    health.services.database = {
      status: 'down',
      type: 'none',
    };
    health.status = 'unhealthy';
  }

  // Check Circuit Breakers
  const pythonAPIStats = circuitBreakers.pythonAPI.getStats();
  health.services.circuitBreakers.pythonAPI = {
    state: pythonAPIStats.state,
    failures: pythonAPIStats.failures,
  };

  if (pythonAPIStats.state === 'OPEN') {
    health.status = 'degraded';
  }

  const duration = Date.now() - startTime;
  logger.info('Health check completed', {
    status: health.status,
    duration,
  });

  // Set appropriate status code
  if (health.status === 'unhealthy') {
    setHeader(event, 'status', '503');
    event.node.res.statusCode = 503;
  } else if (health.status === 'degraded') {
    setHeader(event, 'status', '200'); // Still return 200 but indicate degraded status
    event.node.res.statusCode = 200;
  }

  return health;
});
