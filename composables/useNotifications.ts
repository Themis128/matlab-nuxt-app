/**
 * Notifications Composable
 * Provides notification management and display functionality
 */

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'price_alert' | 'device_release';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  timestamp: number;
  read?: boolean;
}

export function useNotifications() {
  // Reactive state
  const notifications = ref<NotificationItem[]>([]);
  const isLoading = ref(false);
  const unreadNotifications = computed(() =>
    notifications.value.filter((n: NotificationItem) => !n.read)
  );
  const unreadCount = computed(() => unreadNotifications.value.length);

  /**
   * Add a notification
   */
  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const newNotification: NotificationItem = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      duration: 5000, // Default 5 seconds
      ...notification,
    };

    notifications.value.push(newNotification);

    // Auto-remove after duration (unless persistent)
    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  };

  /**
   * Remove a notification
   */
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n: NotificationItem) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  /**
   * Clear all notifications
   */
  const clearNotifications = () => {
    notifications.value = [];
  };

  /**
   * Mark notification as read
   */
  const markAsRead = (id: string) => {
    const notification = notifications.value.find((n: NotificationItem) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    notifications.value.forEach((n: NotificationItem) => {
      n.read = true;
    });
  };

  /**
   * Get notifications by type
   */
  const getNotificationsByType = (type: NotificationItem['type']) => {
    return notifications.value.filter((n: NotificationItem) => n.type === type);
  };

  /**
   * Show success notification
   */
  const showSuccess = (title: string, message?: string, options?: Partial<NotificationItem>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  };

  /**
   * Show error notification
   */
  const showError = (title: string, message?: string, options?: Partial<NotificationItem>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      ...options,
    });
  };

  /**
   * Show warning notification
   */
  const showWarning = (title: string, message?: string, options?: Partial<NotificationItem>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  };

  /**
   * Show info notification
   */
  const showInfo = (title: string, message?: string, options?: Partial<NotificationItem>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  };

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = async () => {
    isLoading.value = true;
    try {
      const response = (await ($fetch as any)('/api/notifications')) as NotificationItem[];
      notifications.value = response;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (type: NotificationItem['type']) => {
    const icons = {
      info: 'i-heroicons-information-circle',
      success: 'i-heroicons-check-circle',
      warning: 'i-heroicons-exclamation-triangle',
      error: 'i-heroicons-x-circle',
      price_alert: 'i-heroicons-currency-dollar',
      device_release: 'i-heroicons-device-phone-mobile',
    };
    return icons[type] || 'i-heroicons-information-circle';
  };

  /**
   * Get notification color based on type
   */
  const getNotificationColor = (
    type: NotificationItem['type']
  ): 'error' | 'info' | 'warning' | 'primary' | 'secondary' | 'success' | 'neutral' => {
    const colors: Record<
      NotificationItem['type'],
      'error' | 'info' | 'warning' | 'primary' | 'secondary' | 'success' | 'neutral'
    > = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'error',
      price_alert: 'success',
      device_release: 'primary',
    };
    return colors[type] || 'info';
  };

  return {
    notifications: readonly(notifications),
    unreadNotifications,
    unreadCount,
    isLoading: readonly(isLoading),
    loading: readonly(isLoading), // Alias for backward compatibility
    addNotification,
    removeNotification,
    clearNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationsByType,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    fetchNotifications,
    formatTimestamp,
    getNotificationIcon,
    getNotificationColor,
  };
}
