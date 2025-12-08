<template>
  <div class="mb-8 flex items-center justify-between px-3 py-4">
    <div class="flex items-center gap-3">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600"
      >
        <span class="text-sm font-bold text-white">M</span>
      </div>
      <div v-if="open" class="transition-opacity duration-200">
        <h1 class="text-lg font-bold text-gray-900 dark:text-white">MATLAB</h1>
        <p class="text-xs text-gray-500 dark:text-gray-400">Analytics</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  open: boolean;
}

defineProps<Props>();
</script>
