<template>
  <div class="min-h-screen bg-background">
    <!-- Modern Hero Section -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 sm:py-20 lg:py-28"
    >
      <!-- Decorative elements -->
      <div class="absolute top-20 right-20 w-4 h-4 bg-yellow-400 rounded-full opacity-60"></div>
      <div
        class="absolute top-32 right-32 w-3 h-3 bg-purple-400 rounded-sm transform rotate-45 opacity-60"
      ></div>
      <div class="absolute top-40 right-16 w-2 h-8 bg-purple-500 opacity-60"></div>
      <div class="absolute top-48 right-24 w-6 h-2 bg-yellow-400 opacity-60"></div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <!-- Hero Content -->
          <div class="text-center lg:text-left">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6"
            >
              <UIcon name="i-heroicons-cpu-chip" class="w-4 h-4" />
              MATLAB Deep Learning Platform
            </div>

            <h1
              class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
            >
              Advanced AI Analytics
              <br class="hidden sm:block" />
              <span class="text-purple-600 dark:text-purple-400">for Mobile Datasets</span>
            </h1>

            <p
              class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Harness the power of MATLAB's deep learning capabilities to analyze mobile phone
              datasets, extract meaningful insights, and build predictive models with modern web
              technologies.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <UButton size="lg" color="purple" variant="solid" class="font-semibold">
                <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 mr-2" />
                Explore Analytics
              </UButton>
              <UButton size="lg" variant="outline" class="font-semibold">
                <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 mr-2" />
                Model Performance
              </UButton>
            </div>
          </div>

          <!-- AI Dashboard Mockup -->
          <div class="relative mt-8 lg:mt-0">
            <div
              class="relative bg-gray-900 rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 max-w-md mx-auto lg:max-w-none"
            >
              <div class="text-white mb-4">
                <div class="text-sm text-gray-400 mb-1">Neural Network Status</div>
                <div class="text-xs text-gray-500">MATLAB Deep Learning</div>
              </div>

              <!-- Neural Network Visualization -->
              <div class="grid grid-cols-8 gap-1 mb-4">
                <div
                  v-for="i in 64"
                  :key="i"
                  :class="[
                    'w-3 h-3 rounded-sm',
                    Math.random() > 0.6
                      ? Math.random() > 0.5
                        ? 'bg-purple-500'
                        : 'bg-yellow-400'
                      : 'bg-gray-700',
                  ]"
                ></div>
              </div>

              <div class="flex justify-between items-center text-white text-sm">
                <div>
                  <div class="mb-1">Model: CNN-LSTM</div>
                  <div class="text-gray-400 text-xs">Status: Training</div>
                </div>
                <div class="text-right">
                  <div class="mb-1">Accuracy: 94.7%</div>
                  <div class="text-gray-400 text-xs">Epoch: 127/200</div>
                </div>
              </div>
            </div>

            <!-- Floating elements -->
            <div
              class="absolute -top-4 -left-4 w-8 h-8 bg-purple-400 rounded-lg transform rotate-45"
            ></div>
            <div class="absolute -bottom-4 -right-4 w-6 h-6 bg-yellow-400 rounded-full"></div>
            <div class="absolute top-1/2 -right-8 w-4 h-12 bg-purple-500 rounded"></div>
          </div>
        </div>

        <!-- Trust indicators -->
        <div class="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-cpu-chip" class="w-6 h-6 text-purple-500" />
              <span class="text-gray-600 dark:text-gray-400 font-medium">MATLAB</span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-blue-500" />
              <span class="text-gray-600 dark:text-gray-400 font-medium">TensorFlow</span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-cloud" class="w-6 h-6 text-green-500" />
              <span class="text-gray-600 dark:text-gray-400 font-medium">PyTorch</span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-globe-alt" class="w-6 h-6 text-orange-500" />
              <span class="text-gray-600 dark:text-gray-400 font-medium">Nuxt.js</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Analytics Dashboard Section -->
    <section class="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Analytics Dashboard
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive insights from mobile dataset analysis powered by advanced machine learning
            models
          </p>
        </div>

        <!-- Stats Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <UCard class="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Models</h3>
              <UIcon name="i-heroicons-cube" class="w-5 h-5 text-purple-500" />
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">24</div>
            <div class="text-sm text-green-600 dark:text-green-400">+12% from last month</div>
          </UCard>

          <UCard class="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Dataset Size</h3>
              <UIcon name="i-heroicons-server-stack" class="w-5 h-5 text-blue-500" />
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">2.4M</div>
            <div class="text-sm text-green-600 dark:text-green-400">+8% new records</div>
          </UCard>

          <UCard class="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Accuracy</h3>
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-green-500" />
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">94.7%</div>
            <div class="text-sm text-green-600 dark:text-green-400">+2.1% improvement</div>
          </UCard>

          <UCard class="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</h3>
              <UIcon name="i-heroicons-users" class="w-5 h-5 text-orange-500" />
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">573</div>
            <div class="text-sm text-green-600 dark:text-green-400">+15% this hour</div>
          </UCard>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UCard
            class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 rounded-lg bg-purple-500 text-white">
                <UIcon name="i-heroicons-chart-bar" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Enterprise</p>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              View comprehensive analytics and insights from mobile dataset analysis with real-time
              metrics and performance tracking.
            </p>
            <UButton
              variant="outline"
              size="sm"
              class="group-hover:bg-purple-500 group-hover:text-white transition-colors"
            >
              Explore Dashboard
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
            </UButton>
          </UCard>

          <UCard
            class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 rounded-lg bg-blue-500 text-white">
                <UIcon name="i-heroicons-cog-6-tooth" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Model Performance
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">AI/ML</p>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Monitor and analyze deep learning model performance metrics with advanced
              visualization and optimization tools.
            </p>
            <UButton
              variant="outline"
              size="sm"
              class="group-hover:bg-blue-500 group-hover:text-white transition-colors"
            >
              View Performance
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
            </UButton>
          </UCard>

          <UCard
            class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 rounded-lg bg-green-500 text-white">
                <UIcon name="i-heroicons-presentation-chart-line" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Data Visualization
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Analytics</p>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Interactive charts and visualizations for better data understanding with
              MATLAB-powered insights and predictions.
            </p>
            <UButton
              variant="outline"
              size="sm"
              class="group-hover:bg-green-500 group-hover:text-white transition-colors"
            >
              Explore Visualizations
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
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
