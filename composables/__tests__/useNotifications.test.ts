import { describe, it, expect, beforeEach } from 'vitest';
import { useNotifications } from '../useNotifications';

describe('useNotifications', () => {
  let notifications: ReturnType<typeof useNotifications>;

  beforeEach(() => {
    // Create a fresh instance for each test
    notifications = useNotifications();
  });

  it('should initialize with empty state', () => {
    expect(notifications.notifications.value).toEqual([]);
    expect(notifications.unreadCount.value).toBe(0);
    expect(notifications.loading.value).toBe(false);
  });

  it('should add a notification', () => {
    const id = notifications.addNotification({
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test',
    });

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(notifications.notifications.value).toHaveLength(1);
    expect(notifications.notifications.value[0]?.title).toBe('Test Notification');
    expect(notifications.notifications.value[0]?.type).toBe('info');
  });

  it('should remove a notification', () => {
    const id = notifications.addNotification({
      type: 'success',
      title: 'Test',
    });

    expect(notifications.notifications.value).toHaveLength(1);

    notifications.removeNotification(id);

    expect(notifications.notifications.value).toHaveLength(0);
  });

  it('should mark notification as read', () => {
    const id = notifications.addNotification({
      type: 'info',
      title: 'Test',
      read: false,
    });

    expect(notifications.unreadCount.value).toBe(1);

    notifications.markAsRead(id);

    expect(notifications.unreadCount.value).toBe(0);
  });

  it('should clear all notifications', () => {
    notifications.addNotification({ type: 'info', title: 'Test 1' });
    notifications.addNotification({ type: 'success', title: 'Test 2' });

    expect(notifications.notifications.value).toHaveLength(2);

    notifications.clearNotifications();

    expect(notifications.notifications.value).toHaveLength(0);
  });

  it('should get notifications by type', () => {
    notifications.addNotification({ type: 'info', title: 'Info 1' });
    notifications.addNotification({ type: 'success', title: 'Success 1' });
    notifications.addNotification({ type: 'info', title: 'Info 2' });

    const infoNotifications = notifications.getNotificationsByType('info');

    expect(infoNotifications).toHaveLength(2);
    expect(infoNotifications.every((n) => n.type === 'info')).toBe(true);
  });

  it('should provide convenience methods for different notification types', () => {
    const successId = notifications.showSuccess('Success message');
    const errorId = notifications.showError('Error message');
    const warningId = notifications.showWarning('Warning message');
    const infoId = notifications.showInfo('Info message');

    expect(successId).toBeDefined();
    expect(errorId).toBeDefined();
    expect(warningId).toBeDefined();
    expect(infoId).toBeDefined();

    expect(notifications.notifications.value).toHaveLength(4);
  });

  it('should format timestamps', () => {
    const timestamp = Date.now();
    const formatted = notifications.formatTimestamp(timestamp);

    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('should get notification icons', () => {
    expect(notifications.getNotificationIcon('success')).toContain('check-circle');
    expect(notifications.getNotificationIcon('error')).toContain('x-circle');
    expect(notifications.getNotificationIcon('warning')).toContain('exclamation-triangle');
    expect(notifications.getNotificationIcon('info')).toContain('information-circle');
  });

  it('should get notification colors', () => {
    expect(notifications.getNotificationColor('success')).toBe('success');
    expect(notifications.getNotificationColor('error')).toBe('error');
    expect(notifications.getNotificationColor('warning')).toBe('warning');
    expect(notifications.getNotificationColor('info')).toBe('info');
  });
});
