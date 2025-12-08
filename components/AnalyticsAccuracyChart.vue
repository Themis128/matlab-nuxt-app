<template>
  <ChartWrapper
    title="Model Accuracy Trends"
    icon="i-heroicons-chart-bar"
    :loading="loading"
    :error="error"
    chart-type="custom"
    height="350"
  >
    <template #header-actions>
      <div class="flex items-center gap-2">
        <div class="h-3 w-3 rounded-full bg-emerald-500" />
        <span class="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
      </div>
    </template>

    <!-- Enhanced Line Chart -->
    <div class="relative h-[250px] w-full">
      <svg class="h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
        <!-- Grid lines -->
        <defs>
          <pattern id="grid" width="40" height="25" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 25"
              fill="none"
              stroke="currentColor"
              stroke-width="0.5"
              class="text-gray-200 dark:text-gray-700"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Y-axis labels -->
        <g class="y-axis-labels">
          <text x="5" y="15" class="fill-gray-500 text-xs dark:fill-gray-400">100%</text>
          <text x="5" y="65" class="fill-gray-500 text-xs dark:fill-gray-400">75%</text>
          <text x="5" y="115" class="fill-gray-500 text-xs dark:fill-gray-400">50%</text>
          <text x="5" y="165" class="fill-gray-500 text-xs dark:fill-gray-400">25%</text>
          <text x="5" y="195" class="fill-gray-500 text-xs dark:fill-gray-400">0%</text>
        </g>

        <!-- X-axis labels -->
        <g class="x-axis-labels">
          <text
            v-for="(label, index) in labels"
            :key="index"
            :x="getXPosition(index)"
            y="210"
            text-anchor="middle"
            class="fill-gray-500 text-xs dark:fill-gray-400"
          >
            {{ label }}
          </text>
        </g>

        <!-- Line path -->
        <path :d="linePath" fill="none" stroke="#10b981" stroke-width="3" class="drop-shadow-sm" />

        <!-- Data points with hover effects -->
        <g class="data-points">
          <circle
            v-for="(point, index) in dataPoints"
            :key="index"
            :cx="point.x"
            :cy="point.y"
            r="6"
            fill="#10b981"
            stroke="white"
            stroke-width="2"
            class="hover:r-8 cursor-pointer transition-all duration-200"
            @mouseenter="showTooltip(index)"
            @mouseleave="hideTooltip"
          />
        </g>

        <!-- Area under line -->
        <path :d="areaPath" fill="url(#lineGradient)" opacity="0.3" />

        <!-- Gradient definition -->
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="hoveredPoint !== null"
        class="pointer-events-none absolute z-10 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg transition-all duration-200"
        :style="{
          left: hoveredPoint.x + 'px',
          top: hoveredPoint.y - 40 + 'px',
          transform: 'translateX(-50%)',
        }"
      >
        {{ hoveredPoint.label }}: {{ hoveredPoint.value }}%
        <div
          class="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
        />
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-600">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Average</p>
          <p class="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {{ averageAccuracy.toFixed(1) }}%
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Best</p>
          <p class="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {{ maxAccuracy.toFixed(1) }}%
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Total Models</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ accuracyTrends.length }}
          </p>
        </div>
      </div>
    </div>
  </ChartWrapper>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const { t } = useI18n();

// Props: pass analytics data from parent
const props = withDefaults(
  defineProps<{
    accuracyTrends?: number[];
    labels?: string[];
    loading?: boolean;
    error?: string | null;
  }>(),
  {
    accuracyTrends: undefined,
    labels: undefined,
    loading: false,
    error: null,
  }
);

// Reactive state
const hoveredPoint = ref<{
  x: number;
  y: number;
  label?: string;
  value: number;
} | null>(null);

// Chart dimensions
const chartWidth = 400;
const chartHeight = 200;
const padding = { top: 20, right: 20, bottom: 40, left: 40 };

// Computed data
const accuracyTrends = computed(() => props.accuracyTrends || [98.24, 95.16, 94.77, 65.22]);
const labels = computed(
  () =>
    props.labels || [
      t('analytics.labels.price'),
      t('analytics.labels.ram'),
      t('analytics.labels.battery'),
      t('analytics.labels.brand'),
    ]
);

const maxAccuracy = computed(() => Math.max(...accuracyTrends.value));
// const minAccuracy = computed(() => Math.min(...accuracyTrends.value)); // Removed unused
const averageAccuracy = computed(
  () => accuracyTrends.value.reduce((sum, val) => sum + val, 0) / accuracyTrends.value.length
);

// Helper functions
const getXPosition = (index: number): number => {
  if (accuracyTrends.value.length === 1) return chartWidth / 2;
  const step = (chartWidth - padding.left - padding.right) / (accuracyTrends.value.length - 1);
  return padding.left + index * step;
};

const getYPosition = (value: number): number => {
  const maxValue = 100;
  const minValue = 0;
  const range = maxValue - minValue;
  const normalizedValue = (value - minValue) / range;
  return padding.top + (chartHeight - padding.top - padding.bottom) * (1 - normalizedValue);
};

// Data points for interactive elements
const dataPoints = computed(() => {
  return accuracyTrends.value.map((value, index) => ({
    x: getXPosition(index),
    y: getYPosition(value),
    label: labels.value[index] ?? '',
    value,
  }));
});

// SVG path calculations
const linePath = computed(() => {
  if (!dataPoints.value || dataPoints.value.length === 0) return '';

  const first = dataPoints.value[0];
  if (!first) return '';

  let path = `M ${first.x} ${first.y}`;
  for (let i = 1; i < dataPoints.value.length; i++) {
    const p = dataPoints.value[i];
    if (!p) continue;
    path += ` L ${p.x} ${p.y}`;
  }
  return path;
});

const areaPath = computed(() => {
  if (!dataPoints.value || dataPoints.value.length === 0) return '';

  const first = dataPoints.value[0];
  const last = dataPoints.value[dataPoints.value.length - 1];
  if (!first || !last) return '';

  let path = `M ${first.x} ${chartHeight - padding.bottom}`;
  path += ` L ${first.x} ${first.y}`;

  for (let i = 1; i < dataPoints.value.length; i++) {
    const p = dataPoints.value[i];
    if (!p) continue;
    path += ` L ${p.x} ${p.y}`;
  }

  path += ` L ${last.x} ${chartHeight - padding.bottom} Z`;
  return path;
});

// Methods
const showTooltip = (index: number) => {
  const point = dataPoints.value[index];
  if (!point) return;
  hoveredPoint.value = {
    x: point.x,
    y: point.y,
    label: point.label,
    value: point.value,
  };
};

const hideTooltip = () => {
  hoveredPoint.value = null;
};

// Watchers to ensure reactivity
watch(
  () => props.accuracyTrends,
  (_newVal) => {
    // Data is reactive through computed properties
  }
);

watch(
  () => props.labels,
  (_newVal) => {
    // Labels are reactive through computed properties
  }
);
</script>

<style scoped>
.data-points circle:hover {
  filter: brightness(1.2);
  transform: scale(1.1);
}

svg {
  overflow: visible;
}
</style>
