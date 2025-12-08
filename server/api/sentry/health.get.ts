/**
 * Sentry Health Check Endpoint
 *
 * Checks Sentry integration health and configuration.
 * Useful for monitoring and diagnostics.
 */

export default defineEventHandler(async (_event: any) => {
  // Support both naming conventions: SENTRY_AUTH_TOKEN/SENTRY_ACCESS_TOKEN, SENTRY_ORG/SENTRY_ORG_SLUG, SENTRY_PROJECT/SENTRY_PROJECT_SLUG
  const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || process.env.SENTRY_ACCESS_TOKEN;
  const SENTRY_ORG = process.env.SENTRY_ORG || process.env.SENTRY_ORG_SLUG;
  const SENTRY_PROJECT = process.env.SENTRY_PROJECT || process.env.SENTRY_PROJECT_SLUG;

  const checks = {
    configuration: {
      dsn: !!process.env.SENTRY_DSN && !process.env.SENTRY_DSN.includes('your-dsn'),
      org: !!SENTRY_ORG,
      project: !!SENTRY_PROJECT,
      authToken: !!SENTRY_AUTH_TOKEN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    },
    api: {
      accessible: false,
      error: null as string | null,
    },
    timestamp: new Date().toISOString(),
  };

  // Test API connectivity if credentials are available
  if (checks.configuration.org && checks.configuration.authToken) {
    try {
      const org = SENTRY_ORG;
      const project = SENTRY_PROJECT || 'matlab';
      const authToken = SENTRY_AUTH_TOKEN;

      const testUrl = `https://sentry.io/api/0/projects/${org}/${project}/`;
      const response = await fetch(testUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      checks.api.accessible = response.ok;
      if (!response.ok) {
        checks.api.error = `API returned ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      checks.api.accessible = false;
      checks.api.error = error instanceof Error ? error.message : 'Unknown error';
    }
  } else {
    checks.api.error = 'Missing SENTRY_ORG or SENTRY_AUTH_TOKEN';
  }

  // Calculate overall health status
  const allConfigPresent =
    checks.configuration.dsn &&
    checks.configuration.org &&
    checks.configuration.project &&
    checks.configuration.authToken;

  const healthStatus = allConfigPresent && checks.api.accessible ? 'healthy' : 'degraded';

  return {
    status: healthStatus,
    checks,
    summary: {
      configured: allConfigPresent,
      apiConnected: checks.api.accessible,
      ready: healthStatus === 'healthy',
    },
  };
});
