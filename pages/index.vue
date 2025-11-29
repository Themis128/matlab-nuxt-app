<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Mobile Finder</h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore deep learning models, analyze mobile phone datasets, and discover insights with MATLAB and modern
            web technologies.
          </p>
        </div>

        <!-- Quick Action Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <NuxtLink to="/demo" class="block">
            <UCard class="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-center p-6">
                <UIcon name="i-heroicons-beaker" class="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 class="text-xl font-semibold mb-2">AI Predictions Demo</h3>
                <p class="text-gray-600 dark:text-gray-400">
                  Test enhanced AI models for price, RAM, battery, and brand predictions with 95%+ accuracy.
                </p>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink to="/dashboard" class="block">
            <UCard class="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-center p-6">
                <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 class="text-xl font-semibold mb-2">Model Performance Dashboard</h3>
                <p class="text-gray-600 dark:text-gray-400">
                  View comprehensive performance metrics, R² scores, and improvement tracking for all models.
                </p>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink to="/explore" class="block">
            <UCard class="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-center p-6">
                <UIcon name="i-heroicons-magnifying-glass" class="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 class="text-xl font-semibold mb-2">Dataset Explorer</h3>
                <p class="text-gray-600 dark:text-gray-400">
                  Explore the mobile phones dataset with interactive statistics, visualizations, and insights.
                </p>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink to="/search" class="block">
            <UCard class="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-center p-6">
                <UIcon name="i-heroicons-cursor-arrow-rays" class="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 class="text-xl font-semibold mb-2">Smart Search</h3>
                <p class="text-gray-600 dark:text-gray-400">
                  Search and filter mobile phones by specifications, price range, and brand preferences.
                </p>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink to="/compare" class="block">
            <UCard class="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-center p-6">
                <UIcon name="i-heroicons-squares-2x2" class="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 class="text-xl font-semibold mb-2">Model Comparison</h3>
                <p class="text-gray-600 dark:text-gray-400">
                  Compare multiple mobile phones side-by-side with detailed specifications and predictions.
                </p>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink to="/recommendations" class="block">
            <UCard class="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <div class="text-center p-6">
                <UIcon name="i-heroicons-light-bulb" class="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 class="text-xl font-semibold mb-2">Smart Recommendations</h3>
                <p class="text-gray-600 dark:text-gray-400">
                  Get personalized mobile phone recommendations based on your budget and preferences.
                </p>
              </div>
            </UCard>
          </NuxtLink>
        </div>

        <!-- Key Features Section -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            🚀 Enhanced AI Models - Exceptional Performance
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UCard>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600 mb-2">98.24%</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Price Prediction R²</div>
                <div class="text-xs text-green-600 font-semibold">+20.7% improvement</div>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600 mb-2">95.16%</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">RAM Prediction R²</div>
                <div class="text-xs text-blue-600 font-semibold">+43.6% improvement</div>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600 mb-2">94.77%</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Battery Prediction R²</div>
                <div class="text-xs text-purple-600 font-semibold">+26.6% improvement</div>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600 mb-2">65.22%</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Brand Classification</div>
                <div class="text-xs text-orange-600 font-semibold">+9.6% improvement</div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="text-center">
          <UButton to="/demo" size="xl" color="primary" icon="i-heroicons-rocket-launch" class="mr-4">
            Try AI Predictions Demo
          </UButton>
          <UButton to="/api-docs" size="xl" variant="outline" icon="i-heroicons-document-text">
            View API Documentation
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Set page title
useHead({
  title: 'Mobile Finder - MATLAB Deep Learning & Mobile Dataset Analysis',
  meta: [
    { name: 'description', content: 'Explore deep learning models, analyze mobile phone datasets, and discover insights with MATLAB and modern web technologies' }
  ]
})
</script>
