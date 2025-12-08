<template>
  <div class="min-h-screen bg-base-200">
    <!-- Top Navigation Bar -->
    <nav class="navbar fixed left-0 right-0 top-0 z-50 border-b border-base-300 bg-base-100">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo and Title -->
          <div class="flex items-center gap-3">
            <button
class="btn btn-ghost btn-square lg:hidden" @click="sidebarOpen = !sidebarOpen"
>
              <Icon name="heroicons:bars-3"
class="h-6 w-6" />
            </button>
            <div class="flex items-center gap-2">
              <Icon name="heroicons:cpu-chip" class="h-8 w-8 text-primary" />
              <div>
                <div class="text-lg font-bold text-base-content">ML Analytics</div>
                <div class="text-xs opacity-70">Dashboard</div>
              </div>
            </div>
          </div>

          <!-- Right Side Actions -->
          <div class="flex items-center gap-4">
            <!-- Search -->
            <div class="form-control hidden w-64 md:block">
              <div class="input-group">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search devices, models..."
                  class="input input-bordered w-full"
                />
                <button class="btn btn-square">
                  <Icon name="heroicons:magnifying-glass"
class="h-5 w-5" />
                </button>
              </div>
            </div>
            <!-- Notifications -->
            <button class="btn btn-ghost btn-circle">
              <Icon name="heroicons:bell"
class="h-5 w-5" />
            </button>
            <!-- Theme Toggle -->
            <ThemeToggle />
            <!-- User Menu -->
            <div class="dropdown dropdown-end">
              <label tabindex="0"
class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                  <img
src="/avatar.png" alt="User" />
                </div>
              </label>
              <ul
                tabindex="0"
                class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
              >
                <li v-for="item in userMenuItems[0]"
:key="item.label">
                  <a @click="item.click">
                    <Icon :name="item.icon"
class="h-4 w-4" />
                    {{ item.label }}
                  </a>
                </li>
                <li><div class="divider my-1" /></li>
                <li v-for="item in userMenuItems[1]"
:key="item.label">
                  <a @click="item.click">
                    <Icon :name="item.icon"
class="h-4 w-4" />
                    {{ item.label }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex pt-16">
      <!-- Sidebar -->
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-base-300 bg-base-100 transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ]"
      >
        <div class="flex h-full flex-col pt-16 lg:pt-0">
          <!-- Navigation Menu -->
          <nav class="flex-1 space-y-1 overflow-y-auto px-2 py-4">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="menu-item flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              :class="isActive(item.href) ? 'bg-primary text-primary-content' : 'hover:bg-base-200'"
              @click="sidebarOpen = false"
            >
              <Icon :name="item.icon"
class="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{{ item.name }}</span>
              <span v-if="item.badge" class="badge badge-primary badge-sm ml-auto">
                {{ item.badge }}
              </span>
            </NuxtLink>
          </nav>

          <!-- Quick Stats Footer -->
          <div class="border-t border-base-300 p-4">
            <div class="mb-2 text-xs opacity-70">Quick Stats</div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="opacity-70">Active Devices</span>
                <span class="font-semibold text-base-content">2,431</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="opacity-70">Models</span>
                <span class="font-semibold text-base-content">24</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="opacity-70">Accuracy</span>
                <span class="font-semibold text-success">94.7%</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-30 bg-base-content/50 lg:hidden"
        @click="sidebarOpen = false"
      />

      <!-- Main Content Area -->
      <main class="flex-1 lg:ml-64">
        <div class="py-6">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <!-- Page Header Slot -->
            <slot name="header">
              <div class="mb-6">
                <h1 class="text-3xl font-bold text-base-content">
                  {{ pageTitle || 'Dashboard' }}
                </h1>
                <p v-if="pageDescription"
class="mt-2 opacity-70">
                  {{ pageDescription }}
                </p>
              </div>
            </slot>

            <!-- Page Content -->
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const sidebarOpen = ref(false);
const searchQuery = ref('');

// Navigation items
const navigation = [
  { name: 'Overview', href: '/', icon: 'heroicons:home' },
  { name: 'Device Browser', href: '/search', icon: 'heroicons:device-phone-mobile' },
  { name: 'Predictions', href: '/ai-demo', icon: 'heroicons:sparkles' },
  { name: 'Analytics', href: '/datamine', icon: 'heroicons:chart-bar' },
  { name: 'Model Comparison', href: '/ml-comparison', icon: 'heroicons:scale' },
  {
    name: 'Query Assistant',
    href: '/query',
    icon: 'heroicons:chat-bubble-left-right',
    badge: 'New',
  },
  { name: 'A/B Testing', href: '/ab-testing', icon: 'heroicons:beaker' },
  { name: 'API Docs', href: '/api-docs', icon: 'heroicons:document-text' },
];

// User menu items
const userMenuItems = [
  [
    {
      label: 'Profile',
      icon: 'heroicons:user-circle',
      click: () => navigateTo('/profile'),
    },
    {
      label: 'Settings',
      icon: 'heroicons:cog-6-tooth',
      click: () => navigateTo('/settings'),
    },
  ],
  [
    {
      label: 'Sign out',
      icon: 'heroicons:arrow-right-on-rectangle',
      click: () => console.log('Sign out clicked'),
    },
  ],
];

// Check if route is active
const isActive = (href: string) => {
  if (href === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(href);
};

// Get page title from route meta or use default
const pageTitle = computed(() => {
  return (
    (route.meta.title as string) ||
    route.name
      ?.toString()
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  );
});

const pageDescription = computed(() => {
  return (route.meta.description as string) || null;
});

// Close sidebar on route change (mobile)
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false;
  }
);
</script>

<style scoped>
/* Smooth transitions */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
