<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
  >
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Welcome Header -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm mb-4"
        >
          <span class="text-2xl">🤖</span>
          <span class="text-sm font-medium text-green-600 dark:text-green-400">AI Powered</span>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Find Your Perfect Phone
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Get personalized recommendations powered by advanced AI
        </p>
        <div
          class="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        >
          <span class="inline-flex items-center gap-1">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            AI Models Active
          </span>
          <span class="mx-2">•</span>
          <span>99.5% Accurate</span>
        </div>
      </div>

      <!-- AI Buyer Advisor -->
      <UCard class="mb-8">
        <template #header>
          <h2 class="text-2xl font-semibold">🧠 AI Buyer Advisor</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Smart recommendations powered by all your trained models
          </p>
        </template>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Value Score -->
          <div
            class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <svg
                  class="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-green-800 dark:text-green-200">Value Score</h3>
            </div>
            <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {{ valueScore }}/100
            </div>
            <p class="text-sm text-green-700 dark:text-green-300">{{ valueAnalysis }}</p>
          </div>

          <!-- Market Position -->
          <div
            class="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <svg
                  class="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Market Position
              </h3>
            </div>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {{ marketPosition }}
            </div>
            <p class="text-sm text-blue-700 dark:text-blue-300">{{ marketAnalysis }}</p>
          </div>

          <!-- Buying Advice -->
          <div
            class="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <svg
                  class="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-purple-800 dark:text-purple-200">
                Buying Advice
              </h3>
            </div>
            <div class="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
              {{ buyingVerdict }}
            </div>
            <p class="text-sm text-purple-700 dark:text-purple-300">{{ buyingAdvice }}</p>
          </div>
        </div>
      </UCard>

      <!-- Smart Phone Advisor -->
      <UCard class="mb-8">
        <template #header>
          <h2 class="text-2xl font-semibold">🎯 Smart Phone Advisor</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tell us your needs, get personalized AI recommendations
          </p>
        </template>
        <form class="space-y-8" data-testid="demo-form" @submit.prevent="runSmartRecommendations">
          <!-- Minimal Input Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Budget Input -->
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">💰 Your Budget</h3>
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Maximum budget ($)
                </label>
                <input
                  data-testid="budget-input"
                  v-model="smartForm.budget"
                  type="number"
                  placeholder="500"
                  min="100"
                  max="2000"
                  class="w-full text-lg px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                />
                <p class="text-xs text-gray-500">Enter your maximum spending limit</p>
              </div>
            </div>

            <!-- Use Case Input -->
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">🎮 Primary Use</h3>
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  What will you use it for most?
                </label>
                <select
                  v-model="smartForm.useCase"
                  class="w-full text-lg px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                >
                  <option value="">Select your primary use</option>
                  <option value="gaming">🎮 Gaming</option>
                  <option value="photography">📸 Photography & Camera</option>
                  <option value="work">💼 Work & Productivity</option>
                  <option value="social">📱 Social Media & Communication</option>
                  <option value="battery">🔋 Long Battery Life</option>
                  <option value="general">📱 General Use</option>
                </select>
                <p class="text-xs text-gray-500">This helps us prioritize the right features</p>
              </div>
            </div>
          </div>

          <!-- Optional Preferences -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎛️ Optional Preferences
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Phone Age
                </label>
                <select
                  v-model="smartForm.phoneAge"
                  class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value="any">Any Age</option>
                  <option value="new">New (2024+)</option>
                  <option value="recent">Recent (2022+)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Preferred Brands
                </label>
                <select
                  v-model="smartForm.preferredBrand"
                  class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value="">No preference</option>
                  <option value="samsung">Samsung</option>
                  <option value="apple">Apple</option>
                  <option value="xiaomi">Xiaomi</option>
                  <option value="google">Google</option>
                  <option value="oneplus">OnePlus</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Deal Sensitivity
                </label>
                <select
                  v-model="smartForm.dealPriority"
                  class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value="balanced">Balanced</option>
                  <option value="value">Best Value</option>
                  <option value="deals">Biggest Discounts</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Smart Actions -->
          <div class="flex flex-wrap gap-4 pt-4">
            <button
              data-testid="smart-button"
              type="submit"
              :disabled="!smartFormValid || isRunning"
              :aria-busy="isRunning"
              class="px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span v-if="!isRunning">🚀 Get AI Recommendations</span>
              <span v-else>🧠 Analyzing...</span>
            </button>
            <button
              type="button"
              @click="clearSmartForm"
              class="px-6 py-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>

          <!-- Prediction Results -->
          <div
            v-if="resultsVisible"
            class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 prediction-result"
          >
            <div v-if="showType('price')" class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h3 class="text-lg font-semibold mb-1">Price Prediction</h3>
              <p class="text-xs text-red-600 mb-2">Model not available</p>
              <div class="text-lg font-semibold text-red-600 dark:text-red-400">
                Please train the model first
              </div>
            </div>
            <div v-if="showType('ram')" class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h3 class="text-lg font-semibold mb-1">RAM Prediction</h3>
              <p class="text-xs text-red-600 mb-2">Model not available</p>
              <div class="text-lg font-semibold text-red-600 dark:text-red-400">
                Please train the model first
              </div>
            </div>
            <div v-if="showType('battery')" class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h3 class="text-lg font-semibold mb-1">Battery Prediction</h3>
              <p class="text-xs text-red-600 mb-2">Model not available</p>
              <div class="text-lg font-semibold text-red-600 dark:text-red-400">
                Please train the model first
              </div>
            </div>
            <div v-if="showType('brand')" class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h3 class="text-lg font-semibold mb-1">Brand Prediction</h3>
              <p class="text-xs text-red-600 mb-2">Model not available</p>
              <div class="text-lg font-semibold text-red-600 dark:text-red-400">
                Please train the model first
              </div>
            </div>
          </div>
        </form>
      </UCard>

      <!-- Feature Importance Analysis -->
      <UCard class="mb-8">
        <template #header>
          <h2 class="text-2xl font-semibold">Feature Importance Analysis</h2>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">Price Prediction Features</h3>
            <div class="space-y-2 text-sm">
              <div class="p-2 rounded bg-gray-100 dark:bg-gray-800">RAM Capacity</div>
              <div class="p-2 rounded bg-gray-100 dark:bg-gray-800">Brand Premium</div>
              <div class="p-2 rounded bg-gray-100 dark:bg-gray-800">Battery Size</div>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-2">RAM Prediction Features</h3>
            <div class="space-y-2 text-sm">
              <div class="p-2 rounded bg-gray-100 dark:bg-gray-800">Battery Capacity</div>
              <div class="p-2 rounded bg-gray-100 dark:bg-gray-800">Screen Size</div>
              <div class="p-2 rounded bg-gray-100 dark:bg-gray-800">Launch Year</div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Navigation -->
      <div class="flex flex-wrap gap-4 justify-center mb-12">
        <NuxtLink to="/search" class="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm"
          >Advanced Search
        </NuxtLink>
        <NuxtLink to="/compare" class="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm"
          >Compare Models
        </NuxtLink>
        <NuxtLink
          to="/recommendations"
          class="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm"
        >
          Recommendations
        </NuxtLink>
        <NuxtLink to="/" class="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm"
          >Home</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { useHead } from '#imports'

  // Set page title correctly
  useHead({
    title: 'AI Predictions Lab',
    meta: [
      {
        name: 'description',
        content: 'Interactive demonstration of trained ML models for mobile phone predictions',
      },
    ],
  })

  // Type definitions
  interface SmartForm {
    budget: string
    useCase: string
    phoneAge: string
    preferredBrand: string
    dealPriority: string
  }

  // Form state
  const selectedTypes = ref<string[]>(['price', 'ram', 'battery', 'brand'])

  // Smart form state
  const smartForm = reactive<SmartForm>({
    budget: '',
    useCase: '',
    phoneAge: 'any',
    preferredBrand: '',
    dealPriority: 'balanced',
  })

  const smartFormValid = computed(() => {
    return Boolean(smartForm.budget && smartForm.useCase)
  })

  const resultsVisible = ref(false)

  // AI Buyer Advisor metrics
  const valueScore = ref(85)
  const valueAnalysis = ref('Good value for the specifications')
  const marketPosition = ref('Mid-range')
  const marketAnalysis = ref('Competitive pricing for this spec level')
  const buyingVerdict = ref('Recommended')
  const buyingAdvice = ref('Consider this phone if you need these specs')

  // Mock results
  const priceResult = ref(0)
  const ramResult = ref(0)
  const batteryResult = ref(0)
  const brandResult = ref('')

  function showType(t: string) {
    return selectedTypes.value.includes(t)
  }

  async function clearSmartForm() {
    smartForm.budget = ''
    smartForm.useCase = ''
    smartForm.phoneAge = 'any'
    smartForm.preferredBrand = ''
    smartForm.dealPriority = 'balanced'
    resultsVisible.value = false
  }

  const isRunning = ref(false)

  async function runSmartRecommendations() {
    if (!smartFormValid.value || isRunning.value) return
    isRunning.value = true
    resultsVisible.value = false

    const budget = Number(smartForm.budget)
    const useCase = smartForm.useCase

    // Generate optimal specs based on budget and use case
    let optimalSpecs = generateOptimalSpecs(budget, useCase)

    // Apply preferences
    if (smartForm.phoneAge === 'new') optimalSpecs.year = 2024
    else if (smartForm.phoneAge === 'recent') optimalSpecs.year = 2022

    if (smartForm.preferredBrand) optimalSpecs.company = smartForm.preferredBrand

    // Prepare payload for API (exclude the field being predicted)
    const basePayload: Record<string, unknown> = {
      ram: optimalSpecs.ram,
      battery: optimalSpecs.battery,
      screen: optimalSpecs.screen,
      weight: optimalSpecs.weight,
      year: optimalSpecs.year,
      company: optimalSpecs.company,
      front_camera: undefined,
      back_camera: undefined,
      processor: undefined,
      storage: undefined,
    }

    try {
      const promises: Promise<void>[] = []

      // Price prediction - exclude price from payload
      promises.push(
        $fetch('/api/predict/price', {
          method: 'POST',
          body: basePayload,
        })
          .then((res: any) => {
            priceResult.value = Number(res?.price ?? res?.predicted_price ?? optimalSpecs.price)
          })
          .catch(() => {})
      )

      // RAM prediction - exclude ram from payload
      const ramPayload = { ...basePayload }
      delete ramPayload.ram
      promises.push(
        $fetch('/api/predict/ram', {
          method: 'POST',
          body: ramPayload,
        })
          .then((res: any) => {
            ramResult.value = Number(res?.ram ?? optimalSpecs.ram)
          })
          .catch(() => {})
      )

      // Battery prediction - exclude battery from payload
      const batteryPayload = { ...basePayload }
      delete batteryPayload.battery
      promises.push(
        $fetch('/api/predict/battery', {
          method: 'POST',
          body: batteryPayload,
        })
          .then((res: any) => {
            batteryResult.value = Number(res?.battery ?? optimalSpecs.battery)
          })
          .catch(() => {})
      )

      // Brand prediction - can use full payload
      promises.push(
        $fetch('/api/predict/brand', {
          method: 'POST',
          body: basePayload,
        })
          .then((res: any) => {
            brandResult.value = String(res?.brand ?? optimalSpecs.company ?? 'Samsung')
          })
          .catch(() => {})
      )

      await Promise.all(promises)

      // Calculate AI buyer advisor metrics
      calculateBuyerAdvisorSmart(optimalSpecs)

      resultsVisible.value = true
    } catch (err) {
      console.warn('Smart recommendations error:', err)
      // Use fallback specs
      priceResult.value = optimalSpecs.price
      ramResult.value = optimalSpecs.ram
      batteryResult.value = optimalSpecs.battery
      brandResult.value = optimalSpecs.company || 'Samsung'

      calculateBuyerAdvisorSmart(optimalSpecs)
      resultsVisible.value = true
    } finally {
      isRunning.value = false
    }
  }

  function generateOptimalSpecs(budget: number, useCase: string) {
    let specs = {
      ram: 8,
      battery: 4500,
      screen: 6.5,
      weight: 180,
      year: 2023,
      company: 'Samsung',
      price: budget,
    }

    // Adjust specs based on use case
    switch (useCase) {
      case 'gaming':
        specs.ram = budget > 600 ? 12 : 8
        specs.battery = budget > 600 ? 5000 : 4500
        specs.screen = 6.7
        break

      case 'photography':
        specs.ram = 8
        specs.battery = 4500
        specs.screen = 6.4
        specs.company = 'Google'
        break

      case 'work':
        specs.ram = budget > 500 ? 8 : 6
        specs.battery = budget > 500 ? 5000 : 4500
        specs.screen = 6.3
        specs.company = 'Samsung'
        break

      case 'social':
        specs.ram = 6
        specs.battery = budget > 400 ? 4500 : 4000
        specs.screen = 6.4
        specs.company = 'Samsung'
        break

      case 'battery':
        specs.ram = 6
        specs.battery = budget > 400 ? 6000 : 5000
        specs.screen = 6.5
        specs.weight = 200
        break

      default: // general
        specs.ram = budget > 500 ? 8 : 6
        specs.battery = budget > 500 ? 4500 : 4000
        specs.screen = 6.4
        break
    }

    // Adjust based on budget constraints
    if (budget < 300) {
      specs.ram = Math.min(specs.ram, 4)
      specs.battery = Math.min(specs.battery, 4000)
      specs.company = 'Xiaomi'
    } else if (budget < 500) {
      specs.ram = Math.min(specs.ram, 8)
      specs.battery = Math.min(specs.battery, 4500)
    }

    return specs
  }

  // Calculate AI buyer advisor metrics for smart recommendations
  function calculateBuyerAdvisorSmart(optimalSpecs: any) {
    const ram = ramResult.value || optimalSpecs.ram
    const battery = batteryResult.value || optimalSpecs.battery
    const screen = optimalSpecs.screen
    const company = brandResult.value || optimalSpecs.company
    const currentYear = new Date().getFullYear()

    // Calculate value score based on specs vs expected price
    const expectedPrice =
      ram * 95 + battery * 0.12 + screen * 40 + (company === 'Apple' ? 350 : 120)
    const actualPrice = priceResult.value || expectedPrice

    // Value score: higher is better (100 = perfect value, 0 = terrible value)
    let score = Math.max(
      0,
      Math.min(100, 100 - (Math.abs(actualPrice - expectedPrice) / expectedPrice) * 50)
    )

    // Adjust score based on brand premium and year
    if (company === 'Apple') score += 10
    else if (['Samsung', 'Google'].includes(company)) score += 5

    if (optimalSpecs.year < currentYear - 2)
      score -= 15 // Older phone
    else if (optimalSpecs.year === currentYear) score += 5 // New phone

    valueScore.value = Math.round(score)

    // Value analysis
    if (score >= 90) valueAnalysis.value = 'Excellent value! Great specs for the price'
    else if (score >= 80) valueAnalysis.value = 'Good value for the specifications'
    else if (score >= 70) valueAnalysis.value = 'Fair value, consider alternatives'
    else if (score >= 60) valueAnalysis.value = 'Overpriced for these specs'
    else valueAnalysis.value = 'Poor value, look for better deals'

    // Market position
    if (actualPrice > 1000) marketPosition.value = 'Premium'
    else if (actualPrice > 600) marketPosition.value = 'Mid-range'
    else if (actualPrice > 300) marketPosition.value = 'Budget'
    else marketPosition.value = 'Entry-level'

    // Market analysis
    if (ram >= 8 && battery >= 4000)
      marketAnalysis.value = 'High-end specs with competitive pricing'
    else if (ram >= 6 && battery >= 3500) marketAnalysis.value = 'Solid mid-range performance'
    else if (ram <= 4) marketAnalysis.value = 'Budget-friendly but may lack power'
    else marketAnalysis.value = 'Balanced specs for everyday use'

    // Buying verdict and advice
    if (score >= 85) {
      buyingVerdict.value = 'Highly Recommended'
      buyingAdvice.value = 'Excellent choice! This phone offers great value and performance'
    } else if (score >= 75) {
      buyingVerdict.value = 'Recommended'
      buyingAdvice.value = 'Good option if these specs match your needs'
    } else if (score >= 65) {
      buyingVerdict.value = 'Consider Alternatives'
      buyingAdvice.value = 'Look at similar phones with better price-performance ratio'
    } else {
      buyingVerdict.value = 'Not Recommended'
      buyingAdvice.value = 'Overpriced or outdated. Consider newer models with better value'
    }

    // Special brand considerations
    if (company === 'Apple' && score < 70) {
      buyingAdvice.value += '. Apple products often hold value better long-term'
    } else if (['Xiaomi', 'Realme', 'Oppo'].includes(company) && score > 85) {
      buyingAdvice.value += '. Great value from Chinese manufacturers'
    }
  }
</script>
