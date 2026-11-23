<template>
  <div class="min-h-screen">
    <!-- Enhanced Modern Hero Section -->
    <section class="relative overflow-hidden bg-base-200 py-20 sm:py-24 lg:py-32">
      <!-- Enhanced Decorative elements -->
      <div class="absolute right-20 top-20 h-6 w-6 rounded-full bg-warning opacity-60 shadow-lg" />
      <div class="absolute right-32 top-32 h-4 w-4 rounded-sm bg-primary opacity-60 shadow-lg" />
      <div class="absolute right-16 top-40 h-10 w-3 rounded bg-primary opacity-60 shadow-lg" />
      <div class="absolute right-24 top-48 h-3 w-8 rounded bg-warning opacity-60 shadow-lg" />

      <div class="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <!-- Hero Content -->
          <div class="text-center lg:text-left">
            <div
              class="bg-primary/20 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary shadow-sm"
            >
              <Icon name="heroicons:cpu-chip" class="h-4 w-4" />
              MATLAB Deep Learning Platform
            </div>

            <h1
              class="mb-6 text-5xl font-extrabold leading-tight text-base-content sm:text-6xl lg:text-7xl"
            >
              Advanced AI Analytics
              <br class="hidden sm:block" />
              <span class="block text-primary">for Mobile Datasets</span>
            </h1>

            <p class="text-base-content/70 mx-auto mb-8 max-w-lg text-lg leading-relaxed lg:mx-0">
              Harness the power of MATLAB's deep learning capabilities to analyze mobile phone
              datasets, extract meaningful insights, and build predictive models with modern web
              technologies.
            </p>

            <div class="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <NuxtLink to="/search">
                <button
                  class="btn btn-primary btn-lg font-semibold shadow-lg"
                  aria-label="Explore Analytics"
                >
                  <Icon name="heroicons:chart-bar" class="h-5 w-5" />
                  Explore Analytics
                </button>
              </NuxtLink>
              <NuxtLink to="/model-showcase">
                <button
                  class="btn btn-outline btn-lg font-semibold shadow-md"
                  aria-label="Model Performance"
                >
                  <Icon name="heroicons:cog-6-tooth" class="h-5 w-5" />
                  Model Performance
                </button>
              </NuxtLink>
            </div>
          </div>

          <!-- AI Dashboard Mockup -->
          <div class="relative mt-8 lg:mt-0">
            <div class="card relative mx-auto max-w-md bg-base-300 shadow-2xl lg:max-w-none">
              <div class="mb-4 text-base-content">
                <div class="text-base-content/60 mb-1 text-sm">Live API Status</div>
                <div class="text-base-content/50 text-xs">Self-hosted FastAPI · k3s</div>
              </div>

              <!-- Model fleet visualization (decorative) -->
              <div class="mb-4 grid grid-cols-8 gap-1">
                <div v-for="i in 64" :key="i" :class="['h-3 w-3 rounded-sm', getCellColor(i)]" />
              </div>

              <div class="flex items-center justify-between text-sm text-base-content">
                <div>
                  <div class="mb-1">Model fleet: {{ modelCount }} types</div>
                  <div class="text-base-content/60 text-xs">Status: {{ apiStatus }}</div>
                </div>
                <div class="text-right">
                  <div class="mb-1">Data quality: {{ qualityScore }}%</div>
                  <div class="text-base-content/60 text-xs">Latency: {{ apiLatency }}ms</div>
                </div>
              </div>
            </div>

            <!-- Floating elements -->
            <div class="absolute -left-4 -top-4 h-8 w-8 rounded-lg bg-primary" />
            <div class="absolute -bottom-4 -right-4 h-6 w-6 rounded-full bg-warning" />
            <div class="absolute -right-8 top-1/2 h-12 w-4 rounded bg-primary" />
          </div>
        </div>

        <!-- Trust indicators -->
        <div class="mt-16 border-t border-base-300 pt-8">
          <div class="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:cpu-chip" class="h-6 w-6 text-primary" />
              <span class="text-base-content/70 font-medium">MATLAB</span>
            </div>
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:chart-bar" class="h-6 w-6 text-info" />
              <span class="text-base-content/70 font-medium">TensorFlow</span>
            </div>
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:cloud" class="h-6 w-6 text-success" />
              <span class="text-base-content/70 font-medium">PyTorch</span>
            </div>
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:globe-alt" class="h-6 w-6 text-warning" />
              <span class="text-base-content/70 font-medium">Nuxt.js</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Enhanced Analytics Dashboard Section -->
    <section class="relative overflow-hidden bg-base-100 py-20">
      <div class="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <div
            class="bg-primary/20 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary shadow-sm"
          >
            <Icon name="heroicons:chart-bar" class="h-4 w-4" />
            Analytics Platform
          </div>
          <h2 class="mb-4 text-4xl font-extrabold text-base-content">Analytics Dashboard</h2>
          <p class="text-base-content/70 mx-auto max-w-2xl text-xl">
            Comprehensive insights from mobile dataset analysis powered by advanced machine learning
            models
          </p>
        </div>

        <!-- Stats Cards Grid — live data from the dataset + quality endpoints -->
        <div class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div class="card bg-base-100 shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base-content/60 text-sm font-medium">Dataset Records</h3>
              <Icon name="heroicons:server-stack" class="h-5 w-5 text-info" />
            </div>
            <div class="mb-1 text-3xl font-bold text-base-content">
              {{ datasetStats?.totalRecords ?? '—' }}
            </div>
            <div class="text-sm font-semibold text-success">mobile models analyzed</div>
          </div>

          <div class="card bg-base-100 shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base-content/60 text-sm font-medium">Brands Covered</h3>
              <Icon name="heroicons:cube" class="h-5 w-5 text-primary" />
            </div>
            <div class="mb-1 text-3xl font-bold text-base-content">
              {{ datasetStats?.companies?.length ?? '—' }}
            </div>
            <div class="text-sm font-semibold text-success">companies in dataset</div>
          </div>

          <div class="card bg-base-100 shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base-content/60 text-sm font-medium">Data Quality</h3>
              <Icon name="heroicons:chart-bar" class="h-5 w-5 text-success" />
            </div>
            <div class="mb-1 text-3xl font-bold text-base-content">{{ qualityScore }}%</div>
            <div class="text-sm font-semibold text-success">
              completeness {{ completenessScore }}%
            </div>
          </div>

          <div class="card bg-base-100 shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base-content/60 text-sm font-medium">ML Model Types</h3>
              <Icon name="heroicons:cog-6-tooth" class="h-5 w-5 text-warning" />
            </div>
            <div class="mb-1 text-3xl font-bold text-base-content">{{ modelCount }}</div>
            <div class="text-sm font-semibold text-success">sklearn · XGBoost · distilled</div>
          </div>
        </div>

        <!-- Enhanced Feature Cards -->
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div class="bg-primary/10 card shadow-xl">
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-xl bg-primary p-4 text-primary-content shadow-lg">
                <Icon name="heroicons:chart-bar" class="h-7 w-7" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-base-content">Analytics Dashboard</h3>
                <p class="text-base-content/60 text-sm font-medium">Enterprise</p>
              </div>
            </div>
            <p class="text-base-content/70 mb-6 text-base leading-relaxed">
              View comprehensive analytics and insights from mobile dataset analysis with real-time
              metrics and performance tracking.
            </p>
            <NuxtLink to="/search">
              <button
                class="btn btn-primary btn-outline font-semibold shadow-md"
                aria-label="Explore Dashboard"
              >
                Explore Dashboard
                <Icon name="heroicons:arrow-right" class="h-4 w-4" />
              </button>
            </NuxtLink>
          </div>

          <div class="bg-info/10 card shadow-xl">
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-xl bg-info p-4 text-info-content shadow-lg">
                <Icon name="heroicons:cog-6-tooth" class="h-7 w-7" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-base-content">Model Performance</h3>
                <p class="text-base-content/60 text-sm font-medium">AI/ML</p>
              </div>
            </div>
            <p class="text-base-content/70 mb-6 text-base leading-relaxed">
              Monitor and analyze deep learning model performance metrics with advanced
              visualization and optimization tools.
            </p>
            <NuxtLink to="/model-showcase">
              <button
                class="btn btn-info btn-outline font-semibold shadow-md"
                aria-label="View Performance"
              >
                View Performance
                <Icon name="heroicons:arrow-right" class="h-4 w-4" />
              </button>
            </NuxtLink>
          </div>

          <div class="bg-success/10 card shadow-xl">
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-xl bg-success p-4 text-success-content shadow-lg">
                <Icon name="heroicons:presentation-chart-line" class="h-7 w-7" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-base-content">Data Visualization</h3>
                <p class="text-base-content/60 text-sm font-medium">Analytics</p>
              </div>
            </div>
            <p class="text-base-content/70 mb-6 text-base leading-relaxed">
              Interactive charts and visualizations for better data understanding with
              MATLAB-powered insights and predictions.
            </p>
            <NuxtLink to="/search">
              <button
                class="btn btn-success btn-outline font-semibold shadow-md"
                aria-label="Explore Visualizations"
              >
                Explore Visualizations
                <Icon name="heroicons:arrow-right" class="h-4 w-4" />
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { usePageSeoWithStructuredData } from '../composables/usePageSeoWithStructuredData';
import { AVAILABLE_MODELS } from '../composables/useModelPredictions';

