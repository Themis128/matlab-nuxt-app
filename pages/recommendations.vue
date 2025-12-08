<template>
  <DPageLayout
    :show-hero="true"
    title="Find Phones by Your Budget"
    description="Get AI-powered recommendations for mobile phones that match your budget and requirements"
  >
    <template #hero-actions>
      <span class="badge badge-success badge-lg mb-4">
        <Icon name="heroicons:currency-dollar" class="h-3 w-3" />
        Smart Recommendations
      </span>
    </template>

    <!-- Budget Selection Card -->
    <ModernSection variant="light" :show-gradient="false">
      <div class="mx-auto max-w-2xl">
        <DCard class="border-2 border-base-300 bg-base-100/90 p-8 shadow-2xl backdrop-blur-xl">
          <div class="space-y-6">
            <div>
              <label class="mb-4 block text-lg font-semibold text-base-content">
                What's your budget range?
              </label>
              <div class="px-4 space-y-4">
                <div>
                  <label class="label">
                    <span class="label-text">Min Budget: ${{ budgetRange[0] }}</span>
                  </label>
                  <input
                    v-model="budgetRange[0]"
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    class="range range-success"
                  />
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">Max Budget: ${{ budgetRange[1] }}</span>
                  </label>
                  <input
                    v-model="budgetRange[1]"
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    class="range range-success"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-center">
              <DButton
                size="lg"
                variant="success"
                class="px-8 font-semibold"
                :loading="isLoading"
                @click="fetchRecommendations"
              >
                <Icon name="heroicons:sparkles" class="h-5 w-5" />
                Get Recommendations
              </DButton>
            </div>
          </div>
        </DCard>
      </div>
    </ModernSection>

    <!-- Enhanced Recommendations Section -->
    <ModernSection
      title="Recommended for You"
      :description="`Based on your budget of $${budgetRange[0]} - $${budgetRange[1]}`"
      badge="AI Recommendations"
      badge-icon="i-heroicons-sparkles"
    >
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <ModernCard
          v-for="phone in recommendations"
          :key="phone.id"
          hover-color="green"
          class="group"
        >
          <div class="relative mb-6">
            <div class="h-48 w-full overflow-hidden rounded-xl bg-base-200">
              <img
                :src="phone.image"
                :alt="`${phone.brand} ${phone.name}`"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                @error="handleImageError"
              />
            </div>
            <div class="absolute right-4 top-4">
              <span
                :class="[
                  'badge shadow-lg',
                  (phone.valueScore || 0) > 8 ? 'badge-success' : 'badge-warning',
                ]"
              >
                {{ phone.valueScore || 0 }}/10 Value
              </span>
            </div>
          </div>

          <div class="p-6">
            <div class="mb-4 flex items-start justify-between">
              <div>
                <h3 class="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                  {{ phone.name }}
                </h3>
                <p class="text-sm font-medium text-green-600 dark:text-green-400">
                  {{ phone.brand }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-3xl font-extrabold text-green-600 dark:text-green-400">
                  ${{ phone.price }}
                </div>
                <div class="text-xs text-gray-500">MSRP</div>
              </div>
            </div>

            <p class="mb-6 text-base leading-relaxed text-gray-600 dark:text-gray-300">
              {{ phone.recommendationReason }}
            </p>

            <div class="flex gap-2">
              <DButton
                size="md"
                variant="success"
                class="flex-1 font-semibold shadow-md transition-all duration-200 hover:scale-105"
                @click="viewPhoneDetails(phone)"
              >
                View Details
              </DButton>
              <DButton
                size="md"
                variant="outline"
                class="flex-1 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-md"
                @click="addPhoneToComparison(phone)"
              >
                Compare
              </DButton>
            </div>
          </div>
        </ModernCard>
      </div>
    </ModernSection>
  </DPageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { usePageSeo } from '../composables/usePageSeo';

// Page SEO meta tags
usePageSeo({
  title: 'Smart Phone Recommendations - Find Phones by Budget',
  description:
    'Get AI-powered recommendations for mobile phones that match your budget and requirements. Find the best value phones with smart filtering and comparison tools.',
  keywords: [
    'phone recommendations',
    'budget phones',
    'best value phones',
    'phone finder',
    'smartphone recommendations',
    'affordable phones',
  ],
  type: 'website',
  image: '/og-recommendations.jpg',
});

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
    const logger = useSentryLogger();
    logger.logError(
      'Error fetching recommendations',
      error instanceof Error ? error : new Error(String(error)),
      {
        page: 'recommendations',
        action: 'fetchRecommendations',
      }
    );
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

const viewPhoneDetails = (phone: Phone) => {
  navigateTo(`/search?q=${encodeURIComponent(phone.name)}`);
};

const addPhoneToComparison = (phone: Phone) => {
  const { addModel } = useModelComparison();
  addModel({
    id: phone.id.toString(),
    name: phone.name,
    brand: phone.brand,
    price: phone.price,
    ram: phone.ram,
    battery: phone.battery,
    year: phone.year || new Date().getFullYear(),
    screen: phone.screen ? parseFloat(phone.screen) : 0,
  });
  navigateTo('/compare');
};

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
