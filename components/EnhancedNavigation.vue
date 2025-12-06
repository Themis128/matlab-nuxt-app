<template>
  <nav
    class="sticky top-0 z-50 border-b border-gray-200/50 bg-white/95 backdrop-blur-xl transition-all duration-300 dark:border-gray-700/50 dark:bg-gray-900/95"
    role="navigation"
    aria-label="Main navigation"
    :class="{ 'shadow-lg': scrolled, 'shadow-sm': !scrolled }"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="sm:h-18 flex h-16 items-center justify-between">
        <!-- Logo Section -->
        <NuxtLink
          to="/"
          class="group -m-2 flex items-center gap-3 rounded-lg p-2 transition-all duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          aria-label="MATLAB Analytics Home"
          @click="closeMobileMenu"
        >
          <div class="relative">
            <UIcon
              name="i-heroicons-cpu-chip"
              class="h-8 w-8 text-purple-600 transition-transform duration-200 group-hover:scale-110 dark:text-purple-400"
              aria-hidden="true"
            />
            <div
              class="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-green-400"
            ></div>
          </div>
          <div class="flex flex-col">
            <span
              class="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl"
            >
              MATLAB Analytics
            </span>
            <span class="-mt-1 text-xs text-gray-500 dark:text-gray-400">
              Deep Learning Platform
            </span>
          </div>
        </NuxtLink>

        <!-- Quick Search Bar (Desktop) -->
        <div class="mx-8 hidden max-w-md flex-1 md:block">
          <div class="relative">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
              aria-hidden="true"
            />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search phones, models, brands..."
              class="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800"
              @keyup.enter="performSearch"
              aria-label="Quick search"
            />
          </div>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden items-center gap-1 lg:flex xl:gap-2">
          <!-- Primary Navigation -->
          <div class="flex items-center gap-1">
            <UButton
              to="/"
              variant="ghost"
              color="gray"
              icon="i-heroicons-home"
              class="nav-button"
              :class="{ 'nav-button-active': route.path === '/' }"
              aria-label="Go to home page"
            >
              <span class="hidden xl:inline">Home</span>
            </UButton>

            <UButton
              to="/search"
              variant="ghost"
              color="gray"
              icon="i-heroicons-funnel"
              class="nav-button"
              :class="{ 'nav-button-active': route.path === '/search' }"
              aria-label="Advanced search"
            >
              <span class="hidden xl:inline">Search</span>
            </UButton>

            <UButton
              to="/compare"
              variant="ghost"
              color="gray"
              icon="i-heroicons-scale"
              class="nav-button"
              :class="{ 'nav-button-active': route.path === '/compare' }"
              aria-label="Compare phones"
            >
              <span class="hidden xl:inline">Compare</span>
            </UButton>
          </div>

          <!-- Secondary Navigation (More Tools) -->
          <div class="flex items-center gap-1 border-l border-gray-200 pl-2 dark:border-gray-700">
            <UDropdown
              :items="secondaryNavItems"
              :popper="{ placement: 'bottom-end' }"
              class="nav-dropdown"
            >
              <UButton
                variant="ghost"
                color="gray"
                icon="i-heroicons-chevron-down"
                class="nav-button"
                aria-label="More tools"
              >
                <span class="hidden xl:inline">Tools</span>
                <UIcon name="i-heroicons-chevron-down" class="ml-1 h-4 w-4" />
              </UButton>
            </UDropdown>
          </div>

          <!-- User Actions -->
          <div
            class="ml-2 flex items-center gap-2 border-l border-gray-200 pl-3 dark:border-gray-700"
          >
            <UButton
              variant="ghost"
              color="gray"
              icon="i-heroicons-cog-6-tooth"
              class="nav-button"
              aria-label="Open settings"
              @click="openPreferences"
            />
            <ThemeToggle />
          </div>
        </div>

        <!-- Mobile Controls -->
        <div class="flex items-center gap-2 lg:hidden">
          <!-- Mobile Search Toggle -->
          <UButton
            @click="toggleMobileSearch"
            variant="ghost"
            color="gray"
            icon="i-heroicons-magnifying-glass"
            class="nav-button"
            :aria-label="mobileSearchOpen ? 'Close search' : 'Open search'"
          />

          <!-- Theme Toggle (Mobile) -->
          <ThemeToggle />

          <!-- Mobile Menu Toggle -->
          <UButton
            @click="toggleMobileMenu"
            variant="ghost"
            color="gray"
            icon="i-heroicons-bars-3"
            class="nav-button"
            :aria-label="mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
          />
        </div>
      </div>

      <!-- Mobile Search Bar -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileSearchOpen" class="pb-4 md:hidden">
          <div class="relative">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
              aria-hidden="true"
            />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search phones, models, brands..."
              class="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-base focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800"
              @keyup.enter="performSearch"
              ref="mobileSearchInput"
              aria-label="Mobile search"
            />
          </div>
        </div>
      </Transition>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div
          v-if="mobileMenuOpen"
          id="mobile-menu"
          class="lg:hidden"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <!-- User Info Section -->
          <div class="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
            <div class="flex items-center gap-3 px-2">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-600"
              >
                <UIcon name="i-heroicons-user" class="h-5 w-5 text-white" />
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">MATLAB Analytics</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Deep Learning Platform</div>
              </div>
            </div>
          </div>

          <!-- Primary Navigation -->
          <div class="mb-6 space-y-1">
            <h3
              class="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
            >
              Main
            </h3>
            <UButton
              v-for="item in primaryNavItems"
              :key="item.to"
              :to="item.to"
              variant="ghost"
              color="gray"
              block
              :icon="item.icon"
              class="mobile-nav-item justify-start"
              @click="closeMobileMenu"
              role="menuitem"
            >
              {{ item.label }}
            </UButton>
          </div>

          <!-- Secondary Navigation -->
          <div class="mb-6 space-y-1">
            <h3
              class="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
            >
              Tools & Features
            </h3>
            <UButton
              v-for="item in secondaryNavItems[0] || []"
              :key="item.label"
              :to="item.to"
              variant="ghost"
              color="gray"
              block
              :icon="item.icon"
              class="mobile-nav-item justify-start"
              @click="closeMobileMenu"
              role="menuitem"
            >
              {{ item.label }}
            </UButton>
          </div>

          <!-- Quick Actions -->
          <div class="mb-4 space-y-1">
            <h3
              class="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
            >
              Quick Actions
            </h3>
            <UButton
              variant="ghost"
              color="gray"
              block
              icon="i-heroicons-cog-6-tooth"
              class="mobile-nav-item justify-start"
              @click="openPreferences"
              role="menuitem"
            >
              Settings & Preferences
            </UButton>
            <UButton
              variant="ghost"
              color="gray"
              block
              icon="i-heroicons-question-mark-circle"
              class="mobile-nav-item justify-start"
              @click="openHelp"
              role="menuitem"
            >
              Help & Support
            </UButton>
          </div>
        </div>
      </Transition>
    </div>
  </nav>

  <!-- Preferences Dialog -->
  <UserPreferencesDialog v-model="preferencesOpen" />
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

