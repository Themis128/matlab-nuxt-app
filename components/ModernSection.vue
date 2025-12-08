<template>
  <section :class="['relative overflow-hidden py-20', backgroundClass]">
    <!-- Background Pattern -->
    <div class="bg-grid-pattern absolute inset-0 opacity-5 dark:opacity-10" />
    <div v-if="showGradient" :class="['absolute inset-0', gradientClass]" />

    <div class="container relative mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="title || $slots.title || $slots.badge" class="mb-12 text-center">
        <div
          v-if="badge || $slots.badge"
          class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300"
        >
          <Icon v-if="badgeIcon" :name="badgeIcon" class="h-4 w-4" />
          <slot name="badge">
            {{ badge }}
          </slot>
        </div>

        <h2
          v-if="title || $slots.title"
          class="mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-4xl font-extrabold text-transparent dark:from-white dark:to-gray-300"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </h2>

        <p
          v-if="description || $slots.description"
          class="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </p>
      </div>

      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  badge?: string;
  badgeIcon?: string;
  variant?: 'default' | 'light' | 'dark';
  showGradient?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  description: undefined,
  badge: undefined,
  badgeIcon: undefined,
  variant: 'default',
  showGradient: true,
});

const backgroundClassMap = {
  default:
    'bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800',
  light: 'bg-white dark:bg-gray-900',
  dark: 'bg-gray-50 dark:bg-gray-900/50',
};

const backgroundClass = backgroundClassMap[props.variant];

const gradientClass = 'bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5';
</script>
