<template>
  <div class="dropdown dropdown-end">
    <DButton
      variant="ghost"
      size="sm"
      class="relative"
      :class="{ 'text-primary': unreadCount > 0 }"
      tabindex="0"
      role="button"
    >
      <Icon name="heroicons:bell" class="h-5 w-5" />

      <!-- Unread count badge -->
      <div v-if="unreadCount > 0" class="badge badge-error badge-sm absolute -right-1 -top-1">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </div>
    </DButton>

    <ul
      tabindex="0"
      class="dropdown-content menu bg-base-100 rounded-box z-[1] w-96 p-2 shadow-lg border border-base-300"
    >
      <!-- Header -->
      <li class="border-b border-base-300 px-3 py-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-base-content">Notifications</h3>
          <DButton v-if="unreadCount > 0" variant="ghost" size="xs" @click="handleMarkAllAsRead">
            Mark all read
          </DButton>
        </div>
      </li>

      <!-- Notifications -->
      <template v-for="item in dropdownItems" :key="item.type">
        <li v-if="item.type === 'notification'" class="px-3 py-2">
          <div
            class="notification-item -m-3 cursor-pointer rounded-lg p-3 transition-colors hover:bg-base-200"
            :class="{ 'bg-base-200': !item.notification.read }"
            @click="handleNotificationClick(item.notification)"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div
                :class="[
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200',
                  item.notification.read
                    ? 'bg-base-300'
                    : getNotificationBgColor(item.notification.type),
                ]"
              >
                <Icon
                  :name="getNotificationIcon(item.notification.type)"
                  :class="[
                    'h-5 w-5 transition-colors duration-200',
                    item.notification.read
                      ? 'text-base-content/50'
                      : getNotificationTextColor(item.notification.type),
                  ]"
                />
              </div>

              <!-- Content -->
              <div class="min-w-0 flex-1">
                <div class="mb-1 flex items-center justify-between">
                  <p
                    :class="[
                      'truncate text-sm font-semibold transition-colors duration-200',
                      item.notification.read ? 'text-base-content/60' : 'text-base-content',
                    ]"
                  >
                    {{ item.notification.title }}
                  </p>
                  <span class="ml-2 flex-shrink-0 text-xs font-medium text-base-content/50">
                    {{ formatTimestamp(item.notification.timestamp) }}
                  </span>
                </div>

                <p
                  :class="[
                    'mt-1 line-clamp-2 text-xs leading-relaxed transition-colors duration-200',
                    item.notification.read ? 'text-base-content/50' : 'text-base-content/70',
                  ]"
                >
                  {{ item.notification.message }}
                </p>

                <!-- Action button -->
                <div
                  v-if="item.notification.actionUrl && item.notification.actionText"
                  class="mt-3"
                >
                  <DButton
                    :variant="getNotificationButtonVariant(item.notification.type)"
                    size="sm"
                    @click.stop="handleActionClick(item.notification)"
                  >
                    {{ item.notification.actionText }}
                    <Icon name="heroicons:arrow-right" class="ml-1 h-3 w-3" />
                  </DButton>
                </div>
              </div>

              <!-- Unread indicator -->
              <div
                v-if="!item.notification.read"
                class="h-3 w-3 flex-shrink-0 animate-pulse rounded-full bg-primary"
              />
            </div>
          </div>
        </li>
      </template>

      <!-- Empty state -->
      <li v-if="notifications.length === 0" class="px-3 py-8 text-center">
        <Icon name="heroicons:bell-slash" class="mx-auto mb-2 h-8 w-8 text-base-content/40" />
        <p class="text-sm text-base-content/60">No notifications yet</p>
      </li>

      <!-- Footer -->
      <li class="border-t border-base-300 px-3 py-2">
        <DButton variant="ghost" size="sm" block @click="navigateTo('/notifications')">
          View all notifications
        </DButton>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '~/composables/useNotifications';

// Define types for dropdown items
type DropdownItem =
  | { type: 'header' }
  | { type: 'notification'; notification: any }
  | { type: 'empty' }
  | { type: 'footer' };

const {
  notifications,
  unreadCount,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loading,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  formatTimestamp,
  getNotificationIcon,
  getNotificationColor,
} = useNotifications();

// Fetch notifications on mount
onMounted(() => {
  fetchNotifications(); // Fetch all notifications
});

// Computed dropdown items
const dropdownItems = computed<DropdownItem[][]>(() => {
  const items: DropdownItem[] = [{ type: 'header' }];

  if (notifications.value.length === 0) {
    items.push({ type: 'empty' });
  } else {
    notifications.value.forEach((notification: any) => {
      items.push({
        type: 'notification',
        notification,
      });
    });
  }

  items.push({ type: 'footer' });

  return [items];
});

// Handle notification click
const handleNotificationClick = async (notification: any) => {
  // Mark as read if not already read
  if (!notification.read) {
    try {
      await markAsRead(notification.id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Navigate to action URL if available
  if (notification.actionUrl) {
    navigateTo(notification.actionUrl);
  }
};

// Handle action button click
const handleActionClick = (notification: any) => {
  if (notification.actionUrl) {
    navigateTo(notification.actionUrl);
  }
};

// Handle mark all as read
const handleMarkAllAsRead = async () => {
  try {
    await markAllAsRead();
    const { success } = useToast();
    success('All notifications marked as read');
  } catch {
    const { error } = useToast();
    error('Failed to mark notifications as read');
  }
};

// Helper functions for styling - using daisyUI semantic colors
const getNotificationBgColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-success/20';
    case 'error':
      return 'bg-error/20';
    case 'warning':
      return 'bg-warning/20';
    case 'price_alert':
      return 'bg-info/20';
    case 'device_release':
      return 'bg-primary/20';
    case 'info':
    default:
      return 'bg-base-300';
  }
};

const getNotificationTextColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-success';
    case 'error':
      return 'text-error';
    case 'warning':
      return 'text-warning';
    case 'price_alert':
      return 'text-info';
    case 'device_release':
      return 'text-primary';
    case 'info':
    default:
      return 'text-base-content';
  }
};

const getNotificationButtonVariant = (
  type: string
): 'success' | 'error' | 'warning' | 'info' | 'primary' | 'ghost' => {
  switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'price_alert':
      return 'info';
    case 'device_release':
      return 'primary';
    case 'info':
    default:
      return 'ghost';
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
