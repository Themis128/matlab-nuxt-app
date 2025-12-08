<template>
  <section :class="['relative overflow-hidden py-20 sm:py-24 lg:py-32', backgroundClass]">
    <!-- Background Pattern -->
    <div class="bg-grid-pattern absolute inset-0 opacity-5 dark:opacity-10" />
    <div :class="['absolute inset-0', gradientClass]" />

    <div class="container relative mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12 text-center">
        <div
          v-if="badge"
          class="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300"
        >
          <Icon v-if="badgeIcon" :name="badgeIcon" class="h-4 w-4" />
          {{ badge }}
        </div>

        <h1
          :class="[
            'mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl lg:text-7xl dark:from-white dark:to-gray-300',
            titleClass,
          ]"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </h1>

        <p v-if="description" class="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          {{ description }}
        </p>
        <p v-else class="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          <slot name="description" />
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
  variant?: 'default' | 'purple' | 'blue' | 'green';
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  description: undefined,
  badge: undefined,
  badgeIcon: undefined,
  variant: 'default',
});

const backgroundClass =
  'bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800';

const gradientMap = {
  default: 'bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10',
  purple: 'bg-gradient-to-br from-purple-500/10 via-purple-500/10 to-purple-500/10',
  blue: 'bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-blue-500/10',
  green: 'bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/10',
};

const gradientClass = gradientMap[props.variant];
const titleClass = props.variant === 'default' ? '' : '';
</script>
