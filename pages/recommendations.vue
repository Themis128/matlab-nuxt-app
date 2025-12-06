<template>
  <div class="bg-background min-h-screen">
    <section
      class="bg-gradient-to-br from-green-50 to-emerald-50 py-16 dark:from-green-900/20 dark:to-emerald-900/20"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300"
          >
            <UIcon name="i-heroicons-currency-dollar" class="h-4 w-4" />
            Smart Recommendations
          </div>
          <h1 class="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
            Find Phones by <span class="text-green-600 dark:text-green-400">Your Budget</span>
          </h1>
          <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Get AI-powered recommendations for mobile phones that match your budget and
            requirements.
          </p>
        </div>

        <div class="mx-auto max-w-2xl">
          <UCard class="bg-white/80 p-8 backdrop-blur-sm dark:bg-gray-800/80">
            <div class="space-y-6">
              <div>
                <label class="mb-4 block text-lg font-semibold text-gray-900 dark:text-white">
                  What's your budget range?
                </label>
                <div class="px-4">
                  <URange v-model="budgetRange[0]" :min="100" :max="2000" :step="50" class="mb-4" />
                  <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>${{ budgetRange[0] }}</span>
                    <span>${{ budgetRange[1] }}</span>
                  </div>
                </div>
              </div>

              <div class="flex justify-center">
                <UButton size="lg" color="green" variant="solid" class="px-8 font-semibold">
                  <UIcon name="i-heroicons-sparkles" class="mr-2 h-5 w-5" />
                  Get Recommendations
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Recommended for You</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Based on your budget of ${{ budgetRange[0] }} - ${{ budgetRange[1] }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="phone in recommendations"
            :key="phone.id"
            class="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div class="relative">
              <img
                :src="phone.image"
                :alt="`${phone.brand} ${phone.name}`"
                class="h-48 w-full rounded-t-lg object-cover"
                @error="handleImageError"
              />
              <div class="absolute right-4 top-4">
                <UBadge :color="(phone.valueScore || 0) > 8 ? 'green' : 'yellow'" variant="solid">
                  {{ phone.valueScore || 0 }}/10 Value
                </UBadge>
              </div>
            </div>

            <div class="p-6">
              <div class="mb-3 flex items-start justify-between">
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

              <p class="mb-4 text-gray-600 dark:text-gray-300">{{ phone.recommendationReason }}</p>

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
import { onMounted, ref, watch } from 'vue';

interface Phone {
  id: number;
  name: string;
  brand: string;
  price: number;
  ram: number;
  battery: number;
  image?: string;
  weight?: string;
  screen?: string;
  frontCamera?: string;
  backCamera?: string;
  processor?: string;
  year?: number;
  valueScore?: number;
  recommendationReason?: string;
}

// Page meta fallback
onMounted(() => {
  document.title = 'Price Recommendations - MATLAB Analytics';
  const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  const content = 'Get AI-powered mobile phone recommendations based on your budget';
  if (existing) existing.content = content;
  else {
    const m = document.createElement('meta');
    m.name = 'description';
    m.content = content;
    document.head.appendChild(m);
  }
});

const budgetRange = ref<[number, number]>([300, 800]);
const recommendations = ref<Phone[]>([]);
const isLoading = ref(false);

// Fetch recommendations based on budget
const fetchRecommendations = async () => {
  isLoading.value = true;

  try {
    // For now, fetch all products and filter client-side
    // In a real app, you'd pass budget filters to the API
    const response = (await $fetch('/api/products?limit=50')) as { products: any[] };

    const filtered = response.products
      .map((product: any) => ({
        id: product.id,
        name: product.model,
        brand: product.company,
        price:
          product.price_usa ||
          product.price_dubai ||
          product.price_india ||
          product.price_pakistan ||
          product.price_china ||
          0,
        ram: parseInt(product.ram) || 0,
        battery: parseInt(product.battery) || 0,
        image: product.image_url,
        weight: product.weight,
        screen: product.screen_size,
        frontCamera: product.front_camera,
        backCamera: product.back_camera,
        processor: product.processor,
        year: product.launched_year,
      }))
      .filter(
        (phone: Phone) => phone.price >= budgetRange.value[0] && phone.price <= budgetRange.value[1]
      )
      .sort((a: Phone, b: Phone) => b.price - a.price) // Sort by price descending
      .slice(0, 6); // Take top 6

    recommendations.value = filtered.map((phone: Phone) => ({
      ...phone,
      valueScore: calculateValueScore(phone),
      recommendationReason: getRecommendationReason(phone),
    }));
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    recommendations.value = [];
  } finally {
    isLoading.value = false;
  }
};

const calculateValueScore = (phone: Phone): number => {
  // Calculate value score based on phone specifications
  // Score range: 1-10, where 10 is best value
  let score = 5; // Base score

  // Price-to-specs ratio (lower price with good specs = higher score)
  const pricePerGB = phone.price / (phone.ram || 1);
  if (pricePerGB < 50)
    score += 2; // Excellent value
  else if (pricePerGB < 80)
    score += 1; // Good value
  else if (pricePerGB > 150) score -= 1; // Lower value

  // Battery life consideration
  if (phone.battery >= 5000)
    score += 1; // Excellent battery
  else if (phone.battery >= 4000)
    score += 0.5; // Good battery
  else if (phone.battery < 3000) score -= 0.5; // Lower battery

  // RAM consideration
  if (phone.ram >= 12)
    score += 1; // High RAM
  else if (phone.ram >= 8)
    score += 0.5; // Good RAM
  else if (phone.ram < 4) score -= 0.5; // Low RAM

  // Year consideration (newer = better, but older can be better value)
  if (phone.year) {
    const age = 2025 - phone.year;
    if (age <= 1)
      score += 0.5; // Very recent
    else if (age <= 2)
      score += 0.25; // Recent
    else if (age > 5) score -= 0.5; // Older model
  }

  // Clamp to 1-10 range
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
};

const getRecommendationReason = (phone: Phone): string => {
  const reasons: string[] = [];

  // Build recommendation based on actual phone specs
  if (phone.battery && phone.battery >= 5000) {
    reasons.push('Exceptional battery life');
  }
  if (phone.ram && phone.ram >= 12) {
    reasons.push('High-performance RAM');
  }
  if (phone.price && phone.price < 500) {
    reasons.push('Excellent value for money');
  }
  if (phone.year && phone.year >= 2023) {
    reasons.push('Recent model with modern features');
  }
  if (phone.screen && parseFloat(phone.screen) >= 6.5) {
    reasons.push('Large, immersive display');
  }

  // Default recommendation if no specific features stand out
  if (reasons.length === 0) {
    return 'Great choice for your needs with balanced specifications.';
  }

  return `${reasons.join(', ')}.`;
};

// Watch for budget changes
watch(
  budgetRange,
  () => {
    fetchRecommendations();
  },
  { deep: true }
);

// Initial load
onMounted(() => {
  fetchRecommendations();
});

// Handle image loading errors
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Use a local fallback image instead of placeholder service
  img.src = '/mobile_images/default-phone.png';
  img.onerror = () => {
    // If default image also fails, hide the image
    img.style.display = 'none';
  };
};
</script>