// Live data for the stats cards + hero status card — fetched server-side so
// the values are real in the SSR HTML (no client-only placeholders).
const { data: datasetStats } = await useFetch('/api/dataset/statistics');
const { data: qualityReport } = await useFetch('/api/dataset/quality-report');
const { data: health } = await useFetch('/api/v1/health');

const modelCount = AVAILABLE_MODELS.length;

const qualityScore = computed(() => {
  const score = (qualityReport.value as any)?.qualityScores?.overall;
  return typeof score === 'number' ? score.toFixed(1) : '—';
});

const completenessScore = computed(() => {
  const score = (qualityReport.value as any)?.qualityScores?.completeness;
  return typeof score === 'number' ? score.toFixed(1) : '—';
});

const apiStatus = computed(() => {
  const status = (health.value as any)?.services?.api?.status;
  return status === 'up' ? 'Online' : status ? String(status) : 'Unknown';
});

const apiLatency = computed(() => {
  const ms = (health.value as any)?.services?.api?.responseTime;
  return typeof ms === 'number' ? Math.round(ms) : '—';
});

// Deterministic color function to avoid hydration mismatches
// Uses a simple hash function based on the index to ensure
// the same color is generated on both server and client
function getCellColor(index: number): string {
  // Simple deterministic hash function
  const hash = (index * 17 + 23) % 100;
  if (hash > 60) {
    return hash % 2 === 0 ? 'bg-primary' : 'bg-warning';
  }
  return 'bg-base-300';
}

