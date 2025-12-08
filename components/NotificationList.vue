<template>
  <div class="space-y-4">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="[
        'cursor-pointer rounded-lg border p-4 transition-colors',
        notification.read ? 'border-base-300 bg-base-100' : 'border-primary/30 bg-primary/10',
      ]"
      @click="handleNotificationClick(notification)"
    >
      <div class="flex items-start gap-4">
        <!-- Icon -->
        <div
          :class="[
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
            getNotificationBgColor(notification.type),
          ]"
        >
          <Icon
            :name="getNotificationIcon(notification.type)"
            :class="['h-5 w-5', getNotificationTextColor(notification.type)]"
          />
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <div class="mb-1 flex items-center justify-between">
            <h3
              :class="[
                'text-sm font-semibold',
                notification.read ? 'opacity-70' : 'text-base-content',
              ]"
            >
              {{ notification.title }}
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-xs opacity-60">
                {{ formatTimestamp(notification.timestamp) }}
              </span>
              <div v-if="!notification.read" class="badge badge-primary badge-xs" />
            </div>
          </div>

          <p :class="['mb-3 text-sm', notification.read ? 'opacity-70' : 'opacity-90']">
            {{ notification.message }}
          </p>

          <!-- Action button -->
          <div
            v-if="notification.actionUrl && notification.actionText"
            class="flex items-center gap-2"
          >
            <DButton
              :variant="getNotificationButtonVariant(notification.type)"
              size="xs"
              @click.stop="handleActionClick(notification)"
            >
              {{ notification.actionText }}
            </DButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  notifications: any[];
}

const _props = defineProps<Props>();

const { markAsRead, formatTimestamp, getNotificationIcon, getNotificationColor } =
  useNotifications();

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
};

// Handle action button click
const handleActionClick = (notification: any) => {
  if (notification.actionUrl) {
    navigateTo(notification.actionUrl);
  }
};

// Helper functions for styling - using DaisyUI semantic colors
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
      return 'opacity-70';
  }
};

const getNotificationButtonVariant = (
  type: string
):
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'ghost'
  | 'outline'
  | 'info'
  | 'success'
  | 'warning'
  | 'error' => {
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
