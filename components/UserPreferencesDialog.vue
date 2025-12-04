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
          class="relative w-full max-w-md mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 transform transition-all duration-300"
          :class="isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
        >
          <!-- Animated background pattern -->
          <div class="absolute inset-0 opacity-5 rounded-2xl overflow-hidden">
            <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
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
            <div class="flex items-center gap-3 mb-2">
              <div class="relative">
                <div class="absolute inset-0 bg-primary-400/20 rounded-xl blur-lg opacity-50"></div>
                <Cog6ToothIcon class="relative w-6 h-6 text-primary-500 dark:text-primary-400" />
              </div>
              <h3
                class="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"
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
                  <div class="p-1.5 bg-yellow-400/20 rounded-lg">
                    <SwatchIcon class="w-4 h-4 text-yellow-600" />
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
                        class="w-4 h-4 text-gray-500"
                      />
                    </template>
                  </USelectMenu>
                </div>
              </div>

              <!-- Animation Toggle with modern switch -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-blue-400/20 rounded-lg">
                    <PlayPauseIcon class="w-4 h-4 text-blue-600" />
                  </div>
                  <label class="font-semibold text-gray-800 dark:text-gray-200">Animations</label>
                </div>
                <div
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ localPreferences.animations ? 'Enabled' : 'Disabled' }}
                  </span>
                  <!-- Custom Toggle Switch -->
                  <div
                    class="relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300"
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
                      class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 transform"
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
                  <div class="p-1.5 bg-green-400/20 rounded-lg">
                    <Squares2x2Icon class="w-4 h-4 text-green-600" />
                  </div>
                  <label class="font-semibold text-gray-800 dark:text-gray-200">Compact Mode</label>
                </div>
                <div
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ localPreferences.compactMode ? 'Enabled' : 'Disabled' }}
                  </span>
                  <div
                    class="relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300"
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
                      class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 transform"
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
                  <div class="p-1.5 bg-purple-400/20 rounded-lg">
                    <ArrowPathIcon class="w-4 h-4 text-purple-600" />
                  </div>
                  <label class="font-semibold text-gray-800 dark:text-gray-200">Auto Refresh</label>
                </div>
                <div
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ localPreferences.autoRefresh ? 'Enabled' : 'Disabled' }}
                  </span>
                  <div
                    class="relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300"
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
                      class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 transform"
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
              class="flex justify-between gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700"
            >
              <UButton
                variant="ghost"
                color="gray"
                class="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
                @click="resetToDefaults"
              >
                <ArrowPathIcon class="w-4 h-4 mr-2" />
                Reset to Defaults
              </UButton>
              <UButton
                @click="closeDialog"
                class="bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Close
              </UButton>
            </div>
          </div>

          <!-- Close button with enhanced styling -->
          <button
            @click="closeDialog"
            class="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200 group"
            aria-label="Close dialog"
          >
            <XMarkIcon
              class="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
            />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  Cog6ToothIcon,
  SwatchIcon,
  PlayPauseIcon,
  Squares2X2Icon,
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';

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
  } catch (error) {
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
