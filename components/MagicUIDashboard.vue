<template>
  <div class="flex min-h-screen w-full" :class="isDark ? 'dark' : ''">
    <div class="flex w-full bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <DashboardSidebar
        :is-open="sidebarOpen"
        :selected="selectedMenuItem"
        @toggle="toggleSidebar"
        @select="selectMenuItem"
      />

      <DashboardContent :is-dark="isDark" :toggle-theme="toggleTheme" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Reactive state
const isDark = ref(false);
const sidebarOpen = ref(true);
const selectedMenuItem = ref('Dashboard');

// Methods
const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const selectMenuItem = (item: string) => {
  selectedMenuItem.value = item;
};
</script>

<style scoped>
/* Custom styles for the dashboard component */
</style>
