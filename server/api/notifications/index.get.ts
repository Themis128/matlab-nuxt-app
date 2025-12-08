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
    const query = getQuery(event);
    const limit = parseInt((query.limit as string) || '20');
    const unreadOnly = query.unreadOnly === 'true';

    // In a real app, you'd get the user ID from authentication token
    const userId = getCookie(event, 'user-id') || 'default-user';

    const storage = useStorage('redis'); // Falls back to memory storage
    const notificationsKey = `user:notifications:${userId}`;

    // Get notifications from storage
    let notifications = ((await storage.getItem(notificationsKey)) as Notification[]) || [];

    // If no notifications exist, create some sample ones
    if (notifications.length === 0) {
      notifications = [
        {
          id: 'notif_1',
          type: 'device_release',
          title: 'New Device Alert',
          message:
            'Samsung Galaxy S25 has been released! Check out the latest features and pricing.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: false,
          actionUrl: '/search?q=Samsung%20Galaxy%20S25',
          actionText: 'View Device',
          metadata: { device: 'Samsung Galaxy S25', category: 'flagship' },
        },
        {
          id: 'notif_2',
          type: 'price_alert',
          title: 'Price Drop Alert',
          message: 'iPhone 15 Pro price dropped by $100! Now available for $899.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          read: false,
          actionUrl: '/search?q=iPhone%2015%20Pro',
          actionText: 'View Deal',
          metadata: { device: 'iPhone 15 Pro', oldPrice: 999, newPrice: 899 },
        },
        {
          id: 'notif_3',
          type: 'info',
          title: 'Weekly Digest Available',
          message:
            'Your weekly mobile trends report is ready. Discover the top devices and market insights.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          read: true,
          actionUrl: '/datamine',
          actionText: 'View Report',
          metadata: { reportType: 'weekly', period: 'week-48-2024' },
        },
        {
          id: 'notif_4',
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile preferences have been successfully updated.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          read: true,
          metadata: { action: 'profile_update' },
        },
      ];

      // Save sample notifications
      await storage.setItem(notificationsKey, notifications);
    }

    // Filter notifications
    let filteredNotifications = notifications;
    if (unreadOnly) {
      filteredNotifications = notifications.filter((n: Notification) => !n.read);
    }

    // Sort by timestamp (newest first) and limit
    const sortedNotifications = filteredNotifications
      .sort(
        (a: Notification, b: Notification) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);

    // Calculate counts
    const unreadCount = notifications.filter((n: Notification) => !n.read).length;
    const totalCount = notifications.length;

    return {
      notifications: sortedNotifications,
      unreadCount,
      totalCount,
      hasMore: filteredNotifications.length > limit,
    };
  } catch (error: unknown) {
    console.error('Error fetching notifications:', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch notifications',
    });
  }
});
