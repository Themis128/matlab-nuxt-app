<template>
  <div
    class="w-full h-[350px] p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Yearly Trends: Price, RAM, Battery
      </h3>
      <div class="flex items-center gap-4">
        <!-- Legend -->
        <div class="flex items-center gap-4 text-sm">
          <div v-for="metric in visibleMetrics" :key="metric.name" class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: metric.color }"></div>
            <span class="text-gray-600 dark:text-gray-400">{{ metric.name }}</span>
          </div>
        </div>
        <!-- Target selector -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Filter:</label>
          <select
            v-model="selectedFilter"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="All">All Metrics</option>
            <option value="Price">Price Only</option>
            <option value="RAM">RAM Only</option>
            <option value="Battery">Battery Only</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Enhanced Multi-Line Chart -->
    <div class="relative w-full h-[250px]">
      <svg class="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet">
        <!-- Grid lines -->
        <defs>
          <pattern id="trendsGrid" width="60" height="25" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 25"
              fill="none"
              stroke="currentColor"
              stroke-width="0.5"
              class="text-gray-200 dark:text-gray-700"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#trendsGrid)" />

        <!-- Y-axis labels -->
        <g class="y-axis-labels">
          <text x="5" y="15" class="text-xs fill-gray-500 dark:fill-gray-400">100</text>
          <text x="5" y="65" class="text-xs fill-gray-500 dark:fill-gray-400">75</text>
          <text x="5" y="115" class="text-xs fill-gray-500 dark:fill-gray-400">50</text>
          <text x="5" y="165" class="text-xs fill-gray-500 dark:fill-gray-400">25</text>
          <text x="5" y="195" class="text-xs fill-gray-500 dark:fill-gray-400">0</text>
        </g>

        <!-- X-axis labels -->
        <g class="x-axis-labels">
          <text
            v-for="(year, index) in years"
            :key="index"
            :x="getXPosition(index)"
            y="210"
            text-anchor="middle"
            class="text-xs fill-gray-500 dark:fill-gray-400"
          >
            {{ year }}
          </text>
        </g>

        <!-- Trend Lines -->
        <g class="trend-lines">
          <g v-for="metric in visibleMetrics" :key="metric.name" class="metric-group">
            <!-- Line path -->
            <path
              :d="getLinePath(metric.data)"
              :stroke="metric.color"
              stroke-width="3"
              fill="none"
              class="trend-line transition-all duration-300"
              :class="{ 'opacity-75 hover:opacity-100': visibleMetrics.length > 1 }"
            />

            <!-- Data points -->
            <circle
              v-for="(value, index) in metric.data"
              :key="index"
              :cx="getXPosition(index)"
              :cy="getYPosition(value)"
              r="5"
              :fill="metric.color"
              stroke="white"
              stroke-width="2"
              class="cursor-pointer transition-all duration-200 hover:r-7"
              @mouseenter="showTooltip(index, value, metric.name)"
              @mouseleave="hideTooltip"
            />

            <!-- Area fill for better visualization -->
            <path
              :d="getAreaPath(metric.data)"
              :fill="metric.color"
              opacity="0.1"
              class="area-fill"
            />
          </g>
        </g>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="hoveredIndex !== -1"
        class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none transition-all duration-200"
        :style="{
          left: hoveredX + 'px',
          top: hoveredY - 40 + 'px',
          transform: 'translateX(-50%)',
        }"
      >
        <div class="font-semibold">{{ years[hoveredIndex] ?? '' }}</div>
        <div
          v-for="metric in visibleMetrics"
          :key="metric.name"
          class="flex items-center gap-2 mt-1"
        >
          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: metric.color }"></div>
          <span>{{ metric.name }}: {{ metric.data[hoveredIndex] ?? '-' }}</span>
        </div>
        <div
          class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
        ></div>
      </div>
    </div>

    <!-- Trend Statistics -->
    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <div class="grid grid-cols-4 gap-4 text-center">
        <div v-for="metric in visibleMetrics" :key="metric.name">
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ metric.name }} Trend</p>
          <p class="text-lg font-semibold" :style="{ color: metric.color }">
            {{ getTrendDirection(metric.data) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps<{
  trends?: {
    years: number[];
    avg_price: number[];
    avg_ram: number[];
    avg_battery: number[];
  };
  selectedTarget?: string;
}>();

// Reactive state
const selectedFilter = ref(props.selectedTarget || 'All');
const hoveredPoint = ref<{
  x: number;
  y: number;
  index: number;
} | null>(null);

// Safe helpers for hovered point to avoid direct indexing and undefined access in templates
const hoveredIndex = computed(() => (hoveredPoint.value ? hoveredPoint.value.index : -1));
const hoveredX = computed(() => (hoveredPoint.value ? hoveredPoint.value.x : 0));
const hoveredY = computed(() => (hoveredPoint.value ? hoveredPoint.value.y : 0));

// Chart dimensions
const chartWidth = 600;
const chartHeight = 200;
const padding = { top: 20, right: 30, bottom: 40, left: 40 };

// Default trends data if none provided
const defaultTrends = computed(() => ({
  years: [2019, 2020, 2021, 2022, 2023, 2024],
  avg_price: [450, 520, 580, 650, 720, 780],
  avg_ram: [4, 6, 8, 8, 12, 16],
  avg_battery: [3000, 3200, 3500, 3800, 4000, 4200],
}));

// Use provided trends or default
const trends = computed(() => props.trends || defaultTrends.value);

// All available metrics
const allMetrics = computed(() => [
  { name: 'Price', key: 'avg_price', color: '#6366f1', data: trends.value.avg_price },
  { name: 'RAM', key: 'avg_ram', color: '#10b981', data: trends.value.avg_ram },
  { name: 'Battery', key: 'avg_battery', color: '#f59e42', data: trends.value.avg_battery },
]);

// Filter visible metrics based on selected filter
const visibleMetrics = computed(() => {
  if (selectedFilter.value === 'All') {
    return allMetrics.value;
  }
  return allMetrics.value.filter((metric) => metric.name === selectedFilter.value);
});

const years = computed(() => trends.value.years || []);

// Helper functions
const getXPosition = (index: number): number => {
  if (years.value.length === 1) return chartWidth / 2;
  const step = (chartWidth - padding.left - padding.right) / (years.value.length - 1);
  return padding.left + index * step;
};

const getYPosition = (value: number): number => {
  const maxValue = Math.max(...allMetrics.value.flatMap((m) => m.data));
  const minValue = Math.min(...allMetrics.value.flatMap((m) => m.data));
  const range = maxValue - minValue;
  const normalizedValue = (value - minValue) / range;
  return padding.top + (chartHeight - padding.top - padding.bottom) * (1 - normalizedValue);
};

const getLinePath = (data: number[]): string => {
  if (!data || data.length === 0) return '';

  const firstVal = data[0] ?? 0;
  let path = `M ${getXPosition(0)} ${getYPosition(firstVal)}`;
  for (let i = 1; i < data.length; i++) {
    const val = data[i] ?? 0;
    path += ` L ${getXPosition(i)} ${getYPosition(val)}`;
  }
  return path;
};

const getAreaPath = (data: number[]): string => {
  if (!data || data.length === 0) return '';

  const firstVal = data[0] ?? 0;
  const lastVal = data[data.length - 1] ?? 0;

  let path = `M ${getXPosition(0)} ${chartHeight - padding.bottom}`;
  path += ` L ${getXPosition(0)} ${getYPosition(firstVal)}`;

  for (let i = 1; i < data.length; i++) {
    const val = data[i] ?? 0;
    path += ` L ${getXPosition(i)} ${getYPosition(val)}`;
  }

  path += ` L ${getXPosition(data.length - 1)} ${chartHeight - padding.bottom} Z`;
  return path;
};

// Methods
const showTooltip = (index: number, value: number, metricName: string) => {
  hoveredPoint.value = {
    x: getXPosition(index),
    y: getYPosition(value),
    index,
  };
};

const hideTooltip = () => {
  hoveredPoint.value = null;
};

const getTrendDirection = (data: number[]): string => {
  if (!data || data.length < 2) return 'N/A';
  const first = data[0] ?? 0;
  const last = data[data.length - 1] ?? 0;
  if (first === 0) return 'N/A';
  const change = ((last - first) / first) * 100;

  if (change > 5) return `↗ ${change.toFixed(1)}%`;
  if (change < -5) return `↘ ${change.toFixed(1)}%`;
  return `→ ${change.toFixed(1)}%`;
};

// Watchers
watch(
  () => props.trends,
  (newVal) => {
    // Data is reactive through computed properties
  }
);

watch(
  () => props.selectedTarget,
  (newVal) => {
    if (newVal) {
      selectedFilter.value = newVal;
    }
  }
);

watch(selectedFilter, (newVal) => {
  // Emit change for parent component
  emit('update:selectedTarget', newVal);
});

// Emit events
const emit = defineEmits<{
  'update:selectedTarget': [target: string];
}>();
</script>

<style scoped>
.trend-line {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.metric-group:hover .trend-line {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

circle:hover {
  filter: brightness(1.2);
  transform: scale(1.2);
}

svg {
  overflow: visible;
}

/* Responsive design */
@media (max-width: 768px) {
  .trend-lines {
    transform: scale(0.8);
    transform-origin: left top;
  }
}

@media (max-width: 480px) {
  .trend-lines {
    transform: scale(0.6);
  }
}

/* Accessibility improvements */
.metric-group:focus-within circle {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .trend-line {
    stroke-width: 4px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .trend-line {
    transition: none;
  }

  circle {
    transition: none;
  }
}
</style>
