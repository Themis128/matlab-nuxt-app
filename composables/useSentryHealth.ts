/**
 * Sentry Health Monitoring Composable
 *
 * Provides functions to monitor Sentry integration health
 * and check configuration status.
 */

export interface SentryHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    configuration: {
      dsn: boolean;
      org: boolean;
      project: boolean;
      authToken: boolean;
      environment: string;
    };
    api: {
      accessible: boolean;
      error: string | null;
    };
    timestamp: string;
  };
  summary: {
    configured: boolean;
    apiConnected: boolean;
    ready: boolean;
  };
}

/**
 * Composable for Sentry health monitoring
 */
export const useSentryHealth = () => {
  /**
   * Check Sentry health status
   */
  const checkHealth = async (): Promise<SentryHealthStatus | null> => {
    try {
      const response = await $fetch<SentryHealthStatus>('/api/sentry/health');
      return response;
    } catch (error) {
      const logger = useSentryLogger();
      logger.logError(
        'Failed to check Sentry health',
        error instanceof Error ? error : new Error(String(error)),
        {
          composable: 'useSentryHealth',
          action: 'checkHealth',
        }
      );
      return null;
    }
  };

  /**
   * Check if Sentry is properly configured
   */
  const isConfigured = (): boolean => {
    const dsn = process.env.SENTRY_DSN;
    return !!dsn && !dsn.includes('your-dsn') && !dsn.includes('your-project-id');
  };

  /**
   * Check if Sentry API is accessible
   */
  const isApiAccessible = async (): Promise<boolean> => {
    const health = await checkHealth();
    return health?.summary.apiConnected || false;
  };

  /**
   * Get configuration status
   */
  const getConfigStatus = () => {
    return {
      dsn: !!process.env.SENTRY_DSN && !process.env.SENTRY_DSN.includes('your-dsn'),
      org: !!process.env.SENTRY_ORG,
      project: !!process.env.SENTRY_PROJECT,
      authToken: !!process.env.SENTRY_AUTH_TOKEN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    };
  };

  return {
    checkHealth,
    isConfigured,
    isApiAccessible,
    getConfigStatus,
  };
};
