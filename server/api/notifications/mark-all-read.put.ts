interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'price_alert' | 'device_release';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

import { setCorsHeaders } from '~/server/utils/cors';

export default defineEventHandler(async (event: any) => {
  // Set secure CORS headers (replaces insecure '*' origin)
  setCorsHeaders(event);

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    // SECURITY: Validate user authentication
    const userId = getCookie(event, 'user-id');

    // Validate user ID format to prevent injection
    if (!userId || typeof userId !== 'string') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      });
    }

    // Sanitize user ID to prevent injection attacks
    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid user ID format',
      });
    }

    // TODO: In production, validate userId against session/token

    const storage = useStorage('redis'); // Falls back to memory storage
    const notificationsKey = `user:notifications:${userId}`;

    // Get notifications from storage
    let notifications = ((await storage.getItem(notificationsKey)) as Notification[]) || [];

    // Mark all as read
    notifications = notifications.map((notification: Notification) => ({
      ...notification,
      read: true,
    }));

    // Save updated notifications
    await storage.setItem(notificationsKey, notifications);

    return {
      success: true,
      message: 'All notifications marked as read',
      unreadCount: 0,
      totalCount: notifications.length,
    };
  } catch (error: unknown) {
    console.error('Error marking all notifications as read:', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to mark all notifications as read',
    });
  }
});
