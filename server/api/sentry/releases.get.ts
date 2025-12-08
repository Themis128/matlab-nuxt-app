/**
 * Sentry Releases API Endpoint
 *
 * Fetches recent releases from Sentry API.
 */

export default defineEventHandler(async (event: any) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const limit = parseInt((query.limit as string) || '5');

  // Validate limit parameter
  if (limit < 1 || limit > 50) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Limit must be between 1 and 50',
    });
  }

  // Support both naming conventions - read from runtime config for better security
  const SENTRY_ORG =
    (config as any).sentryOrg || process.env.SENTRY_ORG || process.env.SENTRY_ORG_SLUG;
  const SENTRY_PROJECT =
    (config as any).sentryProject ||
    process.env.SENTRY_PROJECT ||
    process.env.SENTRY_PROJECT_SLUG ||
    'matlab';
  const SENTRY_AUTH_TOKEN =
    (config as any).sentryAuthToken ||
    process.env.SENTRY_AUTH_TOKEN ||
    process.env.SENTRY_ACCESS_TOKEN;

  // Validate required configuration
  if (!SENTRY_ORG || !SENTRY_AUTH_TOKEN) {
    console.error('[Sentry API] Missing required configuration');
    throw createError({
      statusCode: 500,
      statusMessage: 'Sentry configuration missing. Set SENTRY_ORG and SENTRY_AUTH_TOKEN.',
    });
  }

  // Validate token format (basic check)
  if (!SENTRY_AUTH_TOKEN.match(/^[a-f0-9]{64}$/)) {
    console.error('[Sentry API] Invalid token format');
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid Sentry authentication token format',
    });
  }

  try {
    const params = new URLSearchParams({
      per_page: limit.toString(),
      project: SENTRY_PROJECT,
    });
    const url = `https://sentry.io/api/0/organizations/${SENTRY_ORG}/releases/?${params.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Sentry API request timeout');
      }
      throw fetchError;
    }

    if (!response.ok) {
      throw new Error(`Sentry API error: ${response.status} ${response.statusText}`);
    }

    const releases = await response.json();

    // Transform Sentry API response
    const transformedReleases = releases.map((release: any) => ({
      version: release.version,
      dateCreated: release.dateCreated,
      dateReleased: release.dateReleased,
      url: release.url,
      newIssues: release.newIssues || 0,
      resolvedIssues: release.resolvedIssues || 0,
    }));

    return {
      releases: transformedReleases,
      count: transformedReleases.length,
    };
  } catch (error) {
    // Error is already handled by error handler middleware
    // Logging is done through the error handler
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch Sentry releases: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
