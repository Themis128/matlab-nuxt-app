<template>
  <!-- Enhanced Modal Backdrop -->
  <Teleport to="body">
    <Transition name="modal" appear>
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="closeDialog"
      >
        <!-- Backdrop with blur and gradient -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-sm"
        ></div>

        <!-- Modal Card with glass morphism -->
        <div
          class="relative mx-4 w-full max-w-md transform rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-slate-700/50 dark:bg-slate-900/95"
          :class="isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
        >
          <!-- Animated background pattern -->
          <div class="absolute inset-0 overflow-hidden rounded-2xl opacity-5">
            <svg class="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="modal-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="0.5"
                    opacity="0.1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#modal-grid)" />
            </svg>
          </div>

          <!-- Header with enhanced design -->
          <div class="relative p-6 pb-4">
            <div class="mb-2 flex items-center gap-3">
              <div class="relative">
                <div class="bg-primary-400/20 absolute inset-0 rounded-xl opacity-50 blur-lg"></div>
                <Cog6ToothIcon class="text-primary-500 dark:text-primary-400 relative h-6 w-6" />
              </div>
              <h3
                class="from-primary-600 bg-gradient-to-r to-purple-600 bg-clip-text text-xl font-bold text-transparent"
              >
                User Preferences
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Customize your experience with these settings
            </p>
          </div>

          <!-- Content with enhanced form controls -->
          <div class="relative px-6 pb-6">
            <div class="space-y-6">
              <!-- Theme Selection with enhanced styling -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="rounded-lg bg-yellow-400/20 p-1.5">
                    <SwatchIcon class="h-4 w-4 text-yellow-600" />
                  </div>
                  <label class="font-semibold text-gray-800 dark:text-gray-200">Theme</label>
                </div>
                <div class="relative">
                  <USelectMenu
                    v-model="localPreferences.theme"
                    :options="themeOptions"
                    placeholder="Select theme"
                    class="w-full"
                    @update:model-value="handlePreferenceChange('theme', $event)"
                  >
                    <template #leading>
                      <UIcon
                        :name="getThemeIcon(localPreferences.theme)"
                        class="h-4 w-4 text-gray-500"
                      />
                    </template>
                  </USelectMenu>
                </div>
              </div>

              <!-- Animation Toggle with modern switch -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="rounded-lg bg-blue-400/20 p-1.5">
                    <PlayPauseIcon class="h-4 w-4 text-blue-600" />
                  </div>
                  <label class="font-semibold text-gray-800 dark:text-gray-200">Animations</label>
                </div>
                <div
                  class="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ localPreferences.animations ? 'Enabled' : 'Disabled' }}
                  </span>
                  <!-- Custom Toggle Switch -->
                  <div
                    class="relative h-6 w-12 cursor-pointer rounded-full transition-all duration-300"
                    :class="
                      localPreferences.animations
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25'
                        : 'bg-gray-300 dark:bg-gray-600'
                    "
                    @click="handlePreferenceChange('animations', !localPreferences.animations)"
                    role="switch"
                    :aria-checked="localPreferences.animations"
                    tabindex="0"
                    @keydown="handleSwitchKeydown('animations', $event)"
                  >
                    <div
                      class="absolute left-1 top-1 h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300"
                      :class="localPreferences.animations ? 'translate-x-6' : 'translate-x-0'"
                    >
                      <div
                        class="absolute inset-0 rounded-full transition-opacity duration-300"
                        :class="
                          localPreferences.animations
                            ? 'bg-blue-400/20 opacity-100'
                            : 'bg-gray-400/20 opacity-100'
                        "
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Compact Mode Toggle -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="rounded-lg bg-green-400/20 p-1.5">
                    <Squares2X2Icon class="h-4 w-4 text-green-600" />
                  </div>
                  <label class="font-semibold text-gray-800 dark:text-gray-200">Compact Mode</label>
                </div>
                <div
                  class="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ localPreferences.compactMode ? 'Enabled' : 'Disabled' }}
                  </span>
                  <div
                    class="relative h-6 w-12 cursor-pointer rounded-full transition-all duration-300"
                    :class="
                      localPreferences.compactMode
                        ? 'bg-gradient-to-r from-green-500 to-teal-600 shadow-lg shadow-green-500/25'
                        : 'bg-gray-300 dark:bg-gray-600'
                    "
                    @click="handlePreferenceChange('compactMode', !localPreferences.compactMode)"
                    role="switch"
                    :aria-checked="localPreferences.compactMode"
                    tabindex="0"
                    @keydown="handleSwitchKeydown('compactMode', $event)"
                  >
                    <div
                      class="absolute left-1 top-1 h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300"
                      :class="localPreferences.compactMode ? 'translate-x-6' : 'translate-x-0'"
                    >
                      <div
                        class="absolute inset-0 rounded-full transition-opacity duration-300"
                        :class="
                          localPreferences.compactMode
                            ? 'bg-green-400/20 opacity-100'
                            : 'bg-gray-400/20 opacity-100'
                        "
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Auto Refresh Toggle -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="rounded-lg bg-purple-400/20 p-1.5">
                    <ArrowPathIcon class="h-4 w-4 text-purple-600" />
                  </div>
                  <label class="font-semibold text-gray-800 dark:text-gray-200">Auto Refresh</label>
                </div>
                <div
                  class="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ localPreferences.autoRefresh ? 'Enabled' : 'Disabled' }}
                  </span>
                  <div
                    class="relative h-6 w-12 cursor-pointer rounded-full transition-all duration-300"
                    :class="
                      localPreferences.autoRefresh
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25'
                        : 'bg-gray-300 dark:bg-gray-600'
                    "
                    @click="handlePreferenceChange('autoRefresh', !localPreferences.autoRefresh)"
                    role="switch"
                    :aria-checked="localPreferences.autoRefresh"
                    tabindex="0"
                    @keydown="handleSwitchKeydown('autoRefresh', $event)"
                  >
                    <div
                      class="absolute left-1 top-1 h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300"
                      :class="localPreferences.autoRefresh ? 'translate-x-6' : 'translate-x-0'"
                    >
                      <div
                        class="absolute inset-0 rounded-full transition-opacity duration-300"
                        :class="
                          localPreferences.autoRefresh
                            ? 'bg-purple-400/20 opacity-100'
                            : 'bg-gray-400/20 opacity-100'
                        "
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Footer -->
            <div
              class="mt-8 flex justify-between gap-3 border-t border-gray-200 pt-6 dark:border-slate-700"
            >
              <UButton
                variant="ghost"
                color="gray"
                class="transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                @click="resetToDefaults"
              >
                <ArrowPathIcon class="mr-2 h-4 w-4" />
                Reset to Defaults
              </UButton>
              <UButton
                @click="closeDialog"
                class="from-primary-500 hover:from-primary-600 bg-gradient-to-r to-purple-600 text-white shadow-lg transition-all duration-200 hover:to-purple-700 hover:shadow-xl"
              >
                Close
              </UButton>
            </div>
          </div>

          <!-- Close button with enhanced styling -->
          <button
            @click="closeDialog"
            class="group absolute right-4 top-4 rounded-full bg-gray-100 p-2 transition-colors duration-200 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            aria-label="Close dialog"
          >
            <XMarkIcon
              class="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
            />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ArrowPathIcon,
  Cog6ToothIcon,
  PlayPauseIcon,
  Squares2X2Icon,
  SwatchIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