// Reactive state
const mobileMenuOpen = ref(false);
const mobileSearchOpen = ref(false);
const preferencesOpen = ref(false);
const searchQuery = ref('');
const scrolled = ref(false);

// Template refs
const mobileSearchInput: Ref<HTMLInputElement | undefined> = ref();

// Get current route
const route = useRoute();

// Computed navigation items
const primaryNavItems = computed(() => [
  { label: 'Home', to: '/', icon: 'i-heroicons-home' },
  { label: 'Search', to: '/search', icon: 'i-heroicons-funnel' },
  { label: 'Compare', to: '/compare', icon: 'i-heroicons-scale' },
  { label: 'AI Demo', to: '/ai-demo', icon: 'i-heroicons-sparkles' },
]);

const secondaryNavItems = computed(() => [
  [
    { label: 'Price Finder', to: '/recommendations', icon: 'i-heroicons-currency-dollar' },
    { label: 'Advanced Models', to: '/advanced', icon: 'i-heroicons-cpu-chip' },
    { label: 'ML Comparison', to: '/ml-comparison', icon: 'i-heroicons-beaker' },
    { label: 'A/B Testing', to: '/ab-testing', icon: 'i-heroicons-chart-bar' },
    { label: 'Model Showcase', to: '/model-showcase', icon: 'i-heroicons-trophy' },
    { label: 'API Docs', to: '/api-docs', icon: 'i-heroicons-document-text' },
    { label: 'Data Mining', to: '/datamine', icon: 'i-heroicons-magnifying-glass' },
  ],
]);

