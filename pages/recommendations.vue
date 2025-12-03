<template>
  <div class="min-h-screen bg-background">
    <section
      class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 py-16"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6"
          >
            <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4" />
            Smart Recommendations
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Find Phones by <span class="text-green-600 dark:text-green-400">Your Budget</span>
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get AI-powered recommendations for mobile phones that match your budget and
            requirements.
          </p>
        </div>

        <div class="max-w-2xl mx-auto">
          <UCard class="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div class="space-y-6">
              <div>
                <label class="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  What's your budget range?
                </label>
                <div class="px-4">
                  <URange v-model="budgetRange" :min="100" :max="2000" :step="50" class="mb-4" />
                  <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>${{ budgetRange[0] }}</span>
                    <span>${{ budgetRange[1] }}</span>
                  </div>
                </div>
              </div>

              <div class="flex justify-center">
                <UButton size="lg" color="green" variant="solid" class="font-semibold px-8">
                  <UIcon name="i-heroicons-sparkles" class="w-5 h-5 mr-2" />
                  Get Recommendations
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <section class="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Recommended for You</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Based on your budget of ${{ budgetRange[0] }} - ${{ budgetRange[1] }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UCard
            v-for="phone in recommendations"
            :key="phone.id"
            class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            <div class="relative">
              <img
                :src="phone.image"
                :alt="phone.name"
                class="w-full h-48 object-cover rounded-t-lg"
              />
              <div class="absolute top-4 right-4">
                <UBadge :color="phone.valueScore > 8 ? 'green' : 'yellow'" variant="solid">
                  {{ phone.valueScore }}/10 Value
                </UBadge>
              </div>
            </div>

            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ phone.name }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ phone.brand }}</p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${{ phone.price }}
                  </div>
                  <div class="text-xs text-gray-500">MSRP</div>
                </div>
              </div>

              <p class="text-gray-600 dark:text-gray-300 mb-4">{{ phone.recommendationReason }}</p>

              <div class="flex gap-2">
                <UButton size="sm" color="green" variant="solid" class="flex-1"
                  >View Details</UButton
                >
                <UButton size="sm" variant="outline" class="flex-1">Compare</UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  // Page meta fallback
  onMounted(() => {
    document.title = 'Price Recommendations - MATLAB Analytics'
    const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const content = 'Get AI-powered mobile phone recommendations based on your budget'
    if (existing) existing.content = content
    else {
      const m = document.createElement('meta')
      m.name = 'description'
      m.content = content
      document.head.appendChild(m)
    }
  })

  const budgetRange = ref<any>([300, 800])

  const recommendations = [
    {
      id: 1,
      name: 'Samsung Galaxy A54',
      brand: 'Samsung',
      price: 349,
      image: '/api/placeholder/300/200',
      valueScore: 9,
      recommendationReason: 'Excellent value for money with great camera and battery life.',
    },
    {
      id: 2,
      name: 'Google Pixel 7a',
      brand: 'Google',
      price: 499,
      image: '/api/placeholder/300/200',
      valueScore: 8,
      recommendationReason: 'Outstanding camera performance and pure Android experience.',
    },
  ]
</script>
