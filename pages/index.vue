<template>
  <div class="bg-background min-h-screen">
    <!-- Modern Hero Section -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-16 sm:py-20 lg:py-28 dark:from-gray-900 dark:to-gray-800"
    >
      <!-- Decorative elements -->
      <div class="absolute right-20 top-20 h-4 w-4 rounded-full bg-yellow-400 opacity-60"></div>
      <div
        class="absolute right-32 top-32 h-3 w-3 rotate-45 transform rounded-sm bg-purple-400 opacity-60"
      ></div>
      <div class="absolute right-16 top-40 h-8 w-2 bg-purple-500 opacity-60"></div>
      <div class="absolute right-24 top-48 h-2 w-6 bg-yellow-400 opacity-60"></div>

      <div class="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <!-- Hero Content -->
          <div class="text-center lg:text-left">
            <div
              class="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            >
              <UIcon name="i-heroicons-cpu-chip" class="h-4 w-4" />
              MATLAB Deep Learning Platform
            </div>

            <h1
              class="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white"
            >
              Advanced AI Analytics
              <br class="hidden sm:block" />
              <span class="text-purple-600 dark:text-purple-400">for Mobile Datasets</span>
            </h1>

            <p
              class="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-gray-600 lg:mx-0 dark:text-gray-300"
            >
              Harness the power of MATLAB's deep learning capabilities to analyze mobile phone
              datasets, extract meaningful insights, and build predictive models with modern web
              technologies.
            </p>

            <div class="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <UButton size="lg" color="purple" variant="solid" class="font-semibold">
                <UIcon name="i-heroicons-chart-bar" class="mr-2 h-5 w-5" />
                Explore Analytics
              </UButton>
              <UButton size="lg" variant="outline" class="font-semibold">
                <UIcon name="i-heroicons-cog-6-tooth" class="mr-2 h-5 w-5" />
                Model Performance
              </UButton>
            </div>
          </div>

          <!-- AI Dashboard Mockup -->
          <div class="relative mt-8 lg:mt-0">
            <div
              class="relative mx-auto max-w-md rotate-3 transform rounded-2xl bg-gray-900 p-6 shadow-2xl transition-transform duration-500 hover:rotate-0 lg:max-w-none"
            >
              <div class="mb-4 text-white">
                <div class="mb-1 text-sm text-gray-400">Neural Network Status</div>
                <div class="text-xs text-gray-500">MATLAB Deep Learning</div>
              </div>

              <!-- Neural Network Visualization -->
              <div class="mb-4 grid grid-cols-8 gap-1">
                <div
                  v-for="i in 64"
                  :key="i"
                  :class="[
                    'h-3 w-3 rounded-sm',
                    Math.random() > 0.6
                      ? Math.random() > 0.5
                        ? 'bg-purple-500'
                        : 'bg-yellow-400'
                      : 'bg-gray-700',
                  ]"
                ></div>
              </div>

              <div class="flex items-center justify-between text-sm text-white">
                <div>
                  <div class="mb-1">Model: CNN-LSTM</div>
                  <div class="text-xs text-gray-400">Status: Training</div>
                </div>
                <div class="text-right">
                  <div class="mb-1">Accuracy: 94.7%</div>
                  <div class="text-xs text-gray-400">Epoch: 127/200</div>
                </div>
              </div>
            </div>

            <!-- Floating elements -->
            <div
              class="absolute -left-4 -top-4 h-8 w-8 rotate-45 transform rounded-lg bg-purple-400"
            ></div>
            <div class="absolute -bottom-4 -right-4 h-6 w-6 rounded-full bg-yellow-400"></div>
            <div class="absolute -right-8 top-1/2 h-12 w-4 rounded bg-purple-500"></div>
          </div>
        </div>

        <!-- Trust indicators -->
        <div class="mt-16 border-t border-gray-200 pt-8 dark:border-gray-700">
          <div class="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-cpu-chip" class="h-6 w-6 text-purple-500" />
              <span class="font-medium text-gray-600 dark:text-gray-400">MATLAB</span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-chart-bar" class="h-6 w-6 text-blue-500" />
              <span class="font-medium text-gray-600 dark:text-gray-400">TensorFlow</span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-cloud" class="h-6 w-6 text-green-500" />
              <span class="font-medium text-gray-600 dark:text-gray-400">PyTorch</span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-globe-alt" class="h-6 w-6 text-orange-500" />
              <span class="font-medium text-gray-600 dark:text-gray-400">Nuxt.js</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Analytics Dashboard Section -->
    <section class="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            Analytics Dashboard
          </h2>
          <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Comprehensive insights from mobile dataset analysis powered by advanced machine learning
            models
          </p>
        </div>

        <!-- Stats Cards Grid -->
        <div class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <UCard class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Models</h3>
              <UIcon name="i-heroicons-cube" class="h-5 w-5 text-purple-500" />
            </div>
            <div class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">24</div>
            <div class="text-sm text-green-600 dark:text-green-400">+12% from last month</div>
          </UCard>

          <UCard class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Dataset Size</h3>
              <UIcon name="i-heroicons-server-stack" class="h-5 w-5 text-blue-500" />
            </div>
            <div class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">2.4M</div>
            <div class="text-sm text-green-600 dark:text-green-400">+8% new records</div>
          </UCard>

          <UCard class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Accuracy</h3>
              <UIcon name="i-heroicons-chart-bar" class="h-5 w-5 text-green-500" />
            </div>
            <div class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">94.7%</div>
            <div class="text-sm text-green-600 dark:text-green-400">+2.1% improvement</div>
          </UCard>

          <UCard class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</h3>
              <UIcon name="i-heroicons-users" class="h-5 w-5 text-orange-500" />
            </div>
            <div class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">573</div>
            <div class="text-sm text-green-600 dark:text-green-400">+15% this hour</div>
          </UCard>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <UCard
            class="group border-0 bg-gradient-to-br from-purple-50 to-purple-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:from-purple-900/20 dark:to-purple-800/20"
          >
            <div class="mb-4 flex items-center gap-4">
              <div class="rounded-lg bg-purple-500 p-3 text-white">
                <UIcon name="i-heroicons-chart-bar" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Enterprise</p>
              </div>
            </div>
            <p class="mb-4 text-gray-600 dark:text-gray-300">
              View comprehensive analytics and insights from mobile dataset analysis with real-time
              metrics and performance tracking.
            </p>
            <UButton
              variant="outline"
              size="sm"
              class="transition-colors group-hover:bg-purple-500 group-hover:text-white"
            >
              Explore Dashboard
              <UIcon name="i-heroicons-arrow-right" class="ml-2 h-4 w-4" />
            </UButton>
          </UCard>

          <UCard
            class="group border-0 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:from-blue-900/20 dark:to-blue-800/20"
          >
            <div class="mb-4 flex items-center gap-4">
              <div class="rounded-lg bg-blue-500 p-3 text-white">
                <UIcon name="i-heroicons-cog-6-tooth" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Model Performance
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">AI/ML</p>
              </div>
            </div>
            <p class="mb-4 text-gray-600 dark:text-gray-300">
              Monitor and analyze deep learning model performance metrics with advanced
              visualization and optimization tools.
            </p>
            <UButton
              variant="outline"
              size="sm"
              class="transition-colors group-hover:bg-blue-500 group-hover:text-white"
            >
              View Performance
              <UIcon name="i-heroicons-arrow-right" class="ml-2 h-4 w-4" />
            </UButton>
          </UCard>

          <UCard
            class="group border-0 bg-gradient-to-br from-green-50 to-green-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:from-green-900/20 dark:to-green-800/20"
          >
            <div class="mb-4 flex items-center gap-4">
              <div class="rounded-lg bg-green-500 p-3 text-white">
                <UIcon name="i-heroicons-presentation-chart-line" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Data Visualization
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Analytics</p>
              </div>
            </div>
            <p class="mb-4 text-gray-600 dark:text-gray-300">
              Interactive charts and visualizations for better data understanding with
              MATLAB-powered insights and predictions.
            </p>
            <UButton
              variant="outline"
              size="sm"
              class="transition-colors group-hover:bg-green-500 group-hover:text-white"
            >
              Explore Visualizations
              <UIcon name="i-heroicons-arrow-right" class="ml-2 h-4 w-4" />
            </UButton>
          </UCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// Page meta fallback
onMounted(() => {
  document.title = 'Home - MATLAB Deep Learning & Mobile Dataset Analysis';
  const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  const content =
    'Explore deep learning models, analyze mobile phone datasets, and discover insights with MATLAB and modern web technologies';
  if (existing) existing.content = content;
  else {
    const m = document.createElement('meta');
    m.name = 'description';
    m.content = content;
    document.head.appendChild(m);
  }
});
</script>

<style scoped>
/* Additional styles can be added here if needed */
</style>
