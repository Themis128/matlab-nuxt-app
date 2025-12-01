<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">AI Model Dashboard</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Performance metrics and model analytics
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <!-- Models Online indicators: Price, RAM, Battery, Brand, Settings -->
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">Models Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Model Performance Heading for tests -->
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Model Performance Summary
      </h2>
      <!-- Model Performance Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Price Prediction</p>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">98.24%</p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-green-600 dark:text-green-400 font-medium">+20.7% improvement</span>
              <span class="text-gray-500 dark:text-gray-400 ml-2">vs baseline</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">RAM Prediction</p>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">95.16%</p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-blue-600 dark:text-blue-400 font-medium">+43.6% improvement</span>
              <span class="text-gray-500 dark:text-gray-400 ml-2">vs baseline</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Battery Prediction</p>
              <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">94.77%</p>
            </div>
            <div
              class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-purple-600 dark:text-purple-400 font-medium"
                >+26.6% improvement</span
              >
              <span class="text-gray-500 dark:text-gray-400 ml-2">vs baseline</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                Brand Classification
              </p>
              <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">65.22%</p>
            </div>
            <div
              class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-orange-600 dark:text-orange-400 font-medium"
                >+9.6% improvement</span
              >
              <span class="text-gray-500 dark:text-gray-400 ml-2">vs baseline</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters for interactive dashboard -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Interactive Filters
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Year</label>
            <select
              v-model="selectedYear"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
            >
              <option value="All">All</option>
              <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full inline-flex items-center justify-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Reset Filters
            </button>
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Brand</label>
            <select
              v-model="selectedBrand"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
            >
              <option value="All">All</option>
              <option v-for="b in availableBrands" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Target</label>
            <select
              v-model="selectedTarget"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
            >
              <option value="All">All</option>
              <option v-for="t in availableTargets" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Feature</label>
            <select
              v-model="selectedFeature"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
            >
              <option value="All">All</option>
              <option v-for="f in availableFeatures" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Performance Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Top Brands Bar Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <AnalyticsTopBrandsChart :brands="filteredTopBrands" :selectedBrand="selectedBrand" />
        </div>
        <!-- Numeric Summaries Cards -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Numeric Feature Summaries
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(summary, key) in filteredNumericSummaries"
              :key="key"
              class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow"
            >
              <h4 class="text-md font-bold text-gray-800 dark:text-gray-200 mb-2">{{ key }}</h4>
              <div class="flex flex-col space-y-1 text-sm">
                <span
                  >Min: <span class="font-semibold">{{ summary.min }}</span></span
                >
                <span
                  >Max: <span class="font-semibold">{{ summary.max }}</span></span
                >
                <span
                  >Mean: <span class="font-semibold">{{ summary.mean }}</span></span
                >
                <span
                  >Median: <span class="font-semibold">{{ summary.median }}</span></span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Model charts & trends -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <AnalyticsAccuracyChart :accuracyTrends="accuracySeries" :labels="accuracyLabels" />
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <AnalyticsYearlyTrendsChart
            :trends="filteredYearlyTrends"
            :selectedTarget="selectedTarget"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <AnalyticsFeatureImportanceChart :importance="filteredFeatureImportance" />
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <AnalyticsGeographicalChart :geo="filteredGeographical" />
        </div>
      </div>

      <!-- Technology Stack -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Technology Stack & Performance
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div
              class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2"
            >
              <svg
                class="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">TensorFlow</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Deep Learning</p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2"
            >
              <svg
                class="w-6 h-6 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Scikit-learn</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">ML Algorithms</p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2"
            >
              <svg
                class="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">FastAPI</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">REST API</p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-2"
            >
              <svg
                class="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Nuxt.js</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Frontend</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="mt-8 flex justify-center">
        <div class="flex space-x-4">
          <NuxtLink
            to="/"
            class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Home
          </NuxtLink>
          <NuxtLink
            to="/demo"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Try AI Predictions
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NumericSummary {
  min: number
  max: number
  mean: number
  median: number
}

// Full analytics data interface
interface AnalyticsData {
  yearly_trends?: { years: number[]; avg_price: number[]; avg_ram: number[]; avg_battery: number[] }
  top_brands?: Record<string, number>
  feature_importance?: Record<string, number>
  numeric_summaries?: Record<string, NumericSummary>
  geographical_analysis?: { regions: string[]; avg_prices: number[] }
  metrics?: { accuracies: number[]; labels: string[] }
}
import { useHead, useAsyncData } from '#imports'
// Page meta
useHead({
  title: 'AI Model Dashboard - Mobile Finder',
  meta: [
    {
      name: 'description',
      content:
        'View AI model performance metrics, accuracy trends, and technical analytics for mobile phone predictions.',
    },
  ],
})

// Fetch analytics summary and metrics from FastAPI backend
import { ref, computed } from 'vue'
import type { Ref } from 'vue'

// ...existing code...
interface AnalyticsData {
  yearly_trends?: { years: number[]; avg_price: number[]; avg_ram: number[]; avg_battery: number[] }
  top_brands?: Record<string, number>
  feature_importance?: Record<string, number>
  numeric_summaries?: Record<string, NumericSummary>
  geographical_analysis?: { regions: string[]; avg_prices: number[] }
  metrics?: { accuracies: number[]; labels: string[] }
}
import AnalyticsTopBrandsChart from '~/components/AnalyticsTopBrandsChart.vue'
import AnalyticsFeatureImportanceChart from '~/components/AnalyticsFeatureImportanceChart.vue'
import AnalyticsYearlyTrendsChart from '~/components/AnalyticsYearlyTrendsChart.vue'
import AnalyticsGeographicalChart from '~/components/AnalyticsGeographicalChart.vue'
import AnalyticsAccuracyChart from '~/components/AnalyticsAccuracyChart.vue'

