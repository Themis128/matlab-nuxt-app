<template>
  <button
    class="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-colors hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-300"
    @click="$emit('toggle')"
  >
    <ChevronLeftIcon v-if="open" class="h-4 w-4" />
    <ChevronRightIcon v-else class="h-4 w-4" />
  </button>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

interface Props {
  open: boolean;
}

defineProps<Props>();
defineEmits<{
  toggle: [];
}>();
</script>
