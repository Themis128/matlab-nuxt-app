<template>
  <DPageLayout>
    <div class="container mx-auto max-w-5xl p-6">
      <!-- Header -->
      <DPageHeader
        title="Settings"
        description="Configure your application preferences and system settings"
        icon="heroicons:cog-6-tooth"
        icon-bg="success"
      />

      <!-- Settings Tabs -->
      <DTabs v-model="activeTab" :items="tabs" class="mb-6">
        <!-- General Settings -->
        <template #general="{ item }">
          <div v-if="item" class="space-y-6">
            <!-- Appearance -->
            <DCard>
              <template #header>
                <h3 class="card-title">Appearance</h3>
              </template>

              <div class="space-y-4">
                <!-- Theme -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Theme </label>
                    <p class="text-xs opacity-70">Choose your preferred color scheme</p>
                  </div>
                  <ThemeToggle />
                </div>

                <!-- Language -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Language </label>
                    <p class="text-xs opacity-70">Select your preferred language</p>
                  </div>
                  <LanguageSwitcher />
                </div>

                <!-- Compact Mode -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Compact Mode </label>
                    <p class="text-xs opacity-70">Use smaller spacing and components</p>
                  </div>
                  <DToggle v-model="settings.compactMode" />
                </div>

                <!-- Animations -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Animations </label>
                    <p class="text-xs opacity-70">Enable smooth transitions and animations</p>
                  </div>
                  <DToggle v-model="settings.animations" />
                </div>
              </div>
            </DCard>

            <!-- Data & Privacy -->
            <DCard>
              <template #header>
                <h3 class="text-lg font-semibold">Data & Privacy</h3>
              </template>

              <div class="space-y-4">
                <!-- Analytics -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Analytics </label>
                    <p class="text-xs opacity-70">Help improve the app by sharing usage data</p>
                  </div>
                  <DToggle v-model="settings.analytics" />
                </div>

                <!-- Error Reporting -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Error Reporting </label>
                    <p class="text-xs opacity-70">
                      Automatically report errors to help us fix issues
                    </p>
                  </div>
                  <DToggle v-model="settings.errorReporting" />
                </div>

                <!-- Data Retention -->
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content">
                    Data Retention
                  </label>
                  <DSelect
                    v-model="settings.dataRetention"
                    :options="dataRetentionOptions"
                    placeholder="Select retention period"
                  />
                </div>
              </div>
            </DCard>
          </div>
        </template>

        <!-- Notifications -->
        <template #notifications>
          <div class="space-y-6">
            <DCard>
              <template #header>
                <h3 class="text-lg font-semibold">Notification Preferences</h3>
              </template>

              <div class="space-y-4">
                <!-- Email Notifications -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content">
                      Email Notifications
                    </label>
                    <p class="text-xs opacity-70">Receive updates via email</p>
                  </div>
                  <DToggle v-model="notifications.email" />
                </div>

                <!-- Price Alerts -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Price Alerts </label>
                    <p class="text-xs opacity-70">Get notified when prices drop</p>
                  </div>
                  <DToggle v-model="notifications.priceAlerts" />
                </div>

                <!-- New Device Alerts -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> New Device Alerts </label>
                    <p class="text-xs opacity-70">Be the first to know about new releases</p>
                  </div>
                  <DToggle v-model="notifications.newDevices" />
                </div>

                <!-- Weekly Digest -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Weekly Digest </label>
                    <p class="text-xs opacity-70">Weekly summary of trends and updates</p>
                  </div>
                  <DToggle v-model="notifications.weeklyDigest" />
                </div>

                <!-- Notification Frequency -->
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content">
                    Notification Frequency
                  </label>
                  <DSelect
                    v-model="notifications.frequency"
                    :options="frequencyOptions"
                    placeholder="Select frequency"
                  />
                </div>
              </div>
            </DCard>
          </div>
        </template>

        <!-- Performance -->
        <template #performance>
          <div class="space-y-6">
            <!-- Cache Settings -->
            <DCard>
              <template #header>
                <h3 class="text-lg font-semibold">Cache & Performance</h3>
              </template>

              <div class="space-y-4">
                <!-- Image Caching -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Image Caching </label>
                    <p class="text-xs opacity-70">Cache images for faster loading</p>
                  </div>
                  <DToggle v-model="performance.imageCache" />
                </div>

                <!-- Preload Data -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Preload Data </label>
                    <p class="text-xs opacity-70">Load data in advance for better performance</p>
                  </div>
                  <DToggle v-model="performance.preloadData" />
                </div>

                <!-- Lazy Loading -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Lazy Loading </label>
                    <p class="text-xs opacity-70">Load content as you scroll</p>
                  </div>
                  <DToggle v-model="performance.lazyLoading" />
                </div>

                <!-- Cache Size -->
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content">
                    Cache Size Limit
                  </label>
                  <DSelect
                    v-model="performance.cacheSize"
                    :options="cacheSizeOptions"
                    placeholder="Select cache size"
                  />
                </div>

                <!-- Clear Cache -->
                <div class="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-base-content"> Clear Cache </label>
                      <p class="text-xs opacity-70">Current cache size: {{ cacheSize }}</p>
                    </div>
                    <DButton variant="outline" @click="clearCache" size="sm"> Clear Cache </DButton>
                  </div>
                </div>
              </div>
            </DCard>

            <!-- API Settings -->
            <DCard>
              <template #header>
                <h3 class="text-lg font-semibold">API & Network</h3>
              </template>

              <div class="space-y-4">
                <!-- Request Timeout -->
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content">
                    Request Timeout (seconds)
                  </label>
                  <DInput v-model="performance.requestTimeout" type="number" placeholder="30" />
                </div>

                <!-- Retry Attempts -->
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content">
                    Retry Attempts
                  </label>
                  <DInput v-model="performance.retryAttempts" type="number" placeholder="3" />
                </div>

                <!-- Offline Mode -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Offline Mode </label>
                    <p class="text-xs opacity-70">Enable offline functionality when possible</p>
                  </div>
                  <DToggle v-model="performance.offlineMode" />
                </div>
              </div>
            </DCard>
          </div>
        </template>

        <!-- Advanced -->
        <template #advanced>
          <div class="space-y-6">
            <!-- Developer Options -->
            <DCard>
              <template #header>
                <h3 class="text-lg font-semibold">Developer Options</h3>
              </template>

              <div class="space-y-4">
                <!-- Debug Mode -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Debug Mode </label>
                    <p class="text-xs opacity-70">Show debug information and logs</p>
                  </div>
                  <DToggle v-model="advanced.debugMode" />
                </div>

                <!-- Console Logging -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Console Logging </label>
                    <p class="text-xs opacity-70">Enable detailed console logs</p>
                  </div>
                  <DToggle v-model="advanced.consoleLogging" />
                </div>

                <!-- API Endpoint -->
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content">
                    API Endpoint
                  </label>
                  <DInput v-model="advanced.apiEndpoint" placeholder="https://api.example.com" />
                </div>
              </div>
            </DCard>

            <!-- Data Management -->
            <DCard>
              <template #header>
                <h3 class="card-title">Data Management</h3>
              </template>

              <div class="space-y-4">
                <!-- Export Data -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Export Settings </label>
                    <p class="text-xs opacity-70">Download your settings as JSON</p>
                  </div>
                  <DButton variant="outline" @click="exportSettings" size="sm"> Export </DButton>
                </div>

                <!-- Import Data -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Import Settings </label>
                    <p class="text-xs opacity-70">Upload settings from JSON file</p>
                  </div>
                  <DButton variant="outline" @click="importSettings" size="sm"> Import </DButton>
                </div>

                <!-- Reset Settings -->
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-base-content"> Reset to Defaults </label>
                    <p class="text-xs opacity-70">Restore all settings to default values</p>
                  </div>
                  <DButton variant="error" @click="resetSettings" size="sm"> Reset </DButton>
                </div>
              </div>
            </DCard>
          </div>
        </template>
      </DTabs>

      <!-- Save Button -->
      <div class="flex justify-end border-t border-base-300 pt-6">
        <DButton :loading="saving" @click="saveSettings" variant="primary" size="lg">
          Save Settings
        </DButton>
      </div>
    </div>
  </DPageLayout>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  title: 'Settings',
  description: 'Configure your application preferences',
  layout: 'default',
});

