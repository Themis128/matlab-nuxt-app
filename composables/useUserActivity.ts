/**
 * Composable for tracking user activity
 * Provides utilities for logging user actions and retrieving activity history
 */

interface ActivityItem {
  id: string;
  type: 'search' | 'compare' | 'prediction' | 'query' | 'view';
  title: string;
  description?: string;
  icon: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface _UserStats {
  searches: number;
  comparisons: number;
  predictions: number;
  queries: number;
  totalActivity: number;
}

export function useUserActivity() {
  /**
   * Track a user activity
   */
  const trackActivity = async (
    type: ActivityItem['type'],
    title: string,
    description?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await $fetch('/api/user/activity', {
        method: 'POST',
        body: {
          type,
          title,
          description,
          metadata,
        },
      });
    } catch (error) {
      console.warn('Failed to track activity:', error);
      // Don't throw error as activity tracking shouldn't break the app
    }
  };

  /**
   * Get user activity history
   */
  const getActivity = async (limit = 10) => {
    try {
      const response = (await ($fetch as any)(`/api/user/activity?limit=${limit}`)) as {
        activities?: any[];
        stats?: {
          searches: number;
          comparisons: number;
          predictions: number;
          queries: number;
          totalActivity: number;
        };
        total?: number;
      };
      return {
        activities: response.activities || [],
        stats: response.stats || {
          searches: 0,
          comparisons: 0,
          predictions: 0,
          queries: 0,
          totalActivity: 0,
        },
        total: response.total || 0,
      };
    } catch (error) {
      console.error('Failed to get activity:', error);
      return {
        activities: [],
        stats: {
          searches: 0,
          comparisons: 0,
          predictions: 0,
          queries: 0,
          totalActivity: 0,
        },
        total: 0,
      };
    }
  };

  /**
   * Track search activity
   */
  const trackSearch = (query: string, results?: number) => {
    return trackActivity(
      'search',
      `Searched for "${query}"`,
      results ? `Found ${results} results` : undefined,
      { query, results }
    );
  };

  /**
   * Track comparison activity
   */
  const trackComparison = (devices: string[]) => {
    const title =
      devices.length === 2
        ? `Compared ${devices[0]} vs ${devices[1]}`
        : `Compared ${devices.length} devices`;

    return trackActivity('compare', title, undefined, { devices });
  };

  /**
   * Track prediction activity
   */
  const trackPrediction = (type: string, result?: any) => {
    return trackActivity(
      'prediction',
      `Generated ${type} prediction`,
      result ? `Predicted: ${JSON.stringify(result)}` : undefined,
      { type, result }
    );
  };

  /**
   * Track query activity
   */
  const trackQuery = (query: string, response?: any) => {
    return trackActivity(
      'query',
      `Asked: "${query}"`,
      response?.answer ? `${response.answer.substring(0, 100)}...` : undefined,
      { query, response }
    );
  };

  /**
   * Track page/content view
   */
  const trackView = (page: string, details?: string) => {
    return trackActivity('view', `Viewed ${page}`, details, { page, details });
  };

  return {
    trackActivity,
    getActivity,
    trackSearch,
    trackComparison,
    trackPrediction,
    trackQuery,
    trackView,
  };
}
