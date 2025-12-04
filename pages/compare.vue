<template>
  <div class="min-h-screen bg-background">
    <section
      class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 py-16"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
          >
            <UIcon name="i-heroicons-scale" class="w-4 h-4" />
            Phone Comparison
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Compare Mobile Phones <span class="text-blue-600 dark:text-blue-400">Side by Side</span>
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Make informed decisions by comparing specifications, features, and performance metrics.
          </p>
        </div>

        <div class="max-w-4xl mx-auto">
          <UCard class="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select Phones to Compare
              </h2>
              <p class="text-gray-600 dark:text-gray-300">
                Choose up to 4 phones to compare their specifications
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div v-for="i in 4" :key="i" class="space-y-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone {{ i }}
                </label>
                <USelect
                  :model-value="selectedPhones[i - 1]"
                  placeholder="Select phone"
                  :options="availablePhones"
                />
              </div>
            </div>

            <div class="flex justify-center">
              <UButton
                size="lg"
                color="blue"
                variant="solid"
                class="font-semibold px-8"
                :disabled="selectedPhones.filter(Boolean).length < 2"
              >
                <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 mr-2" />
                Compare Selected Phones
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <section v-if="comparisonData.length > 0" class="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Comparison Results</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Detailed specifications and performance comparison
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <UCard
            v-for="phone in comparisonData"
            :key="phone.id"
            class="text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div class="relative mb-4">
              <img
                :src="phone.image"
                :alt="phone.name"
                class="w-full h-32 object-cover rounded-lg mx-auto"
              />
              <UButton
                size="xs"
                variant="solid"
                color="red"
                class="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
              >
                <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
              </UButton>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {{ phone.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ phone.brand }}</p>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${{ phone.price }}
            </div>
          </UCard>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Specification
                </th>
                <th
                  v-for="phone in comparisonData"
                  :key="phone.id"
                  class="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white min-w-48"
                >
                  {{ phone.name }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Price</td>
                <td
                  v-for="phone in comparisonData"
                  :key="phone.id"
                  class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300"
                >
                  <span class="font-semibold text-green-600 dark:text-green-400"
                    >${{ phone.price }}</span
                  >
                </td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Display</td>
                <td
                  v-for="phone in comparisonData"
                  :key="phone.id"
                  class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300"
                >
                  {{ phone.display }}" {{ phone.displayType }}
                </td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  Processor
                </td>
                <td
                  v-for="phone in comparisonData"
                  :key="phone.id"
                  class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300"
                >
                  {{ phone.processor }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <UButton size="lg" variant="outline" class="font-semibold">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5 mr-2" />
            Export Comparison
          </UButton>
          <UButton size="lg" color="blue" variant="solid" class="font-semibold">
            <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 mr-2" />
            View Best Deal
          </UButton>
        </div>
      </div>
    </section>

    <section v-else class="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <UIcon
          name="i-heroicons-scale"
          class="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6"
        />
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Compare Phones?
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Select at least 2 phones above to see a detailed side-by-side comparison.
        </p>
        <UButton size="lg" color="blue" variant="solid" class="font-semibold">
          <UIcon name="i-heroicons-plus" class="w-5 h-5 mr-2" />
          Add Phones to Compare
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Page meta fallback
onMounted(() => {
  document.title = 'Compare Phones - MATLAB Analytics';
  const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  const content = 'Compare mobile phones side by side with detailed specifications';
  if (existing) existing.content = content;
  else {
    const m = document.createElement('meta');
    m.name = 'description';
    m.content = content;
    document.head.appendChild(m);
  }
});

const selectedPhones = ref(['', '', '', '']);
const comparisonData = ref<any[]>([]);

const availablePhones = [
  { label: 'Samsung Galaxy S24 Ultra', value: 'samsung-s24-ultra' },
  { label: 'iPhone 15 Pro Max', value: 'iphone-15-pro-max' },
  { label: 'Google Pixel 8 Pro', value: 'pixel-8-pro' },
  { label: 'OnePlus 12', value: 'oneplus-12' },
];

const phoneDatabase = {
  'samsung-s24-ultra': {
    id: 'samsung-s24-ultra',
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    price: 1199,
    image: '/api/placeholder/200/150',
    display: 6.8,
    displayType: 'Dynamic AMOLED 2X',
    processor: 'Snapdragon 8 Gen 3',
  },
  'iphone-15-pro-max': {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    price: 1199,
    image: '/api/placeholder/200/150',
    display: 6.7,
    displayType: 'Super Retina XDR OLED',
    processor: 'A17 Pro',
  },
};
</script>
