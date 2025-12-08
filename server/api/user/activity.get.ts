interface ActivityItem {
  id: string;
  type: 'search' | 'compare' | 'prediction' | 'query' | 'view';
  title: string;
  description?: string;
  icon: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface UserStats {
  searches: number;
  comparisons: number;
  predictions: number;
  queries: number;
  totalActivity: number;
}

import { setCorsHeaders } from '~/server/utils/cors';

export default defineEventHandler(async (event: any) => {
  // Set secure CORS headers
  setCorsHeaders(event);

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    const query = getQuery(event);
    const limit = parseInt((query.limit as string) || '10');

    // In a real app, you'd get the user ID from authentication token
    const userId = getCookie(event, 'user-id') || 'default-user';

    const storage = useStorage('redis'); // Falls back to memory storage
    const activityKey = `user:activity:${userId}`;
    const statsKey = `user:stats:${userId}`;

    // Get activity history
    const activities = ((await storage.getItem(activityKey)) as ActivityItem[]) || [];

    // Get user stats
    let stats = (await storage.getItem(statsKey)) as UserStats | null;

    if (!stats) {
      // Calculate stats from activities
      stats = {
        searches: activities.filter((a: any) => a.type === 'search').length,
        comparisons: activities.filter((a: any) => a.type === 'compare').length,
        predictions: activities.filter((a: any) => a.type === 'prediction').length,
        queries: activities.filter((a: any) => a.type === 'query').length,
        totalActivity: activities.length,
      };

      // Save calculated stats
      await storage.setItem(statsKey, stats);
    }

    // Sort activities by timestamp (newest first) and limit
    const sortedActivities = activities
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return {
      activities: sortedActivities,
      stats,
      total: activities.length,
    };
  } catch (error: unknown) {
    console.error('Error fetching user activity:', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user activity',
    });
  }
});