interface Props {
  modelValue: boolean;
}

interface Emits {
  'update:modelValue': [value: boolean];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Types
interface UserPreferences {
  theme: string;
  animations: boolean;
  compactMode: boolean;
  autoRefresh: boolean;
}

// Theme state
const localPreferences = ref<UserPreferences>({
  theme: 'system',
  animations: true,
  compactMode: false,
  autoRefresh: false,
});

// Try to import store with fallback
const preferencesStore = ref<any>(null);

const initializeStore = async () => {
  try {
    const storeModule = await import('~/stores/userPreferencesStore');
    preferencesStore.value = storeModule.useUserPreferencesStore();
    localPreferences.value = { ...preferencesStore.value.$state };
  } catch {
    console.warn('User preferences store not available, using local state only');
    preferencesStore.value = null;
  }
};

// Computed properties
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const themeOptions = [
  { label: 'Light', value: 'light', icon: 'i-heroicons-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-heroicons-moon' },
  { label: 'System', value: 'system', icon: 'i-heroicons-computer-desktop' },
];

const getThemeIcon = (theme: string) => {
  switch (theme) {
    case 'light':
      return 'i-heroicons-sun';
    case 'dark':
      return 'i-heroicons-moon';
    default:
      return 'i-heroicons-computer-desktop';
  }
};

// Methods
const handlePreferenceChange = (key: string, value: unknown) => {
  // Update local state immediately for better UX
  localPreferences.value = {
    ...localPreferences.value,
    [key]: value,
  };

  // Update store if available
  if (preferencesStore.value) {
    (preferencesStore.value as any)[key] = value;
  }

  // Apply theme change immediately
  if (key === 'theme') {
    applyTheme(value as string);
  }

  // Apply animation preference
  if (key === 'animations') {
    applyAnimationPreference(value as boolean);
  }
};

const applyTheme = (theme: string) => {
  if (process.client) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    }
    // For 'system', we'll handle this based on media query in a real app
  }
};

