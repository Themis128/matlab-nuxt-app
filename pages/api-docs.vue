<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-3">API Documentation</h1>
          <p class="text-xl text-gray-600 dark:text-gray-400">
            Complete reference for all API endpoints
          </p>
        </div>

        <!-- Server Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <h2 class="text-xl font-semibold">Nuxt Frontend Server</h2>
              </div>
            </template>
            <div class="p-6">
              <div class="space-y-2">
                <p><strong>Base URL:</strong> {{ nuxtBaseUrl }}</p>
                <p><strong>Status:</strong> <span class="text-green-600">Running</span></p>
                <p><strong>Framework:</strong> Nuxt 4 + Nitro</p>
                <p><strong>Endpoints:</strong> SSR routes and API routes</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-server" class="w-6 h-6" />
                <h2 class="text-xl font-semibold">Python API Server</h2>
              </div>
            </template>
            <div class="p-6">
              <div class="space-y-2">
                <p><strong>Base URL:</strong> {{ pythonBaseUrl }}</p>
                <p>
                  <strong>Status:</strong>
                  <span
                    :class="pythonApiStatus === 'healthy' ? 'text-green-600' : 'text-red-600'"
                    >{{ pythonApiStatus }}</span
                  >
                </p>
                <p><strong>Framework:</strong> FastAPI + Uvicorn</p>
                <p>
                  <strong>Documentation:</strong>
                  <a
                    :href="`${pythonBaseUrl}/docs`"
                    target="_blank"
                    class="text-blue-600 hover:underline"
                    >Swagger UI</a
                  >
                  |
                  <a
                    :href="`${pythonBaseUrl}/redoc`"
                    target="_blank"
                    class="text-blue-600 hover:underline"
                    >ReDoc</a
                  >
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Python API Endpoints -->
        <UCard class="mb-8">
          <template #header>
            <h2 class="text-2xl font-semibold">Python API Endpoints</h2>
          </template>
          <div class="p-6">
            <div class="space-y-6">
              <!-- Health Check -->
              <div>
                <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
                  <UBadge color="green" size="sm">GET</UBadge>
                  Health Check
                </h3>
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <code class="text-sm">{{ pythonBaseUrl }}/</code><br />
                  <code class="text-sm">{{ pythonBaseUrl }}/health</code>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Check API health status
                  </p>
                </div>
              </div>

              <!-- Dataset Endpoints -->
              <div>
                <h3 class="text-lg font-semibold mb-3">Dataset API Endpoints</h3>
                <div class="space-y-4">
                  <!-- Models by Price -->
                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="blue" size="sm">GET</UBadge>
                      <code class="text-sm font-semibold">/api/dataset/models-by-price</code>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Get mobile phone models within a price range
                    </p>
                    <div class="text-xs text-gray-500">
                      <strong>Parameters:</strong> price (float), tolerance (float, default 0.2),
                      maxResults (int, default 100)
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong>
                      {{
                        pythonBaseUrl
                      }}/api/dataset/models-by-price?price=500&tolerance=0.2&maxResults=10
                    </div>
                  </div>

                  <!-- Dataset Stats -->
                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="blue" size="sm">GET</UBadge>
                      <code class="text-sm font-semibold">/api/dataset/stats</code>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Get basic statistics about the dataset
                    </p>
                    <div class="text-xs text-gray-500">
                      <strong>Example:</strong> {{ pythonBaseUrl }}/api/dataset/stats
                    </div>
                  </div>

                  <!-- Companies -->
                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="blue" size="sm">GET</UBadge>
                      <code class="text-sm font-semibold">/api/dataset/companies</code>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Get list of all companies/brands in the dataset
                    </p>
                    <div class="text-xs text-gray-500">
                      <strong>Example:</strong> {{ pythonBaseUrl }}/api/dataset/companies
                    </div>
                  </div>

                  <!-- Search -->
                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="blue" size="sm">GET</UBadge>
                      <code class="text-sm font-semibold">/api/dataset/search</code>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Advanced search with multiple filters
                    </p>
                    <div class="text-xs text-gray-500">
                      <strong>Parameters:</strong> brand[], minPrice, maxPrice, minRam, maxRam,
                      minBattery, maxBattery, minScreen, maxScreen, year[], minStorage, maxStorage,
                      processor, sortBy, sortOrder, limit, offset
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong>
                      {{
                        pythonBaseUrl
                      }}/api/dataset/search?brand=Samsung&minPrice=500&maxPrice=1000&limit=20
                    </div>
                  </div>

                  <!-- Compare -->
                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="purple" size="sm">POST</UBadge>
                      <code class="text-sm font-semibold">/api/dataset/compare</code>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Compare multiple models side by side
                    </p>
                    <div class="text-xs text-gray-500">
                      <strong>Body:</strong> {"modelNames": ["iPhone 16", "Galaxy S24"]}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      <strong>Example:</strong> POST {{ pythonBaseUrl }}/api/dataset/compare
                    </div>
                  </div>
                </div>
              </div>

              <!-- Prediction Endpoints -->
              <div>
                <h3 class="text-lg font-semibold mb-3">Prediction API Endpoints</h3>
                <div class="space-y-4">
                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="green" size="sm">POST</UBadge>
                      <code class="text-sm font-semibold">/api/predict/price</code>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Predict mobile phone price based on specifications
                    </p>
                    <div class="text-xs text-gray-500">
                      <strong>Body:</strong> {ram, battery, screen, weight, year, company,
                      front_camera?, back_camera?, processor?, storage?}
                    </div>
                  </div>

                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="green" size="sm">POST</UBadge>
                      <code class="text-sm font-semibold">/api/predict/ram</code>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Predict RAM capacity based on specifications
                    </p>
                    <div class="text-xs text-gray-500">
                      <strong>Body:</strong> {battery, screen, weight, year, price, company,
                      front_camera?, back_camera?, processor?, storage?}
                    </div>
                  </div>

                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="green" size="sm">POST</UBadge>
                      <code class="text-sm font-semibold">/api/predict/battery</code>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Predict battery capacity based on specifications
                    </p>
                    <div class="text-xs text-gray-500">
                      <strong>Body:</strong> {ram, screen, weight, year, price, company,
                      front_camera?, back_camera?, processor?, storage?}
                    </div>
                  </div>

                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="green" size="sm">POST</UBadge>
                      <code class="text-sm font-semibold">/api/predict/brand</code>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Predict brand based on specifications
                    </p>
                    <div class="text-xs text-gray-500">
                      <strong>Body:</strong> {ram, battery, screen, weight, year, price,
                      front_camera?, back_camera?, processor?, storage?}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Price API Endpoints -->
              <div>
                <h3 class="text-lg font-semibold mb-3">Price API Endpoints</h3>
                <div class="space-y-4">
                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="orange" size="sm">GET</UBadge>
                      <code class="text-sm font-semibold">/api/prices/{country}</code>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Get price information for a specific country
                    </p>
                    <div class="text-xs text-gray-500">
                      <strong>Path:</strong> country (greece, usa, europe, etc.)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Nuxt API Routes -->
        <UCard class="mb-8">
          <template #header>
            <h2 class="text-2xl font-semibold">Nuxt API Routes</h2>
          </template>
          <div class="p-6">
            <div class="space-y-4">
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <UBadge color="blue" size="sm">GET</UBadge>
                  <code class="text-sm font-semibold">/api/find-closest-model</code>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Find the closest matching model based on specifications
                </p>
                <div class="text-xs text-gray-500">
                  <strong>Parameters:</strong> Query parameters for model specifications
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Frontend Routes -->
        <UCard>
          <template #header>
            <h2 class="text-2xl font-semibold">Frontend Routes</h2>
          </template>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <h3 class="font-semibold">Public Pages</h3>
                <ul class="space-y-1 text-sm">
                  <li><code>/</code> - Home/Dashboard</li>
                  <li><code>/search</code> - Advanced Search</li>
                  <li><code>/compare</code> - Model Comparison</li>
                  <li><code>/explore</code> - Data Exploration</li>
                  <li><code>/demo</code> - AI Predictions Demo</li>
                  <li><code>/recommendations</code> - Price-based Recommendations</li>
                  <li><code>/api-docs</code> - API Documentation (this page)</li>
                </ul>
              </div>
              <div class="space-y-2">
                <h3 class="font-semibold">Dynamic Routes</h3>
                <ul class="space-y-1 text-sm">
                  <li><code>/model/[name]</code> - Individual Model Details</li>
                  <li><code>/model/[slug]</code> - Model Details (alternative)</li>
                </ul>
                <h3 class="font-semibold mt-4">Development Tools</h3>
                <ul class="space-y-1 text-sm">
                  <li><code>/_nuxt/</code> - Nuxt assets</li>
                  <li><code>/__nuxt_devtools__/</code> - DevTools</li>
                </ul>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const nuxtBaseUrl = 'http://localhost:3001'
const pythonBaseUrl = 'http://localhost:8000'
const pythonApiStatus = ref('checking...')

// Check Python API health
onMounted(async () => {
  try {
    const response = await fetch(`${pythonBaseUrl}/health`)
    if (response.ok) {
      pythonApiStatus.value = 'healthy'
    } else {
      pythonApiStatus.value = 'unhealthy'
    }
  } catch {
    pythonApiStatus.value = 'unreachable'
  }
})

// Set page metadata
useHead({
  title: 'API Documentation - Mobile Finder',
  meta: [
    {
      name: 'description',
      content: 'Complete API documentation for all endpoints in the Mobile Finder application',
    },
  ],
})
</script>
