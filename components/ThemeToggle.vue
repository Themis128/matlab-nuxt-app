<template>
  <div class="relative flex items-center gap-4">
    <!-- Sun Icon -->
    <div class="relative flex items-center justify-center">
      <div
        :class="[
          'absolute inset-0 rounded-full transition-all duration-300',
          !isDarkMode
            ? 'scale-110 bg-yellow-400/20 opacity-100'
            : 'scale-90 bg-yellow-400/0 opacity-0',
        ]"
      ></div>
      <SunIcon
        :class="[
          'relative z-10 h-5 w-5 transition-all duration-300',
          !isDarkMode ? 'scale-110 text-yellow-500' : 'scale-90 text-gray-400',
        ]"
      />
    </div>

    <!-- Enhanced Toggle Switch -->
    <div class="relative">
      <!-- Background Track -->
      <div
        :class="[
          'relative h-7 w-14 cursor-pointer rounded-full transition-all duration-300 ease-in-out',
          isDarkMode
            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25'
            : 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25',
        ]"
        @click="toggleTheme"
        role="switch"
        :aria-checked="isDarkMode"
        aria-label="Toggle theme"
        tabindex="0"
        @keydown="handleKeydown"
      >
        <!-- Animated Thumb -->
        <div
          :class="[
            'absolute left-1 top-1 h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out',
            isDarkMode
              ? 'translate-x-7 bg-gray-100 shadow-purple-500/20'
              : 'translate-x-0 bg-white shadow-yellow-500/20',
          ]"
        >
          <!-- Inner glow effect -->
          <div
            :class="[
              'absolute inset-0 rounded-full transition-opacity duration-300',
              isDarkMode ? 'bg-purple-400/10 opacity-100' : 'bg-yellow-400/10 opacity-100',
            ]"
          ></div>
        </div>

        <!-- Moving particles/indicators -->
        <div class="absolute inset-0 overflow-hidden rounded-full">
          <div
            :class="[
              'absolute left-2 top-1 h-1 w-1 rounded-full transition-all duration-300',
              isDarkMode ? 'bg-white/40' : 'bg-white/80',
            ]"
            style="animation: particle1 3s infinite ease-in-out"
          ></div>
          <div
            :class="[
              'absolute left-4 top-3 h-1 w-1 rounded-full transition-all duration-300',
              isDarkMode ? 'bg-white/20' : 'bg-white/60',
            ]"
            style="animation: particle2 2.5s infinite ease-in-out reverse"
          ></div>
          <div
            :class="[
              'absolute bottom-1 right-2 h-1 w-1 rounded-full transition-all duration-300',
              isDarkMode ? 'bg-white/30' : 'bg-white/70',
            ]"
            style="animation: particle3 3.5s infinite ease-in-out"
          ></div>
        </div>
      </div>

      <!-- Toggle label -->
      <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 transform">
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ isDarkMode ? 'Dark' : 'Light' }}
        </span>
      </div>
    </div>

    <!-- Moon Icon -->
    <div class="relative flex items-center justify-center">
      <div
        :class="[
          'absolute inset-0 rounded-full transition-all duration-300',
          isDarkMode
            ? 'scale-110 bg-purple-400/20 opacity-100'
            : 'scale-90 bg-purple-400/0 opacity-0',
        ]"
      ></div>
      <MoonIcon
        :class="[
          'relative z-10 h-5 w-5 transition-all duration-300',
          isDarkMode ? 'scale-110 text-purple-400' : 'scale-90 text-gray-400',
        ]"
      />
    </div>

    <!-- Theme Badge -->
    <div v-if="currentTheme !== 'system'" class="relative">
      <div
        :class="[
          'rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-sm transition-all duration-300 hover:scale-105',
          currentTheme === 'dark'
            ? 'border-purple-400/30 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/10'
            : 'border-yellow-400/30 bg-yellow-500/20 text-yellow-300 shadow-lg shadow-yellow-500/10',
        ]"
      >
        {{ currentTheme }}
      </div>
    </div>

    <!-- System indicator -->
    <div v-else class="relative">
      <div
        class="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800"
      >
        <ComputerDesktopIcon class="mr-1 inline h-3 w-3" />
        system
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/vue/24/outline';
import { onMounted, ref } from 'vue';

