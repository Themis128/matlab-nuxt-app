<template>
  <nav
    class="sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out"
    :class="[
      open ? 'w-64' : 'w-16',
      'border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900',
    ]"
  >
    <!-- Title Section -->
    <TitleSection :open="open" />

    <!-- Navigation Menu -->
    <div class="mb-8 space-y-1">
      <MenuOption
        v-for="menuItem in menuItems"
        :key="menuItem.title"
        :icon="menuItem.icon"
        :title="menuItem.title"
        :selected="selected"
        :open="open"
        :notifs="menuItem.notifs"
        @select="$emit('select', $event)"
      />
    </div>

    <!-- Bottom Section (Account) -->
    <div v-if="open" class="space-y-1 border-t border-gray-200 pt-4 dark:border-gray-800">
      <div
        class="px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        Account
      </div>
      <MenuOption
        v-for="accountItem in accountItems"
        :key="accountItem.title"
        :icon="accountItem.icon"
        :title="accountItem.title"
        :selected="selected"
        :open="open"
        @select="$emit('select', $event)"
      />
    </div>

    <!-- Toggle Button -->
    <ToggleClose :open="open" @toggle="$emit('toggle')" />
  </nav>
</template>

<script setup lang="ts">
import {
  ChartBarIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  ShoppingCartIcon,
  TagIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline';
import { computed } from 'vue';

interface Props {
  isOpen: boolean;
  selected: string;
}

const props = defineProps<Props>();
// const emit = defineEmits<Emits>(); // Removed unused emit - events are handled in template

// Computed property for open state
const open = computed(() => props.isOpen);

// Menu items data
const menuItems = [
  { title: 'Dashboard', icon: HomeIcon, notifs: null },
  { title: 'Sales', icon: CurrencyDollarIcon, notifs: 3 },
  { title: 'View Site', icon: ComputerDesktopIcon, notifs: null },
  { title: 'Products', icon: ShoppingCartIcon, notifs: null },
  { title: 'Tags', icon: TagIcon, notifs: null },
  { title: 'Analytics', icon: ChartBarIcon, notifs: null },
  { title: 'Members', icon: UsersIcon, notifs: 12 },
];

const accountItems = [
  { title: 'Settings', icon: Cog6ToothIcon },
  { title: 'Help & Support', icon: QuestionMarkCircleIcon },
];

// Methods - removed unused handleSelect and handleToggle
</script>

<style scoped>
/* Additional styles for the sidebar component */
</style>
