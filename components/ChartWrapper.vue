<template>
  <div class="card bg-base-100 shadow-xl">
    <!-- Chart Header -->
    <div v-if="title || $slots.header" class="card-header">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Icon v-if="icon" :name="icon" class="h-5 w-5 text-primary" />
          <div>
            <h3 class="card-title">
              {{ title }}
            </h3>
            <p v-if="subtitle" class="text-sm opacity-70 mt-1">
              {{ subtitle }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <slot name="header-actions" />
          <button v-if="exportable" class="btn btn-ghost btn-sm" @click="handleExport">
            <Icon name="heroicons:arrow-down-tray" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="card-body">
      <!-- Loading State -->
      <div v-if="loading" class="flex h-[350px] items-center justify-center">
        <div class="text-center">
          <span class="loading loading-spinner loading-lg text-primary" />
          <p class="mt-2 text-sm opacity-70">
            {{ loadingText }}
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error">
        <Icon name="heroicons:exclamation-triangle" class="h-6 w-6" />
        <div>
          <h3 class="font-bold">
            {{ errorTitle }}
          </h3>
          <div class="text-sm">
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Chart Content -->
      <div v-else :class="chartContainerClass">
        <slot>
          <!-- Default ApexCharts -->
          <apexchart
            v-if="chartType === 'apex'"
            :type="apexType"
            :options="apexOptions"
            :series="apexSeries"
            :height="height"
            class="w-full"
          />
          <!-- Chart.js placeholder -->
          <div
            v-else-if="chartType === 'chartjs'"
            class="flex h-full items-center justify-center p-6"
          >
            <p class="text-sm opacity-70">Chart.js integration coming soon</p>
          </div>
        </slot>
      </div>

      <!-- Chart Footer -->
      <div v-if="$slots.footer" class="card-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts';

interface Props {
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  loading?: boolean;
  loadingText?: string;
  error?: string | null;
  errorTitle?: string;
  height?: string | number;
  exportable?: boolean;
  chartType?: 'apex' | 'chartjs' | 'custom';
  // ApexCharts props
  apexType?: string;
  apexOptions?: ApexOptions;
  apexSeries?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  icon: undefined,
  iconColor: 'text-primary',
  loading: false,
  loadingText: 'Loading chart...',
  error: null,
  errorTitle: 'Error loading chart',
  height: 350,
  exportable: false,
  chartType: 'apex',
  apexType: 'line',
  apexOptions: undefined,
  apexSeries: undefined,
});

const emit = defineEmits<{
  export: [];
}>();

const chartContainerClass = computed(() => [
  'relative w-full',
  {
    'p-6': !props.loading && !props.error,
  },
]);

const handleExport = () => {
  emit('export');
};
</script>
