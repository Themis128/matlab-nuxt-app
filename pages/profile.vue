<template>
  <DPageLayout>
    <div class="container mx-auto max-w-5xl p-6">
      <!-- Header -->
      <DPageHeader
        title="User Profile"
        description="Manage your account settings and preferences"
        icon="heroicons:user-circle"
        icon-bg="secondary"
      />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Profile Info -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Basic Information -->
          <div class="card-modern animate-scale-in p-6">
            <div class="mb-6 flex items-center justify-between">
              <h2 class="flex items-center gap-2 text-xl font-semibold text-base-content">
                <Icon name="heroicons:identification" class="h-5 w-5 text-primary" />
                Basic Information
              </h2>
              <DButton
                v-if="!editingProfile"
                variant="ghost"
                size="sm"
                @click="editingProfile = true"
              >
                <Icon name="heroicons:pencil" class="h-4 w-4" />
                Edit Profile
              </DButton>
            </div>

            <div class="space-y-4">
              <!-- Avatar -->
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <div
                    class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white"
                  >
                    {{ userInitials }}
                  </div>
                  <button
                    v-if="editingProfile"
                    class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Icon name="i-heroicons-camera" class="h-3 w-3" />
                  </button>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-base-content">
                    {{ profile.name }}
                  </h3>
                  <p class="opacity-70">
                    {{ profile.email }}
                  </p>
                </div>
              </div>

              <!-- Form Fields -->
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-base-content">
                    Full Name
                  </label>
                  <DInput
                    v-model="profile.name"
                    :disabled="!editingProfile"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-base-content"> Email </label>
                  <DInput
                    v-model="profile.email"
                    :disabled="!editingProfile"
                    type="email"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-base-content"> Phone </label>
                  <DInput
                    v-model="profile.phone"
                    :disabled="!editingProfile"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-base-content"> Location </label>
                  <DInput
                    v-model="profile.location"
                    :disabled="!editingProfile"
                    placeholder="Enter your location"
                  />
                </div>
              </div>

              <!-- Bio -->
              <div>
                <label class="mb-1 block text-sm font-medium text-base-content"> Bio </label>
                <textarea
                  v-model="profile.bio"
                  :disabled="!editingProfile"
                  class="textarea textarea-bordered w-full"
                  placeholder="Tell us about yourself"
                  rows="3"
                />
              </div>

              <!-- Action Buttons -->
              <div v-if="editingProfile" class="flex gap-3">
                <DButton :loading="saving" @click="saveProfile" variant="info">
                  Save Changes
                </DButton>
                <DButton variant="ghost" @click="cancelEdit"> Cancel </DButton>
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <DCard>
            <template #header>
              <h2 class="card-title">Preferences</h2>
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

              <!-- Notifications -->
              <div class="space-y-3">
                <label class="text-sm font-medium text-base-content"> Notifications </label>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm opacity-70"> Email notifications </span>
                    <DToggle v-model="preferences.emailNotifications" />
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-sm opacity-70"> Price alerts </span>
                    <DToggle v-model="preferences.priceAlerts" />
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-sm opacity-70"> New device notifications </span>
                    <DToggle v-model="preferences.deviceNotifications" />
                  </div>
                </div>
              </div>
            </div>
          </DCard>

          <!-- Activity -->
          <DCard>
            <template #header>
              <h2 class="card-title">Recent Activity</h2>
            </template>

            <div class="space-y-3">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
              >
                <div
                  :class="[
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    activity.type === 'search'
                      ? 'bg-blue-100 text-blue-600'
                      : activity.type === 'compare'
                        ? 'bg-green-100 text-green-600'
                        : activity.type === 'prediction'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  <Icon :name="activity.icon" class="h-4 w-4" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ activity.title }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatTime(activity.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </DCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Stats -->
          <DCard>
            <template #header>
              <h3 class="card-title">Your Stats</h3>
            </template>

            <div class="space-y-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {{ stats.searches }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Searches</div>
              </div>

              <div class="text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                  {{ stats.comparisons }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Comparisons</div>
              </div>

              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {{ stats.predictions }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Predictions</div>
              </div>
            </div>
          </DCard>

          <!-- Quick Actions -->
          <DCard>
            <template #header>
              <h3 class="card-title">Quick Actions</h3>
            </template>

            <div class="card-body space-y-3">
              <DButton variant="ghost" block @click="navigateTo('/search')">
                <Icon name="i-heroicons-magnifying-glass" class="mr-2 h-4 w-4" />
                Search Devices
              </DButton>

              <DButton variant="ghost" block @click="navigateTo('/compare')">
                <Icon name="i-heroicons-scale" class="mr-2 h-4 w-4" />
                Compare Devices
              </DButton>

              <DButton variant="ghost" block @click="navigateTo('/ai-demo')">
                <Icon name="i-heroicons-sparkles" class="mr-2 h-4 w-4" />
                Price Prediction
              </DButton>

              <DButton variant="ghost" block @click="navigateTo('/query')">
                <Icon name="i-heroicons-chat-bubble-left-right" class="mr-2 h-4 w-4" />
                Query Assistant
              </DButton>
            </div>
          </DCard>

          <!-- Account Actions -->
          <DCard>
            <template #header>
              <h3 class="card-title">Account</h3>
            </template>

            <div class="card-body space-y-3">
              <DButton variant="ghost" block @click="exportData">
                <Icon name="i-heroicons-arrow-down-tray" class="mr-2 h-4 w-4" />
                Export Data
              </DButton>

              <DButton variant="ghost" block @click="clearHistory">
                <Icon name="i-heroicons-trash" class="mr-2 h-4 w-4" />
                Clear History
              </DButton>

              <DButton variant="error" block @click="deleteAccount">
                <Icon name="i-heroicons-user-minus" class="mr-2 h-4 w-4" />
                Delete Account
              </DButton>
            </div>
          </DCard>
        </div>
      </div>
    </div>
  </DPageLayout>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  title: 'Profile',
  description: 'Manage your account settings and preferences',
  layout: 'default',
});

