/**
 * Sentry Statistics API Endpoint
 *
 * Fetches error statistics from Sentry API.
 */

export default defineEventHandler(async (_event: any) => {
  // Support both naming conventions
  const SENTRY_ORG = process.env.SENTRY_ORG || process.env.SENTRY_ORG_SLUG;
  const SENTRY_PROJECT = process.env.SENTRY_PROJECT || process.env.SENTRY_PROJECT_SLUG || 'matlab';
  const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || process.env.SENTRY_ACCESS_TOKEN;

  if (!SENTRY_ORG || !SENTRY_AUTH_TOKEN) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Sentry configuration missing. Set SENTRY_ORG and SENTRY_AUTH_TOKEN.',
    });
  }

  try {
    // Fetch unresolved issues count
    const unresolvedParams = new URLSearchParams({
      limit: '1',
      query: 'is:unresolved',
    });
    const issuesUrl = `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?${unresolvedParams.toString()}`;
    const controller1 = new AbortController();
    const timeoutId1 = setTimeout(() => controller1.abort(), 10000); // 10 second timeout

    let issuesResponse: Response;
    try {
      issuesResponse = await fetch(issuesUrl, {
        headers: {
          Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: controller1.signal,
      });
      clearTimeout(timeoutId1);

      if (!issuesResponse.ok) {
        throw new Error(`Sentry API error: ${issuesResponse.status}`);
      }

      const issuesData = await issuesResponse.json();
      const unresolvedCount =
        issuesData.length > 0
          ? parseInt(issuesResponse.headers.get('X-Sentry-Result-Count') || '0')
          : 0;

      // Fetch resolved issues count
      const resolvedParams = new URLSearchParams({
        limit: '1',
        query: 'is:resolved',
      });
      const resolvedUrl = `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?${resolvedParams.toString()}`;
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 10000); // 10 second timeout

      let resolvedResponse: Response;
      try {
        resolvedResponse = await fetch(resolvedUrl, {
          headers: {
            Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
          },
          signal: controller2.signal,
        });
        clearTimeout(timeoutId2);
      } catch (fetchError) {
        clearTimeout(timeoutId2);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Sentry API request timeout');
        }
        throw fetchError;
      }

      const resolvedData = await resolvedResponse.json();
      const resolvedCount =
        resolvedData.length > 0
          ? parseInt(resolvedResponse.headers.get('X-Sentry-Result-Count') || '0')
          : 0;

      // Calculate time-based stats (simplified - would need proper API calls for accurate data)
      const now = new Date();
      const _last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const _last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // For now, estimate based on unresolved issues
      // In production, you'd want to use Sentry's stats API
      const errors24h = Math.floor(unresolvedCount * 0.3); // Estimate
      const errors7d = Math.floor(unresolvedCount * 0.7); // Estimate

      return {
        totalIssues: unresolvedCount + resolvedCount,
        unresolvedIssues: unresolvedCount,
        resolvedIssues: resolvedCount,
        errors24h,
        errors7d,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId1);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Sentry API request timeout');
      }
      throw fetchError;
    }
  } catch (error) {
    // Error is already handled by error handler middleware
    // Logging is done through the error handler
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch Sentry stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
