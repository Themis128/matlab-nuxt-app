<template>
  <div class="flex-1 overflow-auto bg-gray-50 p-6 dark:bg-gray-950">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">Welcome back to your dashboard</p>
      </div>
      <div class="flex items-center gap-4">
        <button
          class="relative rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <BellIcon class="h-5 w-5" />
          <span class="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500"></span>
        </button>
        <button
          @click="toggleTheme"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <component :is="isDark ? SunIcon : MoonIcon" class="h-4 w-4" />
        </button>
        <button
          class="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <UserIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div
        class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="mb-4 flex items-center justify-between">
          <div class="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
            <CurrencyDollarIcon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <TrendingUpIcon class="h-4 w-4 text-green-500" />
        </div>
        <h3 class="mb-1 font-medium text-gray-600 dark:text-gray-400">Total Sales</h3>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">$24,567</p>
        <p class="mt-1 text-sm text-green-600 dark:text-green-400">+12% from last month</p>
      </div>

      <div
        class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="mb-4 flex items-center justify-between">
          <div class="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
            <UsersIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <TrendingUpIcon class="h-4 w-4 text-green-500" />
        </div>
        <h3 class="mb-1 font-medium text-gray-600 dark:text-gray-400">Active Users</h3>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">1,234</p>
        <p class="mt-1 text-sm text-green-600 dark:text-green-400">+5% from last week</p>
      </div>

      <div
        class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="mb-4 flex items-center justify-between">
          <div class="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
            <ShoppingCartIcon class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <TrendingUpIcon class="h-4 w-4 text-green-500" />
        </div>
        <h3 class="mb-1 font-medium text-gray-600 dark:text-gray-400">Orders</h3>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">456</p>
        <p class="mt-1 text-sm text-green-600 dark:text-green-400">+8% from yesterday</p>
      </div>

      <div
        class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="mb-4 flex items-center justify-between">
          <div class="rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
            <CubeIcon class="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <TrendingUpIcon class="h-4 w-4 text-green-500" />
        </div>
        <h3 class="mb-1 font-medium text-gray-600 dark:text-gray-400">Products</h3>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">89</p>
        <p class="mt-1 text-sm text-green-600 dark:text-green-400">+3 new this week</p>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Recent Activity -->
      <div class="lg:col-span-2">
        <div
          class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
            <button
              class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all
            </button>
          </div>
          <div class="space-y-4">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="flex cursor-pointer items-center space-x-4 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div :class="getActivityIconClass(activity.color)">
                <component :is="activity.icon" class="h-4 w-4" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ activity.title }}
                </p>
                <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                  {{ activity.desc }}
                </p>
              </div>
              <div class="text-xs text-gray-400 dark:text-gray-500">
                {{ activity.time }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="space-y-6">
        <div
          class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Stats</h3>
          <div class="space-y-4">
            <div v-for="stat in quickStats" :key="stat.label">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ stat.label }}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{
                  stat.value
                }}</span>
              </div>
              <div class="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  :class="`h-2 rounded-full ${stat.color}`"
                  :style="{ width: `${stat.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Top Products</h3>
          <div class="space-y-3">
            <div
              v-for="product in topProducts"
              :key="product.name"
              class="flex items-center justify-between py-2"
            >
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ product.name }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                ${{ product.price }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BanknotesIcon,
  BellIcon,
  ClockIcon,
  CubeIcon,
  CurrencyDollarIcon,
  MoonIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  SunIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline';
import { computed } from 'vue';

interface Props {
  isDark: boolean;
  toggleTheme: () => void;
}

const props = defineProps<Props>();

// Computed properties
const isDark = computed(() => props.isDark);
const toggleTheme = computed(() => props.toggleTheme);

// Mock data
const activities = [
  {
    id: 1,
    icon: BanknotesIcon,
    title: 'New sale recorded',
    desc: 'Order #1234 completed',
    time: '2 min ago',
    color: 'green',
  },
  {
    id: 2,
    icon: UsersIcon,
    title: 'New user registered',
    desc: 'john.doe@example.com joined',
    time: '5 min ago',
    color: 'blue',
  },
  {
    id: 3,
    icon: CubeIcon,
    title: 'Product updated',
    desc: 'iPhone 15 Pro stock updated',
    time: '10 min ago',
    color: 'purple',
  },
  {
    id: 4,
    icon: ClockIcon,
    title: 'System maintenance',
    desc: 'Scheduled backup completed',
    time: '1 hour ago',
    color: 'orange',
  },
  {
    id: 5,
    icon: ShieldCheckIcon,
    title: 'New notification',
    desc: 'Marketing campaign results',
    time: '2 hours ago',
    color: 'red',
  },
];

const quickStats = [
  { label: 'Conversion Rate', value: '3.2%', percentage: 32, color: 'bg-blue-500' },
  { label: 'Bounce Rate', value: '45%', percentage: 45, color: 'bg-orange-500' },
  { label: 'Page Views', value: '8.7k', percentage: 87, color: 'bg-green-500' },
];

const topProducts = [
  { name: 'iPhone 15 Pro', price: '999' },
  { name: 'MacBook Air M2', price: '1,199' },
  { name: 'AirPods Pro', price: '249' },
  { name: 'iPad Air', price: '599' },
];

// Methods
const getActivityIconClass = (color: string) => {
  const baseClasses = 'p-2 rounded-lg';
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };
  return `${baseClasses} ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`;
};
</script>

<style scoped>
/* Additional styles for the dashboard content component */
</style>
