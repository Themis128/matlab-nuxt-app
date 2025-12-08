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
    const body = await readBody(event);

    // Validate required fields
    if (!body.type || !body.title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type and title are required',
      });
    }

    // Validate activity type
    const validTypes = ['search', 'compare', 'prediction', 'query', 'view'];
    if (!validTypes.includes(body.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid activity type',
      });
    }

    // In a real app, you'd get the user ID from authentication token
    const userId = getCookie(event, 'user-id') || 'default-user';

    const storage = useStorage('redis'); // Falls back to memory storage
    const activityKey = `user:activity:${userId}`;
    const statsKey = `user:stats:${userId}`;

    // Get existing activities
    let activities = ((await storage.getItem(activityKey)) as ActivityItem[]) || [];

    // Create new activity
    const newActivity: ActivityItem = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: body.type,
      title: body.title.trim(),
      description: body.description?.trim() || '',
      icon: getIconForType(body.type),
      timestamp: new Date().toISOString(),
      metadata: body.metadata || {},
    };

    // Add to activities (keep last 100 activities)
    activities.unshift(newActivity);
    if (activities.length > 100) {
      activities = activities.slice(0, 100);
    }

    // Update stats
    const stats = ((await storage.getItem(statsKey)) as UserStats) || {
      searches: 0,
      comparisons: 0,
      predictions: 0,
      queries: 0,
      totalActivity: 0,
    };

    // Increment appropriate counter
    switch (body.type) {
      case 'search':
        stats.searches++;
        break;
      case 'compare':
        stats.comparisons++;
        break;
      case 'prediction':
        stats.predictions++;
        break;
      case 'query':
        stats.queries++;
        break;
    }
    stats.totalActivity++;

    // Save updated data
    await storage.setItem(activityKey, activities);
    await storage.setItem(statsKey, stats);

    return {
      success: true,
      activity: newActivity,
      stats,
    };
  } catch (error: unknown) {
    console.error('Error adding user activity:', error);

    if ((error as any)?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add user activity',
    });
  }
});

function getIconForType(type: string): string {
  switch (type) {
    case 'search':
      return 'i-heroicons-magnifying-glass';
    case 'compare':
      return 'i-heroicons-scale';
    case 'prediction':
      return 'i-heroicons-sparkles';
    case 'query':
      return 'i-heroicons-chat-bubble-left-right';
    case 'view':
      return 'i-heroicons-eye';
    default:
      return 'i-heroicons-document';
  }
}
