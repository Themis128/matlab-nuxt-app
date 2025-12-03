<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto container-responsive">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-responsive-lg font-bold text-gray-900 dark:text-white gradient-text">
              Explore Dataset
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Discover insights from 900+ mobile phone models
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {{ new Date().toLocaleDateString() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto container-responsive section-spacing">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Models</p>
              <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">927</p>
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Brands</p>
              <p class="text-3xl font-bold text-green-600 dark:text-green-400">97</p>
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Price Range</p>
              <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">$50 - $2,199</p>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Years</p>
              <p class="text-3xl font-bold text-orange-600 dark:text-orange-400">2014 - 2024</p>
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <input
              type="text"
              placeholder="Search models, brands, or specifications..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="flex gap-2">
            <select
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Brands</option>
              <option value="apple">Apple</option>
              <option value="samsung">Samsung</option>
              <option value="google">Google</option>
              <option value="oneplus">OnePlus</option>
            </select>
            <select
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Price Range</option>
              <option value="0-200">$0 - $200</option>
              <option value="200-500">$200 - $500</option>
              <option value="500-1000">$500 - $1000</option>
              <option value="1000+">$1000+</option>
            </select>
            <button
              class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <!-- Popular Models Grid -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Popular Models</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Model Card 1 -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">iPhone 16 Pro</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Apple</p>
              </div>
              <span class="text-2xl font-bold text-green-600 dark:text-green-400">$1,199</span>
            </div>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div class="flex justify-between">
                <span>RAM:</span>
                <span>8GB</span>
              </div>
              <div class="flex justify-between">
                <span>Storage:</span>
                <span>128GB</span>
              </div>
              <div class="flex justify-between">
                <span>Battery:</span>
                <span>3,274mAh</span>
              </div>
              <div class="flex justify-between">
                <span>Screen:</span>
                <span>6.1"</span>
              </div>
            </div>
            <NuxtLink
              to="/model/iPhone-16-Pro-128GB"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              View Details
            </NuxtLink>
          </div>

          <!-- Model Card 2 -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Galaxy S24 Ultra
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Samsung</p>
              </div>
              <span class="text-2xl font-bold text-green-600 dark:text-green-400">$1,299</span>
            </div>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div class="flex justify-between">
                <span>RAM:</span>
                <span>12GB</span>
              </div>
              <div class="flex justify-between">
                <span>Storage:</span>
                <span>256GB</span>
              </div>
              <div class="flex justify-between">
                <span>Battery:</span>
                <span>5,000mAh</span>
              </div>
              <div class="flex justify-between">
                <span>Screen:</span>
                <span>6.8"</span>
              </div>
            </div>
            <NuxtLink
              to="/model/Samsung-Galaxy-S24-Ultra"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              View Details
            </NuxtLink>
          </div>

          <!-- Model Card 3 -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Pixel 8 Pro</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Google</p>
              </div>
              <span class="text-2xl font-bold text-green-600 dark:text-green-400">$999</span>
            </div>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div class="flex justify-between">
                <span>RAM:</span>
                <span>12GB</span>
              </div>
              <div class="flex justify-between">
                <span>Storage:</span>
                <span>128GB</span>
              </div>
              <div class="flex justify-between">
                <span>Battery:</span>
                <span>5,050mAh</span>
              </div>
              <div class="flex justify-between">
                <span>Screen:</span>
                <span>6.7"</span>
              </div>
            </div>
            <NuxtLink
              to="/model/Google-Pixel-8-Pro"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              View Details
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Brand Distribution -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Brand Distribution</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div class="text-center">
            <div
              class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2"
            >
              <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">A</span>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Apple</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">23 models</p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2"
            >
              <span class="text-2xl font-bold text-green-600 dark:text-green-400">S</span>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Samsung</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">156 models</p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2"
            >
              <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">X</span>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Xiaomi</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">89 models</p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2"
            >
              <span class="text-2xl font-bold text-orange-600 dark:text-orange-400">O</span>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Oppo</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">67 models</p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-2"
            >
              <span class="text-2xl font-bold text-red-600 dark:text-red-400">V</span>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Vivo</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">45 models</p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-2"
            >
              <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">R</span>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">Realme</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">34 models</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-center">
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
            to="/search"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Advanced Search
          </NuxtLink>
          <NuxtLink
            to="/demo"
            class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            AI Predictions
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // Page meta
  useHead({
    title: 'Explore Mobile Dataset - Mobile Finder',
    meta: [
      {
        name: 'description',
        content:
          'Explore our comprehensive dataset of 900+ mobile phone models. Search by brand, price, specifications, and discover detailed insights.',
      },
    ],
  })
</script>
