/**
 * Sentry Issues API Endpoint
 *
 * Fetches unresolved issues from Sentry API.
 * Requires SENTRY_AUTH_TOKEN and SENTRY_ORG environment variables.
 */

export default defineEventHandler(async (event: any) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const limit = parseInt((query.limit as string) || '10');

  // Validate limit parameter
  if (limit < 1 || limit > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Limit must be between 1 and 100',
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
      limit: limit.toString(),
      query: 'is:unresolved',
      sort: 'freq', // Sort by frequency (most frequent first) - valid values: date, new, priority, freq, user
    });
    const url = `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?${params.toString()}`;
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

    const issues = await response.json();

    // Transform Sentry API response to our format
    const transformedIssues = issues.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      culprit: issue.culprit,
      level: issue.level,
      status: issue.status,
      count: issue.count,
      userCount: issue.userCount,
      firstSeen: issue.firstSeen,
      lastSeen: issue.lastSeen,
      permalink: issue.permalink,
    }));

    return {
      issues: transformedIssues,
      count: transformedIssues.length,
    };
  } catch (error) {
    // Error is already handled by error handler middleware
    // Logging is done through the error handler
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch Sentry issues: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
