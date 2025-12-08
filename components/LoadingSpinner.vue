<template>
  <div :class="containerClasses">
    <div v-if="type === 'spinner'" :class="spinnerClasses">
      <svg class="animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>

    <div v-else-if="type === 'dots'" class="flex space-x-1">
      <div
        v-for="i in 3"
        :key="i"
        :class="[dotClasses, `animate-bounce`]"
        :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
      />
    </div>

    <div v-else-if="type === 'pulse'" :class="pulseClasses" />

    <div v-else-if="type === 'skeleton'" class="space-y-3">
      <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div class="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div class="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>

    <div v-else-if="type === 'bars'" class="flex items-end space-x-1">
      <div
        v-for="i in 4"
        :key="i"
        :class="[barClasses]"
        :style="{
          animationDelay: `${(i - 1) * 0.1}s`,
          height: `${Math.random() * 20 + 10}px`,
        }"
      />
    </div>

    <!-- Loading Text -->
    <p v-if="showText" :class="textClasses">
      {{ loadingText }}
    </p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

interface Props {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'bars';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  text?: string;
  showText?: boolean;
  centered?: boolean;
  fullScreen?: boolean;
  overlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'md',
  color: 'blue',
  text: undefined,
  showText: false,
  centered: false,
  fullScreen: false,
  overlay: false,
});

const loadingText = computed(() => props.text || t('common.labels.loading'));

// Size mappings
const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const dotSizes = {
  xs: 'w-1 h-1',
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

const barSizes = {
  xs: 'w-1',
  sm: 'w-1.5',
  md: 'w-2',
  lg: 'w-3',
  xl: 'w-4',
};

// Color mappings
const colorClasses = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  red: 'text-red-600 dark:text-red-400',
  yellow: 'text-yellow-600 dark:text-yellow-400',
  purple: 'text-purple-600 dark:text-purple-400',
  gray: 'text-gray-600 dark:text-gray-400',
};

const dotColors = {
  blue: 'bg-blue-600 dark:bg-blue-400',
  green: 'bg-green-600 dark:bg-green-400',
  red: 'bg-red-600 dark:bg-red-400',
  yellow: 'bg-yellow-600 dark:bg-yellow-400',
  purple: 'bg-purple-600 dark:bg-purple-400',
  gray: 'bg-gray-600 dark:bg-gray-400',
};

// Computed classes
const containerClasses = computed(() => [
  'flex flex-col items-center justify-center gap-4 animate-fade-in',
  {
    'fixed inset-0 z-50': props.fullScreen,
    'absolute inset-0': props.overlay && !props.fullScreen,
    'min-h-screen': props.centered && !props.fullScreen && !props.overlay,
    'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg': props.overlay || props.fullScreen,
  },
]);

const spinnerClasses = computed(() => [sizeClasses[props.size], colorClasses[props.color]]);

const dotClasses = computed(() => [dotSizes[props.size], dotColors[props.color], 'rounded-full']);

const pulseClasses = computed(() => [
  sizeClasses[props.size],
  dotColors[props.color],
  'rounded-full animate-pulse',
]);

const barClasses = computed(() => [
  barSizes[props.size],
  dotColors[props.color],
  'animate-pulse rounded-sm',
]);

const textClasses = computed(() => [
  'mt-3 text-sm font-semibold tracking-wide animate-pulse',
  colorClasses[props.color],
]);
</script>

<style scoped>
/* Enhanced animations */
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out both;
}

/* Enhanced pulse animation for bars */
@keyframes barPulse {
  0%,
  100% {
    transform: scaleY(0.4);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.animate-pulse {
  animation: barPulse 1s infinite ease-in-out;
}

/* Fade in animation for container */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Enhanced spinner with gradient */
.spinner-gradient {
  background: conic-gradient(from 0deg, transparent, currentColor);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