// Reactive state
const activeTab = ref(0);
const saving = ref(false);

// Tab configuration
const tabs = [
  { key: 'general', label: 'General', icon: 'i-heroicons-cog-6-tooth', slot: 'general' },
  { key: 'notifications', label: 'Notifications', icon: 'i-heroicons-bell', slot: 'notifications' },
  { key: 'performance', label: 'Performance', icon: 'i-heroicons-bolt', slot: 'performance' },
  { key: 'advanced', label: 'Advanced', icon: 'i-heroicons-wrench-screwdriver', slot: 'advanced' },
];

// Settings data
const settings = ref({
  compactMode: false,
  animations: true,
  analytics: true,
  errorReporting: true,
  dataRetention: '1-year',
});

const notifications = ref({
  email: true,
  priceAlerts: true,
  newDevices: false,
  weeklyDigest: true,
  frequency: 'daily',
});

const performance = ref({
  imageCache: true,
  preloadData: true,
  lazyLoading: true,
  cacheSize: '100mb',
  requestTimeout: 30,
  retryAttempts: 3,
  offlineMode: false,
});

const advanced = ref({
  debugMode: false,
  consoleLogging: false,
  apiEndpoint: 'https://api.example.com',
});

// Options
const dataRetentionOptions = [
  { label: '30 days', value: '30-days' },
  { label: '6 months', value: '6-months' },
  { label: '1 year', value: '1-year' },
  { label: '2 years', value: '2-years' },
  { label: 'Forever', value: 'forever' },
];

