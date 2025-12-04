<template>
  <div
    class="w-full h-[350px] p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Feature Importance</h3>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-amber-500 rounded-full"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Importance</span>
      </div>
    </div>

    <!-- Enhanced Bar Chart -->
    <div class="relative w-full h-[250px]">
      <svg class="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
        <!-- Grid lines -->
        <defs>
          <pattern id="barGrid" width="50" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 50 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              stroke-width="0.5"
              class="text-gray-200 dark:text-gray-700"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#barGrid)" />

        <!-- Y-axis labels -->
        <g class="y-axis-labels">
          <text x="5" y="15" class="text-xs fill-gray-500 dark:fill-gray-400">100%</text>
          <text x="5" y="65" class="text-xs fill-gray-500 dark:fill-gray-400">75%</text>
          <text x="5" y="115" class="text-xs fill-gray-500 dark:fill-gray-400">50%</text>
          <text x="5" y="165" class="text-xs fill-gray-500 dark:fill-gray-400">25%</text>
          <text x="5" y="195" class="text-xs fill-gray-500 dark:fill-gray-400">0%</text>
        </g>

        <!-- Bar Chart Bars -->
        <g class="chart-bars">
          <g
            v-for="(bar, index) in barData"
            :key="index"
            class="bar-group"
            @mouseenter="showBarTooltip(index)"
            @mouseleave="hideBarTooltip"
          >
            <!-- Bar rectangle -->
            <rect
              :x="bar.x"
              :y="bar.y"
              :width="bar.width"
              :height="bar.height"
              fill="#f59e42"
              class="bar-rect transition-all duration-300 hover:fill-amber-600"
              rx="2"
              ry="2"
            />

            <!-- Value label on top of bar -->
            <text
              v-if="bar.height > 20"
              :x="bar.x + bar.width / 2"
              :y="bar.y - 5"
              text-anchor="middle"
              class="text-xs font-semibold fill-gray-700 dark:fill-gray-300"
            >
              {{ (bar.value * 100).toFixed(1) }}%
            </text>

            <!-- Feature name below bar -->
            <text
              :x="bar.x + bar.width / 2"
              y="215"
              text-anchor="middle"
              class="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {{ bar.label }}
            </text>
          </g>
        </g>

        <!-- Interactive hover effect -->
        <rect
          v-if="hoveredBarIndex !== null"
          :x="selectedBar.x - 2"
          y="20"
          :width="selectedBar.width + 4"
          height="160"
          fill="currentColor"
          fill-opacity="0.1"
          class="text-amber-500"
        />
      </svg>

      <!-- Tooltip -->
      <div
        v-if="hoveredBarIndex !== null"
        class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none transition-all duration-200"
        :style="{
          left: selectedBar.x + selectedBar.width / 2 + 'px',
          top: selectedBar.y - 40 + 'px',
          transform: 'translateX(-50%)',
        }"
      >
        {{ selectedBar.label }}: {{ (selectedBar.value * 100).toFixed(1) }}%
        <div
          class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
        ></div>
      </div>
    </div>

    <!-- Feature Statistics -->
    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Top Feature</p>
          <p class="text-lg font-semibold text-amber-600 dark:text-amber-400">
            {{ topFeature.label }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Avg Importance</p>
          <p class="text-lg font-semibold text-amber-600 dark:text-amber-400">
            {{ (averageImportance * 100).toFixed(1) }}%
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Total Features</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ Object.keys(importance).length }}
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
  importance?: Record<string, number>;
}>();

// Reactive state
const hoveredBarIndex = ref<number | null>(null);

// Chart dimensions
const chartWidth = 500;
const chartHeight = 200;
const padding = { top: 20, right: 20, bottom: 40, left: 40 };

// Default importance data if none provided
const defaultImportance = computed(() => ({
  CPU: 0.85,
  RAM: 0.72,
  Storage: 0.65,
  Price: 0.58,
  Brand: 0.45,
}));

// Use provided importance or default
const importance = computed(() => props.importance || defaultImportance.value);

// Computed values
const topFeature = computed(() => {
  const entries = Object.entries(importance.value);
  const maxEntry = entries.reduce((max, current) => (current[1] > max[1] ? current : max));
  return { label: maxEntry[0], value: maxEntry[1] };
});

const averageImportance = computed(() => {
  const values = Object.values(importance.value);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
});

// Bar data calculation
const barData = computed(() => {
  const features = Object.keys(importance.value);
  const values = Object.values(importance.value);

  return features.map((label, index) => {
    const value = values[index] ?? 0;
    const barWidth = (chartWidth - padding.left - padding.right) / features.length - 10;
    const maxHeight = chartHeight - padding.top - padding.bottom;
    const barHeight = value * maxHeight;
    const x =
      padding.left + (index * (chartWidth - padding.left - padding.right)) / features.length + 5;
    const y = padding.top + (maxHeight - barHeight);

    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      value,
      label,
    };
  });
});

// Methods
const showBarTooltip = (index: number) => {
  hoveredBarIndex.value = index;
};

const hideBarTooltip = () => {
  hoveredBarIndex.value = null;
};

// Watchers
watch(
  () => props.importance,
  (newVal) => {
    // Data is reactive through computed properties
  }
);

// Selected bar helper to avoid indexing undefined in templates
// Return a safe bar object to avoid undefined indexing in templates
const selectedBar = computed(() => {
  if (hoveredBarIndex.value === null) {
    return { x: 0, y: 0, width: 0, height: 0, value: 0, label: '' };
  }
  return barData.value[hoveredBarIndex.value] ?? { x: 0, y: 0, width: 0, height: 0, value: 0, label: '' };
});
</script>

<style scoped>
.bar-group {
  cursor: pointer;
}

.bar-rect:hover {
  filter: brightness(1.1);
  transform: scaleY(1.02);
  transform-origin: bottom;
}

.bar-group:hover {
  transform: translateY(-2px);
}

svg {
  overflow: visible;
}

/* Accessibility improvements */
.bar-group:focus-within .bar-rect {
  outline: 2px solid #f59e42;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bar-rect {
    stroke: #000;
    stroke-width: 1px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .bar-rect {
    transition: none;
  }

  .bar-group {
    transition: none;
  }
}
</style>