const applyAnimationPreference = (enabled: boolean) => {
  if (process.client) {
    const root = document.documentElement;
    if (enabled) {
      root.classList.remove('no-animations');
      root.style.setProperty('--animation-duration', '300ms');
    } else {
      root.classList.add('no-animations');
      root.style.setProperty('--animation-duration', '0ms');
    }
  }
};

const handleSwitchKeydown = (key: string, event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    const currentValue = (localPreferences.value as any)[key];
    handlePreferenceChange(key, !currentValue);
  }
};

const resetToDefaults = () => {
  const defaults = {
    theme: 'system',
    animations: true,
    compactMode: false,
    autoRefresh: false,
  };

  localPreferences.value = { ...defaults };

  if (preferencesStore.value) {
    Object.assign(preferencesStore.value, defaults);
  }
};

const closeDialog = () => {
  isOpen.value = false;
};

// Sync with props
watch(
  () => props.modelValue,
  (isOpen: boolean) => {
    if (isOpen && preferencesStore.value) {
      localPreferences.value = { ...preferencesStore.value.$state };
    }
  }
);

// Watch for store changes
watch(
  () => preferencesStore.value?.$state,
  (newPreferences: UserPreferences | undefined) => {
    if (newPreferences && props.modelValue) {
      localPreferences.value = { ...newPreferences };
    }
  },
  { deep: true }
);

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDialog();
  }
};

onMounted(() => {
  initializeStore();
  if (process.client) {
    document.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('keydown', handleKeydown);
  }
});
</script>

<style scoped>
/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-enter-from .bg-white\/95,
.modal-leave-to .bg-white\/95 {
  opacity: 0;
  transform: scale(0.95);
}

/* Custom animations */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Custom scrollbar */
:deep(.scrollbar-thin) {
  scrollbar-width: thin;
}

:deep(.scrollbar-thin::-webkit-scrollbar) {
  width: 6px;
}

:deep(.scrollbar-thin::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.scrollbar-thin::-webkit-scrollbar-thumb) {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

:deep(.scrollbar-thin::-webkit-scrollbar-thumb:hover) {
  background: rgba(156, 163, 175, 0.5);
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
