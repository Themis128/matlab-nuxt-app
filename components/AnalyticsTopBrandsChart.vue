<template>
  <div
    class="w-full h-[350px] p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Top Brands by Phone Count</h3>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-indigo-500 rounded-full"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Phone Count</span>
      </div>
    </div>

    <!-- Enhanced Bar Chart for Brands -->
    <div class="relative w-full h-[250px] overflow-x-auto">
      <svg
        class="w-full h-full min-w-[600px]"
        viewBox="0 0 700 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Grid lines -->
        <defs>
          <pattern id="brandGrid" width="50" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 50 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              stroke-width="0.5"
              class="text-gray-200 dark:text-gray-700"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#brandGrid)" />

        <!-- Y-axis labels -->
        <g class="y-axis-labels">
          <text x="5" y="15" class="text-xs fill-gray-500 dark:fill-gray-400">{{ maxCount }}</text>
          <text x="5" y="65" class="text-xs fill-gray-500 dark:fill-gray-400">
            {{ Math.round(maxCount * 0.75) }}
          </text>
          <text x="5" y="115" class="text-xs fill-gray-500 dark:fill-gray-400">
            {{ Math.round(maxCount * 0.5) }}
          </text>
          <text x="5" y="165" class="text-xs fill-gray-500 dark:fill-gray-400">
            {{ Math.round(maxCount * 0.25) }}
          </text>
          <text x="5" y="195" class="text-xs fill-gray-500 dark:fill-gray-400">0</text>
        </g>

        <!-- Bar Chart Bars -->
        <g class="chart-bars">
          <g
            v-for="(brand, index) in brandData"
            :key="index"
            class="bar-group"
            :class="{ 'selected-brand': brand.name === selectedBrand }"
            @mouseenter="showBarTooltip(index)"
            @mouseleave="hideBarTooltip"
          >
            <!-- Bar rectangle -->
            <rect
              :x="brand.x"
              :y="brand.y"
              :width="brand.width"
              :height="brand.height"
              :fill="getBarColor(brand.name)"
              class="bar-rect transition-all duration-300"
              rx="3"
              ry="3"
              :class="{
                'hover:brightness-110': brand.name !== selectedBrand,
                'selected-glow': brand.name === selectedBrand,
              }"
            />

            <!-- Count value on top of bar -->
            <text
              v-if="brand.height > 20"
              :x="brand.x + brand.width / 2"
              :y="brand.y - 5"
              text-anchor="middle"
              class="text-xs font-semibold fill-gray-700 dark:fill-gray-300"
            >
              {{ brand.count }}
            </text>

            <!-- Brand name below bar -->
            <text
              :x="brand.x + brand.width / 2"
              y="215"
              text-anchor="middle"
              class="text-xs fill-gray-600 dark:fill-gray-400 transition-colors duration-200"
              :class="{
                'font-semibold text-indigo-600 dark:text-indigo-400': brand.name === selectedBrand,
              }"
            >
              {{ brand.name }}
            </text>

            <!-- Selection indicator -->
            <circle
              v-if="brand.name === selectedBrand"
              :cx="brand.x + brand.width / 2"
              :cy="brand.y - 15"
              r="4"
              fill="#f97316"
              class="selected-indicator"
            />
          </g>
        </g>

        <!-- Interactive hover effect -->
        <rect
          v-if="hoveredBrand !== null"
          :x="hoveredBrand.x - 2"
          y="20"
          :width="hoveredBrand.width + 4"
          height="160"
          fill="currentColor"
          fill-opacity="0.1"
          class="text-indigo-500"
        />
      </svg>

      <!-- Tooltip -->
      <div
        v-if="hoveredBrand !== null"
        class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none transition-all duration-200"
        :style="{
          left: hoveredBrand.x + hoveredBrand.width / 2 + 'px',
          top: hoveredBrand.y - 40 + 'px',
          transform: 'translateX(-50%)',
        }"
      >
        {{ hoveredBrand.name }}: {{ hoveredBrand.count }} phones
        <div
          class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
        ></div>
      </div>
    </div>

    <!-- Brand Statistics -->
    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Top Brand</p>
          <p class="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
            {{ topBrand.name }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Total Phones</p>
          <p class="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
            {{ totalPhones }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Avg per Brand</p>
          <p class="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
            {{ averagePhones }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Total Brands</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ Object.keys(brands).length }}
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
  brands?: Record<string, number>;
  selectedBrand?: string;
}>();

