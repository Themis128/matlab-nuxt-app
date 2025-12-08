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
  // Set secure CORS headers
  setCorsHeaders(event);

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    const notificationId = getRouterParam(event, 'id');

    if (!notificationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Notification ID is required',
      });
    }

    // In a real app, you'd get the user ID from authentication token
    const userId = getCookie(event, 'user-id') || 'default-user';

    const storage = useStorage('redis'); // Falls back to memory storage
    const notificationsKey = `user:notifications:${userId}`;

    // Get notifications from storage
    const notifications = ((await storage.getItem(notificationsKey)) as Notification[]) || [];

    // Find and update the notification
    const notificationIndex = notifications.findIndex((n: Notification) => n.id === notificationId);

    if (notificationIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Notification not found',
      });
    }

    // Mark as read (notificationIndex is guaranteed to be valid after the check above)
    const notification = notifications[notificationIndex];
    if (!notification) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Notification not found',
      });
    }
    notification.read = true;

    // Save updated notifications
    await storage.setItem(notificationsKey, notifications);

    // Calculate new unread count
    const unreadCount = notifications.filter((n: Notification) => !n.read).length;

    return {
      success: true,
      notification: notifications[notificationIndex],
      unreadCount,
    };
  } catch (error: unknown) {
    console.error('Error marking notification as read:', error);

    if ((error as any)?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to mark notification as read',
    });
  }
});
