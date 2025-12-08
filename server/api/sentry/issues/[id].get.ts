/**
 * Sentry Issue Details API Endpoint
 *
 * Fetches details for a specific issue by ID.
 */

export default defineEventHandler(async (event: any) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Issue ID is required',
    });
  }

  // Support both naming conventions
  const SENTRY_ORG = process.env.SENTRY_ORG || process.env.SENTRY_ORG_SLUG;
  const _SENTRY_PROJECT = process.env.SENTRY_PROJECT || process.env.SENTRY_PROJECT_SLUG || 'matlab';
  const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || process.env.SENTRY_ACCESS_TOKEN;

  if (!SENTRY_ORG || !SENTRY_AUTH_TOKEN) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Sentry configuration missing. Set SENTRY_ORG and SENTRY_AUTH_TOKEN.',
    });
  }

  try {
    const url = `https://sentry.io/api/0/issues/${id}/`;
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
      if (fetchError && typeof fetchError === 'object' && 'statusCode' in fetchError) {
        throw fetchError;
      }
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Sentry API request timeout');
      }
      throw fetchError;
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Issue not found',
        });
      }
      throw new Error(`Sentry API error: ${response.status} ${response.statusText}`);
    }

    const issue = await response.json();

    // Transform Sentry API response
    return {
      issue: {
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
        metadata: issue.metadata,
        tags: issue.tags,
      },
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    // Error is already handled by error handler middleware
    // Logging is done through the error handler
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch Sentry issue: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
