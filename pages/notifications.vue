<template>
  <DPageLayout>
    <div class="container mx-auto max-w-5xl p-6">
      <!-- Header -->
      <DPageHeader
        title="Notifications"
        description="Stay updated with the latest device releases, price alerts, and system updates"
        icon="heroicons:bell"
        icon-bg="primary"
      >
        <div class="flex items-center gap-3">
          <DButton
            v-if="unreadCount > 0"
            variant="secondary"
            size="sm"
            @click="handleMarkAllAsRead"
          >
            <Icon name="heroicons:check-circle" class="h-4 w-4" />
            Mark all read ({{ unreadCount }})
          </DButton>
          <DButton variant="primary" @click="refreshNotifications" size="sm" :loading="loading">
            <Icon name="heroicons:arrow-path" class="h-4 w-4" />
            Refresh
          </DButton>
        </div>
      </DPageHeader>

      <!-- Filter Tabs -->
      <DTabs v-model="activeTab" :items="filterTabs" class="mb-6">
        <NotificationList :notifications="[...filteredNotifications] as any[]" />
      </DTabs>

      <!-- Empty State -->
      <div v-if="filteredNotifications.length === 0" class="py-12 text-center">
        <Icon name="heroicons:bell-slash" class="mx-auto mb-4 h-16 w-16 text-base-content/30" />
        <h3 class="mb-2 text-lg font-semibold text-base-content">No notifications</h3>
        <p class="mb-6 text-base-content/70">
          {{ getEmptyStateMessage() }}
        </p>
        <DButton variant="outline" @click="refreshNotifications"> Check for updates </DButton>
      </div>
    </div>
  </DPageLayout>
</template>

<script setup lang="ts">
import { useNotifications } from '../composables/useNotifications';

// Page metadata
definePageMeta({
  title: 'Notifications',
  description: 'View and manage your notifications',
  layout: 'default',
});

const {
  notifications,
  unreadCount,
  loading,
  fetchNotifications,
  markAllAsRead,
  getNotificationsByType,
  unreadNotifications,
} = useNotifications();

// State
const activeTab = ref(0);

// Filter tabs
const filterTabs = [
  { key: 'all', label: 'All', icon: 'heroicons:bell' },
  { key: 'unread', label: 'Unread', icon: 'heroicons:envelope', badge: unreadCount.value },
  { key: 'price_alerts', label: 'Price Alerts', icon: 'heroicons:currency-dollar' },
  { key: 'device_releases', label: 'New Devices', icon: 'heroicons:device-phone-mobile' },
];

// Computed notifications by type
const priceAlertNotifications = computed(() => getNotificationsByType('price_alert'));
const deviceReleaseNotifications = computed(() => getNotificationsByType('device_release'));

// Filtered notifications based on active tab
const filteredNotifications = computed(() => {
  switch (filterTabs[activeTab.value]?.key) {
    case 'unread':
      return unreadNotifications.value;
    case 'price_alerts':
      return priceAlertNotifications.value;
    case 'device_releases':
      return deviceReleaseNotifications.value;
    case 'all':
    default:
      return notifications.value;
  }
});

// Methods
const refreshNotifications = () => {
  fetchNotifications(); // Load notifications
};

const handleMarkAllAsRead = async () => {
  try {
    await markAllAsRead();
    const toast = useToast();
    toast.add({
      title: 'Success',
      description: 'All notifications marked as read',
      color: 'success',
    });
  } catch {
    const toast = useToast();
    toast.add({
      title: 'Error',
      description: 'Failed to mark notifications as read',
      color: 'error',
    });
  }
};

const getEmptyStateMessage = () => {
  switch (filterTabs[activeTab.value]?.key) {
    case 'unread':
      return 'All caught up! No unread notifications.';
    case 'price_alerts':
      return 'No price alerts yet. Enable price notifications in settings to get notified of deals.';
    case 'device_releases':
      return "No device release notifications. We'll notify you when new phones are announced.";
    case 'all':
    default:
      return "No notifications yet. We'll keep you updated with important information.";
  }
};

// Load notifications on mount
onMounted(() => {
  refreshNotifications();
});
</script>