// Methods
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  if (mobileMenuOpen.value) {
    mobileSearchOpen.value = false;
  }
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const toggleMobileSearch = async () => {
  mobileSearchOpen.value = !mobileSearchOpen.value;
  if (mobileSearchOpen.value) {
    mobileMenuOpen.value = false;
    await nextTick();
    mobileSearchInput.value?.focus();
  }
};

const openPreferences = () => {
  preferencesOpen.value = true;
  mobileMenuOpen.value = false;
};

const openHelp = () => {
  // Navigate to help page or open help modal
  const logger = useSentryLogger();
  logger.logUserAction('open_help', undefined, { component: 'EnhancedNavigation' });
  mobileMenuOpen.value = false;
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    // Navigate to search page with query
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
    mobileSearchOpen.value = false;
    closeMobileMenu();
  }
};

// Event handlers
const handleScroll = () => {
  scrolled.value = window.scrollY > 4;
};

const handleKeydown = (event: KeyboardEvent) => {
  // Escape key handling
  if (event.key === 'Escape') {
    if (mobileSearchOpen.value) {
      mobileSearchOpen.value = false;
    } else if (mobileMenuOpen.value) {
      mobileMenuOpen.value = false;
    } else if (preferencesOpen.value) {
      preferencesOpen.value = false;
    }
  }

  // Ctrl/Cmd + K for search
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    if (window.innerWidth < 1024) {
      toggleMobileSearch();
    }
  }
};

// Close mobile menu on route change
watch(
  () => route.path,
  () => {
    closeMobileMenu();
    mobileSearchOpen.value = false;
  }
);

// Lifecycle
onMounted(() => {
  if (process.client) {
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('keydown', handleKeydown);
  }
});
</script>

<style scoped>
/* Navigation button styles */
.nav-button {
  position: relative;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.nav-button:hover {
  background-color: rgb(243 244 246);
}

.dark .nav-button:hover {
  background-color: rgb(31 41 55);
}

.nav-button:focus {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(147, 51, 234, 0.5),
    0 0 0 4px rgba(147, 51, 234, 0.2);
}

.nav-button-active {
  background-color: rgb(243 232 255);
  color: rgb(126 34 206);
}

.dark .nav-button-active {
  background-color: rgba(147, 51, 234, 0.3);
  color: rgb(196 181 253);
}

.nav-dropdown :deep(.dropdown-menu) {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-radius: 0.75rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dark .nav-dropdown :deep(.dropdown-menu) {
  background-color: rgba(17, 24, 39, 0.95);
  border-color: rgba(55, 65, 81, 0.5);
}

/* Mobile navigation items */
.mobile-nav-item {
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.mobile-nav-item:hover {
  background-color: rgb(243 244 246);
}

.dark .mobile-nav-item:hover {
  background-color: rgb(31 41 55);
}

/* Search input focus styles */
input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, opacity, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Touch target improvements */
@media (pointer: coarse) {
  .nav-button {
    min-height: 44px;
    min-width: 44px;
  }

  .mobile-nav-item {
    min-height: 48px;
  }
}
</style>
