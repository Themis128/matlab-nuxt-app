<template>
  <div class="bg-background min-h-screen">
    <section
      class="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 dark:from-blue-900/20 dark:to-indigo-900/20"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          >
            <UIcon name="i-heroicons-scale" class="h-4 w-4" />
            Phone Comparison
          </div>
          <h1 class="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
            Compare Mobile Phones <span class="text-blue-600 dark:text-blue-400">Side by Side</span>
          </h1>
          <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Make informed decisions by comparing specifications, features, and performance metrics.
          </p>
        </div>

        <div class="mx-auto max-w-4xl">
          <UCard class="bg-white/80 p-8 backdrop-blur-sm dark:bg-gray-800/80">
            <div class="mb-6 text-center">
              <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Select Phones to Compare
              </h2>
              <p class="text-gray-600 dark:text-gray-300">
                Choose up to 4 phones to compare their specifications
              </p>
            </div>

            <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                class="px-8 font-semibold"
                :disabled="selectedPhones.filter(Boolean).length < 2"
              >
                <UIcon name="i-heroicons-arrow-right" class="mr-2 h-5 w-5" />
                Compare Selected Phones
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <section v-if="comparisonData.length > 0" class="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Comparison Results</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Detailed specifications and performance comparison
          </p>
        </div>

        <div class="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <UCard
            v-for="phone in comparisonData"
            :key="phone.id"
            class="group text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="relative mb-4">
              <img
                :src="phone.image"
                :alt="phone.name"
                class="mx-auto h-32 w-full rounded-lg object-cover"
              />
              <UButton
                size="xs"
                variant="solid"
                color="red"
                class="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
              >
                <UIcon name="i-heroicons-x-mark" class="h-3 w-3" />
              </UButton>
            </div>
            <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              {{ phone.name }}
            </h3>
            <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">{{ phone.brand }}</p>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${{ phone.price }}
            </div>
          </UCard>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full rounded-lg bg-white shadow-lg dark:bg-gray-800">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Specification
                </th>
                <th
                  v-for="phone in comparisonData"
                  :key="phone.id"
                  class="min-w-48 px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white"
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

        <div class="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
          <UButton size="lg" variant="outline" class="font-semibold">
            <UIcon name="i-heroicons-arrow-down-tray" class="mr-2 h-5 w-5" />
            Export Comparison
          </UButton>
          <UButton size="lg" color="blue" variant="solid" class="font-semibold">
            <UIcon name="i-heroicons-shopping-bag" class="mr-2 h-5 w-5" />
            View Best Deal
          </UButton>
        </div>
      </div>
    </section>

    <section v-else class="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 text-center sm:px-6 lg:px-8">
        <UIcon
          name="i-heroicons-scale"
          class="mx-auto mb-6 h-24 w-24 text-gray-300 dark:text-gray-600"
        />
        <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Ready to Compare Phones?
        </h2>
        <p class="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Select at least 2 phones above to see a detailed side-by-side comparison.
        </p>
        <UButton size="lg" color="blue" variant="solid" class="font-semibold">
          <UIcon name="i-heroicons-plus" class="mr-2 h-5 w-5" />
          Add Phones to Compare
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

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
</script>
