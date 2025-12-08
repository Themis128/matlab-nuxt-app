<template>
  <nav
    class="sticky top-0 z-50 border-b border-base-300/50 bg-base-100/95 backdrop-blur-xl transition-all duration-300"
    role="navigation"
    :aria-label="t('common.navigation.home')"
    :class="{ 'shadow-lg': scrolled, 'shadow-sm': !scrolled }"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="sm:h-18 flex h-16 items-center justify-between">
        <!-- Logo Section -->
        <NuxtLink
          to="/"
          class="group -m-2 flex items-center gap-3 rounded-lg p-2 transition-all duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          :aria-label="t('common.app.name')"
          style="pointer-events: auto; z-index: 10; cursor: pointer"
          @click="
            () => {
              closeMobileMenu();
            }
          "
        >
          <div class="relative">
            <Icon
              name="heroicons:cpu-chip"
              class="h-8 w-8 text-primary transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
            <div class="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-green-400" />
          </div>
          <div class="flex flex-col">
            <span
              class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-lg font-bold text-transparent sm:text-xl"
            >
              {{ t('common.app.name') }}
            </span>
            <span class="-mt-1 text-xs text-base-content/60">
              {{ t('common.app.tagline') }}
            </span>
          </div>
        </NuxtLink>

        <!-- Quick Search Bar (Desktop) -->
        <div class="mx-8 hidden max-w-lg flex-1 lg:block">
          <div class="group relative">
            <Icon
              name="heroicons:magnifying-glass"
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-base-content/40 transition-colors duration-200 group-focus-within:text-primary"
              aria-hidden="true"
            />
            <input
              v-model="searchQuery"
              type="search"
              :placeholder="t('common.labels.searchPlaceholder')"
              class="input input-bordered w-full rounded-xl bg-base-200/50 py-2.5 pl-10 pr-16 text-sm transition-all duration-200 focus:border-primary focus:bg-base-100 focus:ring-2 focus:ring-primary/20"
              :aria-label="t('common.actions.search')"
              @keyup.enter="performSearch"
            />
            <div
              class="absolute right-3 top-1/2 hidden -translate-y-1/2 text-xs text-gray-400 sm:block"
            >
              <kbd
                class="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                ⏎
              </kbd>
            </div>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden items-center gap-1 lg:flex xl:gap-2">
          <!-- Primary Navigation -->
          <div class="flex items-center gap-1">
            <NuxtLink
              to="/"
              class="nav-button"
              :class="{ 'nav-button-active': route.path === '/' }"
              aria-label="Navigation Home"
              data-testid="nav-home-link"
            >
              <Icon name="heroicons:home" class="h-5 w-5" />
              <span class="hidden xl:inline">{{ t('common.navigation.home') }}</span>
            </NuxtLink>

            <NuxtLink
              to="/search"
              class="nav-button"
              :class="{ 'nav-button-active': route.path === '/search' }"
              :aria-label="t('common.navigation.search')"
            >
              <Icon name="heroicons:funnel" class="h-5 w-5" />
              <span class="hidden xl:inline">{{ t('common.navigation.search') }}</span>
            </NuxtLink>

            <NuxtLink
              to="/compare"
              class="nav-button"
              :class="{ 'nav-button-active': route.path === '/compare' }"
              :aria-label="t('common.navigation.compare')"
            >
              <Icon name="heroicons:scale" class="h-5 w-5" />
              <span class="hidden xl:inline">{{ t('common.navigation.compare') }}</span>
            </NuxtLink>
          </div>

          <!-- Secondary Navigation (More Tools) -->
          <div class="flex items-center gap-1 border-l border-base-300 pl-2">
            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-sm nav-button">
                <span class="hidden xl:inline">{{ t('common.navigation.tools') }}</span>
                <Icon name="heroicons:chevron-down" class="ml-1 h-4 w-4" />
              </label>
              <ul
                tabindex="0"
                class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
              >
                <li v-for="item in secondaryNavItems" :key="item.label">
                  <NuxtLink :to="item.to" class="nav-button">
                    <Icon :name="item.icon" class="h-5 w-5" />
                    {{ item.label }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>

          <!-- User Actions -->
          <div class="ml-2 flex items-center gap-2 border-l border-base-300 pl-3">
            <NotificationDropdown />
            <LanguageSwitcher />
            <button
              class="btn btn-ghost btn-sm nav-button"
              :aria-label="t('common.navigation.settings')"
              @click="openPreferences"
            >
              <Icon name="heroicons:cog-6-tooth" class="h-5 w-5" />
            </button>
            <ThemeToggle />
          </div>
        </div>

        <!-- Mobile Controls -->
        <div class="flex items-center gap-2 lg:hidden">
          <!-- Mobile Search Toggle -->
          <DButton
            variant="ghost"
            icon="i-heroicons-magnifying-glass"
            class="nav-button"
            :aria-label="mobileSearchOpen ? t('common.actions.close') : t('common.actions.search')"
            @click="toggleMobileSearch"
          />

          <!-- Notifications (Mobile) -->
          <NotificationDropdown />

          <!-- Language Switcher (Mobile) -->
          <LanguageSwitcher />

          <!-- Theme Toggle (Mobile) -->
          <ThemeToggle />

          <!-- Mobile Menu Toggle -->
          <DButton
            variant="ghost"
            icon="i-heroicons-bars-3"
            class="nav-button"
            :aria-label="
              mobileMenuOpen
                ? t('common.actions.closeMobileMenu')
                : t('common.actions.openMobileMenu')
            "
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
            @click="toggleMobileMenu"
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
            <Icon
              name="heroicons:magnifying-glass"
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-base-content/40"
              aria-hidden="true"
            />
            <input
              ref="mobileSearchInput"
              v-model="searchQuery"
              type="search"
              :placeholder="t('common.labels.searchPlaceholder')"
              class="input input-bordered w-full rounded-lg bg-base-200 py-3 pl-10 pr-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20"
              :aria-label="t('common.actions.search')"
              @keyup.enter="performSearch"
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
          <div class="mb-4 border-b border-base-300 pb-4">
            <div class="flex items-center gap-3 px-2">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-600"
              >
                <Icon name="heroicons:user" class="h-5 w-5 text-white" />
              </div>
              <div>
                <div class="font-medium text-base-content">MATLAB Analytics</div>
                <div class="text-sm text-base-content/60">Deep Learning Platform</div>
              </div>
            </div>
          </div>

          <!-- Primary Navigation -->
          <div class="mb-6 space-y-1">
            <h3 class="px-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">
              {{ t('common.navigation.main') }}
            </h3>
            <NuxtLink
              v-for="item in primaryNavItems"
              :key="item.to"
              :to="item.to"
              class="btn btn-ghost btn-block justify-start mobile-nav-item"
              role="menuitem"
              @click="closeMobileMenu"
            >
              <Icon :name="item.icon" class="h-5 w-5" />
              {{ item.label }}
            </NuxtLink>
          </div>

          <!-- Secondary Navigation -->
          <div class="mb-6 space-y-1">
            <h3 class="px-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">
              {{ t('common.navigation.toolsAndFeatures') }}
            </h3>
            <NuxtLink
              v-for="item in secondaryNavItems"
              :key="item.label"
              :to="item.to"
              class="btn btn-ghost btn-block justify-start mobile-nav-item"
              role="menuitem"
              @click="closeMobileMenu"
            >
              <Icon :name="item.icon" class="h-5 w-5" />
              {{ item.label }}
            </NuxtLink>
          </div>

          <!-- Quick Actions -->
          <div class="mb-4 space-y-1">
            <h3 class="px-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">
              {{ t('common.navigation.quickActions') }}
            </h3>
            <button
              class="btn btn-ghost btn-block justify-start mobile-nav-item"
              role="menuitem"
              @click="openPreferences"
            >
              <Icon name="heroicons:cog-6-tooth" class="h-5 w-5" />
              {{ t('common.navigation.settings') }}
            </button>
            <button
              class="btn btn-ghost btn-block justify-start mobile-nav-item"
              role="menuitem"
              @click="openHelp"
            >
              <Icon name="heroicons:question-mark-circle" class="h-5 w-5" />
              {{ t('common.navigation.help') }}
            </button>
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

// Get i18n composable - ensure it's always available
const { t } = useI18n();

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

// Computed navigation items with translations
const primaryNavItems = computed(() => [
  { label: t('common.navigation.home'), to: '/', icon: 'i-heroicons-home' },
  { label: t('common.navigation.search'), to: '/search', icon: 'i-heroicons-funnel' },
  { label: t('common.navigation.compare'), to: '/compare', icon: 'i-heroicons-scale' },
  { label: t('common.navigation.aiDemo'), to: '/ai-demo', icon: 'i-heroicons-sparkles' },
]);

const secondaryNavItems = computed(() => [
  {
    label: t('common.navigation.priceFinder'),
    to: '/recommendations',
    icon: 'heroicons:currency-dollar',
    click: () => navigateTo('/recommendations'),
  },
  {
    label: 'Integration Status',
    to: '/integration-status',
    icon: 'heroicons:chart-bar-square',
    click: () => navigateTo('/integration-status'),
  },
  {
    label: t('common.navigation.advancedModels'),
    to: '/advanced',
    icon: 'heroicons:cpu-chip',
    click: () => navigateTo('/advanced'),
  },
  {
    label: t('common.navigation.mlComparison'),
    to: '/ml-comparison',
    icon: 'heroicons:beaker',
    click: () => navigateTo('/ml-comparison'),
  },
  {
    label: t('common.navigation.abTesting'),
    to: '/ab-testing',
    icon: 'heroicons:chart-bar',
    click: () => navigateTo('/ab-testing'),
  },
  {
    label: 'Style Guide',
    to: '/style-guide',
    icon: 'heroicons:paint-brush',
    click: () => navigateTo('/style-guide'),
  },
  {
    label: t('common.navigation.modelShowcase'),
    to: '/model-showcase',
    icon: 'heroicons:trophy',
    click: () => navigateTo('/model-showcase'),
  },
  {
    label: t('common.navigation.apiDocs'),
    to: '/api-docs',
    icon: 'heroicons:document-text',
    click: () => navigateTo('/api-docs'),
  },
  {
    label: t('common.navigation.dataMining'),
    to: '/datamine',
    icon: 'heroicons:magnifying-glass',
    click: () => navigateTo('/datamine'),
  },
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
  try {
    const logger = useSentryLogger?.();
    if (logger && typeof logger.logUserAction === 'function') {
      logger.logUserAction('open_help', undefined, { component: 'EnhancedNavigation' });
    }
  } catch {
    // Silently handle if logger is not available
  }
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

// Watch for locale changes to update navigation labels
try {
  const i18n = useI18n();
  if (i18n && i18n.locale) {
    watch(
      () => i18n.locale.value,
      () => {
        // Navigation items will automatically update via computed properties
      }
    );
  }
} catch {
  // i18n might not be available yet
}

// Nuxt 4: Use unified UI composable (auto-imported)
// Watch for locale changes to update navigation labels
try {
  const { currentLocale } = useUI();
  watch(
    () => currentLocale.value,
    () => {
      // Navigation items will automatically update via computed properties
    }
  );
} catch {
  // UI composable might not be available yet
}

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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
  pointer-events: auto !important;
  z-index: 10;
  user-select: none;
  -webkit-user-select: none;
  text-decoration: none;
  color: inherit;
  background: transparent;
  border: none;
}

.nav-button:hover {
  background-color: hsl(var(--b2));
}

.nav-button:focus {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(147, 51, 234, 0.5),
    0 0 0 4px rgba(147, 51, 234, 0.2);
}

.nav-button-active {
  background-color: hsl(var(--p) / 0.2);
  color: hsl(var(--p));
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
  cursor: pointer;
  pointer-events: auto !important;
  z-index: 10;
  user-select: none;
  -webkit-user-select: none;
}

.mobile-nav-item:hover {
  background-color: hsl(var(--b2));
}

/* Search input focus styles */
input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}

/* Smooth transitions - only for navigation elements */
.nav-button,
.mobile-nav-item,
input[type='search'] {
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