// Page SEO meta tags with structured data
usePageSeoWithStructuredData({
  title: 'Home - MATLAB Deep Learning & Mobile Dataset Analysis',
  description:
    'Explore deep learning models, analyze mobile phone datasets, and discover insights with MATLAB and modern web technologies. Advanced AI analytics platform for mobile datasets.',
  keywords: [
    'MATLAB',
    'deep learning',
    'mobile datasets',
    'AI analytics',
    'machine learning',
    'data analysis',
    'neural networks',
    'predictive models',
  ],
  type: 'website',
  image: '/og-home.jpg',
  structuredData: {
    organization: true,
    website: true, // Add WebSite schema with search action for homepage
  },
});

// Optional: Use user activity tracking if available
let trackView: ((page: string) => void) | undefined;
try {
  const activity = useUserActivity();
  if (activity && typeof activity.trackView === 'function') {
    trackView = activity.trackView;
  }
} catch {
  // Silently handle if tracking is not available
}

// Page initialization
onMounted(() => {
  // Track page view if tracking is available
  if (trackView) {
    try {
      trackView('home');
    } catch {
      // Silently handle if tracking fails
      console.debug('Analytics tracking not available');
    }
  }
});
</script>

<style scoped>
/* Additional styles can be added here if needed */
</style>
