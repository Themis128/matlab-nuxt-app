<template>
  <div
    class="w-full h-[350px] p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Geographical Price Analysis
      </h3>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Average Price</span>
      </div>
    </div>

    <!-- Enhanced Horizontal Bar Chart for Geographical Data -->
    <div class="relative w-full h-[250px] overflow-x-auto">
      <svg
        class="w-full h-full min-w-[600px]"
        viewBox="0 0 700 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Grid lines -->
        <defs>
          <pattern id="geoGrid" width="60" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              stroke-width="0.5"
              class="text-gray-200 dark:text-gray-700"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geoGrid)" />

        <!-- Y-axis labels (regions) -->
        <g class="y-axis-labels">
          <g
            v-for="(region, index) in regions"
            :key="index"
            class="region-label"
            @mouseenter="showRegionTooltip(index)"
            @mouseleave="hideRegionTooltip"
          >
            <text
              x="5"
              :y="getYPosition(index) + 4"
              class="text-xs fill-gray-600 dark:fill-gray-400 font-medium"
            >
              {{ region }}
            </text>
          </g>
        </g>

        <!-- Horizontal bars -->
        <g class="chart-bars">
          <g
            v-for="(price, index) in prices"
            :key="index"
            class="bar-group"
            @mouseenter="showBarTooltip(index)"
            @mouseleave="hideBarTooltip"
          >
            <!-- Background bar for better UX -->
            <rect
              :x="labelWidth"
              :y="getYPosition(index)"
              :width="chartWidth - labelWidth"
              height="18"
              fill="currentColor"
              fill-opacity="0.1"
              class="text-gray-300 dark:text-gray-600"
            />

            <!-- Main bar -->
            <rect
              :x="labelWidth"
              :y="getYPosition(index)"
              :width="getBarWidth(price)"
              height="18"
              fill="#8b5cf6"
              class="bar-rect transition-all duration-300 hover:fill-purple-600"
              rx="4"
              ry="4"
            />

            <!-- Price value at end of bar -->
            <text
              v-if="getBarWidth(price) > 40"
              :x="labelWidth + getBarWidth(price) - 5"
              :y="getYPosition(index) + 12"
              text-anchor="end"
              class="text-xs font-semibold fill-white"
            >
              ${{ formatPrice(price) }}
            </text>
          </g>
        </g>

        <!-- X-axis scale (price values) -->
        <g class="x-axis-scale">
          <g v-for="(tick, index) in priceTicks" :key="index" class="price-tick">
            <line
              :x1="labelWidth + (tick / maxPrice) * (chartWidth - labelWidth)"
              y1="165"
              :x2="labelWidth + (tick / maxPrice) * (chartWidth - labelWidth)"
              y2="170"
              stroke="currentColor"
              stroke-width="1"
              class="text-gray-400"
            />
            <text
              :x="labelWidth + (tick / maxPrice) * (chartWidth - labelWidth)"
              y="185"
              text-anchor="middle"
              class="text-xs fill-gray-500 dark:fill-gray-400"
            >
              ${{ formatPrice(tick) }}
            </text>
          </g>
        </g>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="selectedRegion"
        class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none transition-all duration-200"
        :style="{
          left: tooltipX + 'px',
          top: tooltipY - 10 + 'px',
          transform: 'translateX(-50%)',
        }"
      >
        {{ selectedRegion }}: ${{ formatPrice(selectedPrice) }}
        <div
          class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
        ></div>
      </div>
    </div>

    <!-- Geographic Statistics -->
    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Highest Price</p>
          <p class="text-lg font-semibold text-purple-600 dark:text-purple-400">
            ${{ formatPrice(maxPrice) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Lowest Price</p>
          <p class="text-lg font-semibold text-purple-600 dark:text-purple-400">
            ${{ formatPrice(minPrice) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Average Price</p>
          <p class="text-lg font-semibold text-purple-600 dark:text-purple-400">
            ${{ formatPrice(averagePrice) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Total Regions</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ regions.length }}
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
  geo?: {
    regions: string[];
    avg_prices: number[];
  };
}>();

// Reactive state
const hoveredBarIndex = ref<number | null>(null);

// Chart dimensions and layout
const chartWidth = 700;
const chartHeight = 200;
const padding = { top: 20, right: 30, bottom: 40, left: 100 };
const labelWidth = 90;

// Default geographical data if none provided
const defaultGeoData = computed(() => ({
  regions: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'],
  avg_prices: [850, 720, 680, 550, 590],
}));

// Use provided geo data or default
const geoData = computed(() => props.geo || defaultGeoData.value);

const regions = computed(() => geoData.value.regions || []);
const prices = computed(() => geoData.value.avg_prices || []);

// Computed values for statistics
const maxPrice = computed(() => Math.max(...prices.value));
const minPrice = computed(() => Math.min(...prices.value));
const averagePrice = computed(
  () => prices.value.reduce((sum, price) => sum + price, 0) / prices.value.length
);

// Price ticks for x-axis
const priceTicks = computed(() => {
  if (prices.value.length === 0) return [];
  const step = Math.ceil(maxPrice.value / 4);
  return Array.from({ length: 5 }, (_, i) => i * step);
});

// Helper functions
const getYPosition = (index: number): number => {
  const rowHeight = 25;
  return padding.top + index * rowHeight;
};

const getBarWidth = (price?: number): number => {
  const p = price ?? 0;
  const maxBarWidth = chartWidth - padding.left - padding.right - labelWidth;
  return (p / (maxPrice.value || 1)) * maxBarWidth;
};

const getTooltipX = (index: number): number => {
  const p = prices.value[index] ?? 0;
  const maxBarWidth = chartWidth - padding.left - padding.right - labelWidth;
  return padding.left + labelWidth + ((p / (maxPrice.value || 1)) * maxBarWidth) / 2;
};

const formatPrice = (price?: number): string => {
  if (price == null) return '0';
  return Math.round(price).toLocaleString();
};

// Methods
const showBarTooltip = (index: number) => {
  hoveredBarIndex.value = index;
};

const hideBarTooltip = () => {
  hoveredBarIndex.value = null;
};

const showRegionTooltip = (index: number) => {
  hoveredBarIndex.value = index;
};

const hideRegionTooltip = () => {
  hoveredBarIndex.value = null;
};

// Selected helpers
const selectedRegion = computed(() => {
  return hoveredBarIndex.value !== null ? regions.value[hoveredBarIndex.value] : undefined;
});

const selectedPrice = computed(() => {
  return hoveredBarIndex.value !== null ? prices.value[hoveredBarIndex.value] : undefined;
});

const tooltipX = computed(() => {
  return hoveredBarIndex.value !== null ? getTooltipX(hoveredBarIndex.value) : 0;
});

const tooltipY = computed(() => {
  return hoveredBarIndex.value !== null ? getYPosition(hoveredBarIndex.value) : 0;
});

// Watchers
watch(
  () => props.geo,
  (newVal) => {
    // Data is reactive through computed properties
  }
);
</script>

<style scoped>
.bar-group {
  cursor: pointer;
}

.bar-rect:hover {
  filter: brightness(1.1);
  transform: scaleX(1.02);
  transform-origin: left;
}

.region-label {
  cursor: pointer;
  transition: all 0.2s ease;
}

.region-label:hover {
  filter: brightness(1.2);
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
  outline: 2px solid #8b5cf6;
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

  .region-label {
    transition: none;
  }
}
</style>