// Reactive state
const editingProfile = ref(false);
const saving = ref(false);

// Profile data
const profile = ref({
  name: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
});

// Backup for cancel functionality
const originalProfile = ref({ ...profile.value });

// Preferences
const preferences = ref({
  emailNotifications: true,
  priceAlerts: true,
  deviceNotifications: false,
});

// Stats and activity
const stats = ref({
  searches: 0,
  comparisons: 0,
  predictions: 0,
  queries: 0,
});

const recentActivity = ref<any[]>([]);

// Computed properties
const userInitials = computed(() => {
  return profile.value.name
    .split(' ')
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

// Methods
const saveProfile = async () => {
  saving.value = true;

  try {
    // Call real API to update profile
    const updatedProfile = await $fetch('/api/user/profile', {
      method: 'PUT',
      body: profile.value,
    });

    // Update profile with response
    if ('name' in updatedProfile) {
      profile.value = {
        name: updatedProfile.name || '',
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || '',
        location: updatedProfile.location || '',
        bio: updatedProfile.bio || '',
      };
      originalProfile.value = { ...profile.value };
      editingProfile.value = false;
    } else {
      throw new Error('Failed to update profile');
    }

    const toast = useToast();
    toast.add({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
      color: 'success',
    });
  } catch (error: any) {
    const toast = useToast();
    toast.add({
      title: 'Error',
      description: error?.data?.statusMessage || 'Failed to update profile. Please try again.',
      color: 'error',
    });
  } finally {
    saving.value = false;
  }
};

const cancelEdit = () => {
  profile.value = { ...originalProfile.value };
  editingProfile.value = false;
};

const exportData = () => {
  const data = {
    profile: profile.value,
    preferences: preferences.value,
    stats: stats.value,
    activity: recentActivity.value,
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'profile-data.json';
  a.click();
  URL.revokeObjectURL(url);

  const toast = useToast();
  toast.add({
    title: 'Data Exported',
    description: 'Your profile data has been downloaded.',
    color: 'success',
  });
};

const clearHistory = () => {
  recentActivity.value = [];
  stats.value = { searches: 0, comparisons: 0, predictions: 0, queries: 0 };

  const toast = useToast();
  toast.add({
    title: 'History Cleared',
    description: 'Your activity history has been cleared.',
    color: 'success',
  });
};

const deleteAccount = () => {
  // This would typically show a confirmation modal
  const toast = useToast();
  toast.add({
    title: 'Account Deletion',
    description: 'Please contact support to delete your account.',
    color: 'warning',
  });
};

const formatTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return timestamp.toLocaleDateString();
};

// Load data on mount
onMounted(async () => {
  try {
    // Load profile data
    const profileData = await $fetch('/api/user/profile');
    if ('name' in profileData) {
      profile.value = {
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
      };
      originalProfile.value = { ...profile.value };
    }

    // Load activity and stats
    const activityData = await $fetch('/api/user/activity?limit=5');
    if ('stats' in activityData && activityData.stats) {
      stats.value = activityData.stats;
    }
    if ('activities' in activityData && activityData.activities) {
      recentActivity.value = activityData.activities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }));
    }

    // Load user preferences from localStorage
    const savedPreferences = localStorage.getItem('user-preferences');
    if (savedPreferences) {
      try {
        preferences.value = { ...preferences.value, ...JSON.parse(savedPreferences) };
      } catch (e) {
        console.warn('Failed to load user preferences:', e);
      }
    }
  } catch (error) {
    console.error('Failed to load profile data:', error);
    const toast = useToast();
    toast.add({
      title: 'Warning',
      description: 'Some profile data could not be loaded.',
      color: 'warning',
    });
  }
});

// Watch preferences and save to localStorage
watch(
  preferences,
  (newPreferences: {
    emailNotifications: boolean;
    priceAlerts: boolean;
    deviceNotifications: boolean;
  }) => {
    localStorage.setItem('user-preferences', JSON.stringify(newPreferences));
  },
  { deep: true }
);
</script>