const { data } = await useAsyncData('analyticsSummary', () => $fetch('/api/analytics/summary'))
// Cast to a typed ref to avoid deep type recursion from $fetch signatures
const analyticsData = data as unknown as Ref<AnalyticsData | undefined>

// Reactive filter values
const selectedYear = ref('All')
const selectedBrand = ref('All')
const selectedTarget = ref('All')
const selectedFeature = ref('All')

// computed options
const availableYears = computed(() =>
  ((analyticsData.value?.yearly_trends?.years ?? []) as (number | undefined)[]).filter(
    (y): y is number => typeof y === 'number'
  )
)
const availableBrands = computed(() => Object.keys(analyticsData.value?.top_brands || {}))
const availableTargets = computed(() => {
  // produce a list of common model targets available on the dashboard
  const defaults = ['Price', 'RAM', 'Battery', 'Brand']
  return defaults
})
const availableFeatures = computed(() => Object.keys(analyticsData.value?.feature_importance || {}))

// filtered datasets to pass to chart components
const filteredTopBrands = computed(() => {
  const brands = analyticsData.value?.top_brands || {}
  if (selectedBrand.value === 'All') return brands
  const val = brands[selectedBrand.value]
  return val !== undefined ? { [selectedBrand.value]: val } : {}
})

// Numeric summaries: try analyticsData.numeric_summaries, else derive
const derivedNumericSummaries = computed(() => {
  if (
    analyticsData.value?.numeric_summaries &&
    Object.keys(analyticsData.value.numeric_summaries).length
  ) {
    return analyticsData.value.numeric_summaries
  }
  const d: Record<string, NumericSummary> = {}
  Object.keys(analyticsData.value || {}).forEach(k => {
    const v = (analyticsData.value as any)[k]
    if (v && typeof v === 'object' && 'min' in v && 'max' in v && 'mean' in v && 'median' in v) {
      d[k] = {
        min: v.min,
        max: v.max,
        mean: v.mean,
        median: v.median,
      }
    }
  })
  return d
})

const filteredNumericSummaries = computed(() => {
  if (selectedFeature.value === 'All') return derivedNumericSummaries.value
  const v = derivedNumericSummaries.value[selectedFeature.value]
  return v ? { [selectedFeature.value]: v } : {}
})

// Feature importance filter
const filteredFeatureImportance = computed(() => {
  const importance = analyticsData.value?.feature_importance || {}
  if (selectedFeature.value === 'All') return importance
  const v = importance[selectedFeature.value]
  return v !== undefined ? { [selectedFeature.value]: v } : {}
})

// Yearly trends filter: if a specific year is chosen show the single-year values (for the current demo)
const filteredYearlyTrends = computed(() => {
  const trends = analyticsData.value?.yearly_trends || {
    years: [],
    avg_price: [],
    avg_ram: [],
    avg_battery: [],
  }
  if (!trends.years || selectedYear.value === 'All')
    return {
      years: (trends.years ?? []).filter((v): v is number => typeof v === 'number'),
      avg_price: (trends.avg_price ?? []).map(n => n ?? 0),
      avg_ram: (trends.avg_ram ?? []).map(n => n ?? 0),
      avg_battery: (trends.avg_battery ?? []).map(n => n ?? 0),
    }
  const idx = trends.years.indexOf(Number(selectedYear.value))
  if (idx === -1) return trends
  const idxNumber = Number(idx)
  return {
    years: [(trends.years ?? [])[idxNumber] ?? 0],
    avg_price: [(trends.avg_price ?? [])[idxNumber] ?? 0],
    avg_ram: [(trends.avg_ram ?? [])[idxNumber] ?? 0],
    avg_battery: [(trends.avg_battery ?? [])[idxNumber] ?? 0],
  }
})

// Geographical analysis: not filterable for now, but still computed to match structure
const filteredGeographical = computed(() => {
  const geo = analyticsData.value?.geographical_analysis || { regions: [], avg_prices: [] }
  return geo
})

// Utility to reset filters
const resetFilters = () => {
  selectedYear.value = 'All'
  selectedBrand.value = 'All'
  selectedTarget.value = 'All'
  selectedFeature.value = 'All'
}

// Accuracy series and labels from analytics (if present), otherwise fallback
const accuracySeries = computed((): number[] => {
  // We might have analyticsData.metrics or similar; fallback values for now
  const labels = analyticsData.value?.metrics?.labels || ['Price', 'RAM', 'Battery', 'Brand']
  const accRaw = (analyticsData.value?.metrics?.accuracies ?? [
    98.24, 95.16, 94.77, 65.22,
  ]) as number[]
  const accNumbers: number[] = accRaw.map(n => Number(n ?? 0))
  if (selectedTarget.value !== 'All') {
    const i = labels.indexOf(selectedTarget.value)
    if (i >= 0 && i < accNumbers.length) {
      const val = accNumbers[i] ?? 0
      return [val]
    }
    return accNumbers
  }
  return accNumbers
})
const accuracyLabels = computed(() => {
  const labels = analyticsData.value?.metrics?.labels || ['Price', 'RAM', 'Battery', 'Brand']
  if (selectedTarget.value !== 'All' && labels.includes(selectedTarget.value))
    return [selectedTarget.value]
  return labels
})

// Some code exposes analyticsData directly; no alias required
</script>
