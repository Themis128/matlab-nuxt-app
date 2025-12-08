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
      />
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
      <button
        type="button"
        :class="[
          'relative h-7 w-14 cursor-pointer rounded-full border-0 bg-transparent p-0 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          isDarkMode
            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25'
            : 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25',
        ]"
        role="switch"
        :aria-checked="isDarkMode"
        aria-label="Toggle theme"
        tabindex="0"
        style="pointer-events: auto !important; z-index: 10; position: relative"
        @click="toggleTheme"
        @keydown="handleKeydown"
      >
        <!-- Animated Thumb -->
        <div
          :class="[
            'pointer-events-none absolute left-1 top-1 h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out',
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
          />
        </div>

        <!-- Moving particles/indicators -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <div
            :class="[
              'absolute left-2 top-1 h-1 w-1 rounded-full transition-all duration-300',
              isDarkMode ? 'bg-white/40' : 'bg-white/80',
            ]"
            style="animation: particle1 3s infinite ease-in-out"
          />
          <div
            :class="[
              'absolute left-4 top-3 h-1 w-1 rounded-full transition-all duration-300',
              isDarkMode ? 'bg-white/20' : 'bg-white/60',
            ]"
            style="animation: particle2 2.5s infinite ease-in-out reverse"
          />
          <div
            :class="[
              'absolute bottom-1 right-2 h-1 w-1 rounded-full transition-all duration-300',
              isDarkMode ? 'bg-white/30' : 'bg-white/70',
            ]"
            style="animation: particle3 3.5s infinite ease-in-out"
          />
        </div>
      </button>

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
      />
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
import { onMounted, ref, watchEffect } from 'vue';

// Theme state
const currentTheme = ref('system');
const isDarkMode = ref(false);

// Helper functions - following DaisyUI migration guide
const applyThemeToDocument = (theme: string) => {
  if (typeof window === 'undefined') return; // Skip on server

  // Set data-theme attribute (DaisyUI way per migration guide)
  document.documentElement.setAttribute('data-theme', theme);

  // Also maintain dark class for compatibility
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

// Nuxt 4: Use unified UI composable (auto-imported)
const { theme, preferences, setTheme } = useUI();

// Initialize theme on client-side only
const initializeTheme = async () => {
  if (typeof window === 'undefined') return;

  try {
    // Use unified UI composable
    const storeTheme = preferences.value.theme;
    const resolvedTheme = theme.value;

    currentTheme.value = storeTheme;
    isDarkMode.value = resolvedTheme === 'dark';
    applyThemeToDocument(resolvedTheme);

    // Watch for theme changes
    watchEffect(() => {
      const newStoreTheme = preferences.value.theme;
      const newResolvedTheme = theme.value;

      currentTheme.value = newStoreTheme;
      isDarkMode.value = newResolvedTheme === 'dark';
      applyThemeToDocument(newResolvedTheme);
    });

    // Expose toggleTheme to window for testing
    if (typeof window !== 'undefined') {
      (window as any).__toggleTheme = toggleTheme;
    }
  } catch {
    const logger = useSentryLogger();
    logger.warn('Theme composable not available, using fallback theme detection', {
      component: 'ThemeToggle',
    });
    // Fallback to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme.value = 'system';
    isDarkMode.value = prefersDark;
    applyThemeToDocument(prefersDark ? 'dark' : 'light');
  }
};

// Methods
const toggleTheme = async () => {
  if (typeof window === 'undefined') return;

  try {
    // Get current theme from composable
    const currentStoreTheme = preferences.value.theme;

    // Cycle through themes: light → dark → system → light
    let newTheme: 'light' | 'dark' | 'system';
    if (currentStoreTheme === 'light') {
      newTheme = 'dark';
    } else if (currentStoreTheme === 'dark') {
      newTheme = 'system';
    } else {
      // currentStoreTheme === 'system'
      newTheme = 'light';
    }

    // Update composable
    setTheme(newTheme);

    // Get resolved theme (for 'system', this will be the actual preference)
    const resolvedTheme = theme.value;

    // Update DOM immediately based on resolved theme
    applyThemeToDocument(resolvedTheme);

    // Update local state
    currentTheme.value = newTheme;
    isDarkMode.value = resolvedTheme === 'dark';
  } catch {
    // Fallback: if composable not available, toggle between light/dark based on DOM
    const currentIsDark = document.documentElement.classList.contains('dark');
    const newIsDark = !currentIsDark;

    // Update DOM immediately
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update local state
    isDarkMode.value = newIsDark;
    const newTheme = newIsDark ? 'dark' : 'light';
    currentTheme.value = newTheme;

    // Update CSS variable
    document.documentElement.style.setProperty(
      '--theme-color',
      newTheme === 'dark' ? '#8b5cf6' : '#fbbf24'
    );
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
[role='switch']:focus,
button[role='switch']:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Ensure button is clickable */
button[role='switch'] {
  pointer-events: auto !important;
  z-index: 10;
  user-select: none;
  -webkit-user-select: none;
}

/* Enhanced hover effects */
.group:hover {
  transform: translateY(-1px);
}
</style>