// Reactive state
const hoveredBarIndex = ref<number | null>(null);

// Chart dimensions
const chartWidth = 700;
const chartHeight = 200;
const padding = { top: 20, right: 20, bottom: 40, left: 50 };

// Default brand data if none provided
const defaultBrands = computed(() => ({
  Apple: 45,
  Samsung: 38,
  Xiaomi: 28,
  Huawei: 22,
  OnePlus: 15,
  Google: 12,
}));

// Use provided brands or default
const brands = computed(() => props.brands || defaultBrands.value);
const selectedBrand = computed(() => props.selectedBrand);

// Computed values
const brandEntries = computed(() => Object.entries(brands.value));
const maxCount = computed(() => Math.max(...Object.values(brands.value)));
const totalPhones = computed(() =>
  Object.values(brands.value).reduce((sum, count) => sum + count, 0)
);
const averagePhones = computed(() =>
  Math.round(totalPhones.value / Object.keys(brands.value).length)
);

const topBrand = computed(() => {
  const entries = Object.entries(brands.value);
  const maxEntry = entries.reduce((max, current) => (current[1] > max[1] ? current : max));
  return { name: maxEntry[0], count: maxEntry[1] };
});

// Bar data type
type Brand = { x: number; y: number; width: number; height: number; count: number; name: string };

// Bar data calculation
const brandData = computed<Brand[]>(() => {
  return brandEntries.value.map(([name, count], index) => {
    const barWidth = (chartWidth - padding.left - padding.right) / brandEntries.value.length - 10;
    const maxHeight = chartHeight - padding.top - padding.bottom;
    const barHeight = (count / maxCount.value) * maxHeight;
    const x =
      padding.left +
      (index * (chartWidth - padding.left - padding.right)) / brandEntries.value.length +
      5;
    const y = padding.top + (maxHeight - barHeight);

    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      count,
      name,
    };
  });
});

// Safely expose the hovered brand data to avoid direct indexing of possibly undefined arrays
const hoveredBrand = computed<Brand | null>(() => {
  if (hoveredBarIndex.value === null) return null;
  const idx = hoveredBarIndex.value;
  return brandData.value && brandData.value[idx] ? brandData.value[idx] : null;
});

// Helper functions
const getBarColor = (brandName: string): string => {
  if (brandName === selectedBrand.value) {
    return '#f97316'; // Orange for selected brand
  }
  return '#6366f1'; // Indigo for other brands
};

// Methods
const showBarTooltip = (index: number) => {
  hoveredBarIndex.value = index;
};

const hideBarTooltip = () => {
  hoveredBarIndex.value = null;
};

// Watchers
watch(
  () => props.brands,
  (newVal) => {
    // Data is reactive through computed properties
  }
);

watch(
  () => props.selectedBrand,
  (newVal) => {
    // Color changes will be reactive through computed properties
  }
);
</script>

<style scoped>
.bar-group {
  cursor: pointer;
}

.bar-rect:hover {
  transform: scaleY(1.02);
  transform-origin: bottom;
}

.bar-group.selected-brand .bar-rect {
  filter: brightness(1.1);
}

.selected-glow {
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.4));
}

.selected-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

svg {
  overflow: visible;
}

/* Responsive design */
@media (max-width: 768px) {
  .chart-bars {
    transform: scale(0.8);
    transform-origin: left top;
  }
}

@media (max-width: 480px) {
  .chart-bars {
    transform: scale(0.6);
  }
}

/* Accessibility improvements */
.bar-group:focus-within .bar-rect {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.bar-group.selected-brand:focus-within .bar-rect {
  outline-color: #f97316;
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

  .selected-indicator {
    animation: none;
  }
}
</style>
