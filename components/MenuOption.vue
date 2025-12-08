<template>
  <button
    :class="[
      'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
      selected === title
        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
    ]"
    @click="$emit('select', title)"
  >
    <component :is="icon" class="h-5 w-5 flex-shrink-0" />
    <span v-if="open" class="flex-1 truncate">{{ title }}</span>
    <span
      v-if="open && notifs"
      class="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white"
    >
      {{ notifs }}
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon: any;
  title: string;
  selected: string;
  open: boolean;
  notifs?: number | null;
}

defineProps<Props>();
defineEmits<{
  select: [title: string];
}>();
</script>