// Theme state
const currentTheme = ref('system');
const isDarkMode = ref(false);

// Helper functions
const applyThemeToDocument = (theme: string) => {
  if (typeof window === 'undefined') return; // Skip on server

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Update custom CSS variables
  document.documentElement.style.setProperty(
    '--theme-color',
    theme === 'dark' ? '#8b5cf6' : '#fbbf24'
  );
};

// Initialize theme on client-side only
const initializeTheme = async () => {
  if (typeof window === 'undefined') return;

  try {
    // Dynamic import to avoid SSR issues
    const { useUserPreferencesStore } = await import('~/stores/userPreferencesStore');
    const userPreferencesStore = useUserPreferencesStore();

    const storeTheme = userPreferencesStore.theme;
    const resolvedTheme = userPreferencesStore.getResolvedTheme;

    currentTheme.value = storeTheme;
    isDarkMode.value = resolvedTheme === 'dark';
    applyThemeToDocument(resolvedTheme);

    // Watch for theme changes
    watchEffect(() => {
      const newStoreTheme = userPreferencesStore.theme;
      const newResolvedTheme = userPreferencesStore.getResolvedTheme;

      currentTheme.value = newStoreTheme;
      isDarkMode.value = newResolvedTheme === 'dark';
      applyThemeToDocument(newResolvedTheme);
    });
  } catch {
    console.warn('Theme store not available, using fallback theme detection');
    // Fallback to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme.value = 'system';
    isDarkMode.value = prefersDark;
    applyThemeToDocument(prefersDark ? 'dark' : 'light');
  }
};

// Methods
const toggleTheme = async () => {
  try {
    // Dynamic import to avoid SSR issues
    const { useUserPreferencesStore } = await import('~/stores/userPreferencesStore');
    const userPreferencesStore = useUserPreferencesStore();

    // Cycle through: light -> dark -> system -> light...
    const themes = ['light', 'dark', 'system'] as const;
    const currentThemeValue = currentTheme.value || 'system';

    // Ensure currentThemeValue is one of the valid themes
    let currentIndex = themes.indexOf(currentThemeValue as any);
    if (currentIndex === -1) {
      currentIndex = 2; // Default to system if not found
    }

    const nextIndex = (currentIndex + 1) % themes.length;

    userPreferencesStore.setTheme(themes[nextIndex]!);
  } catch {
    console.warn('Theme store not available, using fallback toggle');
    // Fallback toggle logic
    const themes = ['light', 'dark', 'system'] as const;
    let currentIndex = themes.indexOf(currentTheme.value as any);
    if (currentIndex === -1) currentIndex = 2;
    const nextIndex = (currentIndex + 1) % themes.length;
    currentTheme.value = themes[nextIndex]!;
    isDarkMode.value = currentTheme.value === 'dark';
    applyThemeToDocument(currentTheme.value);
  }
};

// Keyboard accessibility
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleTheme();
  }
};

// Initialize on client-side only
onMounted(() => {
  initializeTheme();
});
</script>

<style scoped>
/* Custom animations for particles */
@keyframes particle1 {
  0%,
  100% {
    transform: translateX(0) translateY(0);
    opacity: 0.4;
  }
  25% {
    transform: translateX(10px) translateY(-2px);
    opacity: 0.8;
  }
  50% {
    transform: translateX(5px) translateY(-5px);
    opacity: 1;
  }
  75% {
    transform: translateX(-5px) translateY(-2px);
    opacity: 0.6;
  }
}

@keyframes particle2 {
  0%,
  100% {
    transform: translateX(0) translateY(0);
    opacity: 0.3;
  }
  33% {
    transform: translateX(-8px) translateY(3px);
    opacity: 0.7;
  }
  66% {
    transform: translateX(3px) translateY(8px);
    opacity: 0.9;
  }
}

@keyframes particle3 {
  0%,
  100% {
    transform: translateX(0) translateY(0);
    opacity: 0.2;
  }
  50% {
    transform: translateX(12px) translateY(-3px);
    opacity: 0.8;
  }
}

/* Smooth focus states */
[role='switch']:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Enhanced hover effects */
.group:hover {
  transform: translateY(-1px);
}
</style>
