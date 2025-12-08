/**
 * Sentry API Composable
 *
 * Provides functions to interact with Sentry API to fetch issues, releases, and statistics.
 * Uses server-side API endpoints to avoid exposing auth tokens to the client.
 */

import type { SentryIssue, SentryRelease } from '~/types/sentry';

// Extended SentryStats for API responses
export interface SentryStats {
  totalIssues: number;
  unresolvedIssues: number;
  resolvedIssues: number;
  errors24h: number;
  errors7d: number;
}

// Note: SentryIssue and SentryRelease are available from ~/types/sentry
// Re-export removed to avoid duplicate export warning with sentryStore

/**
 * Composable for Sentry API interactions
 */
export const useSentryApi = () => {
  /**
   * Fetch unresolved issues from Sentry
   */
  const getIssues = async (limit: number = 10): Promise<SentryIssue[]> => {
    try {
      const response = await $fetch<{ issues: SentryIssue[] }>('/api/sentry/issues', {
        params: { limit },
      });
      return response.issues || [];
    } catch (error) {
      const logger = useSentryLogger();
      logger.logError(
        'Failed to fetch Sentry issues',
        error instanceof Error ? error : new Error(String(error)),
        {
          composable: 'useSentryApi',
          action: 'getIssues',
          limit,
        }
      );
      return [];
    }
  };

  /**
   * Fetch issue statistics
   */
  const getStats = async (): Promise<SentryStats | null> => {
    try {
      const response = await $fetch<SentryStats>('/api/sentry/stats');
      return response;
    } catch (error) {
      const logger = useSentryLogger();
      logger.logError(
        'Failed to fetch Sentry stats',
        error instanceof Error ? error : new Error(String(error)),
        {
          composable: 'useSentryApi',
          action: 'getStats',
        }
      );
      return null;
    }
  };

  /**
   * Fetch recent releases
   */
  const getReleases = async (limit: number = 5): Promise<SentryRelease[]> => {
    try {
      const response = await $fetch<{ releases: SentryRelease[] }>('/api/sentry/releases', {
        params: { limit },
      });
      return response.releases || [];
    } catch (error) {
      const logger = useSentryLogger();
      logger.logError(
        'Failed to fetch Sentry releases',
        error instanceof Error ? error : new Error(String(error)),
        {
          composable: 'useSentryApi',
          action: 'getReleases',
          limit,
        }
      );
      return [];
    }
  };

  /**
   * Get issue details by ID
   */
  const getIssue = async (issueId: string): Promise<SentryIssue | null> => {
    try {
      const response = await $fetch<{ issue: SentryIssue }>(`/api/sentry/issues/${issueId}`);
      return response.issue || null;
    } catch (error) {
      const logger = useSentryLogger();
      logger.logError(
        'Failed to fetch Sentry issue',
        error instanceof Error ? error : new Error(String(error)),
        {
          composable: 'useSentryApi',
          action: 'getIssue',
          issueId,
        }
      );
      return null;
    }
  };

  return {
    getIssues,
    getStats,
    getReleases,
    getIssue,
  };
};