const frequencyOptions = [
  { label: 'Immediately', value: 'immediate' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const cacheSizeOptions = [
  { label: '50 MB', value: '50mb' },
  { label: '100 MB', value: '100mb' },
  { label: '250 MB', value: '250mb' },
  { label: '500 MB', value: '500mb' },
  { label: '1 GB', value: '1gb' },
];

// Computed
const cacheSize = computed(() => {
  // Mock cache size calculation
  return '47.3 MB';
});

// Methods
const saveSettings = async () => {
  saving.value = true;

  try {
    // Call real API to save settings
    const allSettings = {
      general: settings.value,
      notifications: notifications.value,
      performance: performance.value,
      advanced: advanced.value,
    };

    await $fetch('/api/user/settings', {
      method: 'PUT',
      body: allSettings,
    });

    // Also save to localStorage as backup
    localStorage.setItem('app-settings', JSON.stringify(allSettings));

    const toast = useToast();
    toast.add({
      title: 'Settings Saved',
      description: 'Your settings have been successfully updated.',
      color: 'success',
    });
  } catch (error: any) {
    const toast = useToast();
    toast.add({
      title: 'Error',
      description: error?.data?.statusMessage || 'Failed to save settings. Please try again.',
      color: 'error',
    });
  } finally {
    saving.value = false;
  }
};

const clearCache = () => {
  // Clear various caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }

  // Clear localStorage cache items
  Object.keys(localStorage).forEach((key) => {
    if (key.includes('cache') || key.includes('temp')) {
      localStorage.removeItem(key);
    }
  });

  const toast = useToast();
  toast.add({
    title: 'Cache Cleared',
    description: 'All cached data has been removed.',
    color: 'success',
  });
};

const exportSettings = () => {
  const allSettings = {
    settings: settings.value,
    notifications: notifications.value,
    performance: performance.value,
    advanced: advanced.value,
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'app-settings.json';
  a.click();
  URL.revokeObjectURL(url);

  const toast = useToast();
  toast.add({
    title: 'Settings Exported',
    description: 'Your settings have been downloaded.',
    color: 'success',
  });
};

const importSettings = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);

          if (imported.settings) settings.value = imported.settings;
          if (imported.notifications) notifications.value = imported.notifications;
          if (imported.performance) performance.value = imported.performance;
          if (imported.advanced) advanced.value = imported.advanced;

          const toast = useToast();
          toast.add({
            title: 'Settings Imported',
            description: 'Your settings have been successfully imported.',
            color: 'success',
          });
        } catch {
          const toast = useToast();
          toast.add({
            title: 'Import Error',
            description: 'Failed to import settings. Invalid file format.',
            color: 'error',
          });
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const resetSettings = () => {
  // Reset to default values
  settings.value = {
    compactMode: false,
    animations: true,
    analytics: true,
    errorReporting: true,
    dataRetention: '1-year',
  };

  notifications.value = {
    email: true,
    priceAlerts: true,
    newDevices: false,
    weeklyDigest: true,
    frequency: 'daily',
  };

  performance.value = {
    imageCache: true,
    preloadData: true,
    lazyLoading: true,
    cacheSize: '100mb',
    requestTimeout: 30,
    retryAttempts: 3,
    offlineMode: false,
  };

  advanced.value = {
    debugMode: false,
    consoleLogging: false,
    apiEndpoint: 'https://api.example.com',
  };

  const toast = useToast();
  toast.add({
    title: 'Settings Reset',
    description: 'All settings have been restored to defaults.',
    color: 'success',
  });
};

// Load settings on mount
onMounted(async () => {
  try {
    // Load settings from API
    const serverSettings = (await $fetch('/api/user/settings')) as
      | {
          general?: typeof settings.value;
          notifications?: typeof notifications.value;
          performance?: typeof performance.value;
          advanced?: typeof advanced.value;
        }
      | { ok: boolean };

    // Type guard: check if it's the settings object (not just { ok: boolean })
    if (serverSettings && typeof serverSettings === 'object' && 'general' in serverSettings) {
      if (serverSettings.general) settings.value = { ...settings.value, ...serverSettings.general };
      if (serverSettings.notifications)
        notifications.value = { ...notifications.value, ...serverSettings.notifications };
      if (serverSettings.performance)
        performance.value = { ...performance.value, ...serverSettings.performance };
      if (serverSettings.advanced)
        advanced.value = { ...advanced.value, ...serverSettings.advanced };
    }

    // Also try to load from localStorage as fallback/override
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.general) settings.value = { ...settings.value, ...parsed.general };
        if (parsed.notifications)
          notifications.value = { ...notifications.value, ...parsed.notifications };
        if (parsed.performance) performance.value = { ...performance.value, ...parsed.performance };
        if (parsed.advanced) advanced.value = { ...advanced.value, ...parsed.advanced };
      } catch (e) {
        console.warn('Failed to load settings from localStorage:', e);
      }
    }
  } catch (error) {
    console.error('Failed to load settings from server:', error);

    // Fallback to localStorage only
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.general) settings.value = { ...settings.value, ...parsed.general };
        if (parsed.notifications)
          notifications.value = { ...notifications.value, ...parsed.notifications };
        if (parsed.performance) performance.value = { ...performance.value, ...parsed.performance };
        if (parsed.advanced) advanced.value = { ...advanced.value, ...parsed.advanced };
      } catch (e) {
        console.warn('Failed to load settings from localStorage:', e);
      }
    }

    const toast = useToast();
    toast.add({
      title: 'Warning',
      description: 'Could not load settings from server. Using local settings.',
      color: 'warning',
    });
  }
});
</script>
