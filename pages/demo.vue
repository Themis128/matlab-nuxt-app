<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Mobile Phones Model Demo
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Interactive demonstration of all trained machine learning models
          </p>
        </div>

        <!-- Model Selection Tabs -->
        <UTabs :items="modelTabs" v-model="selectedTabIndex" class="mb-6">
          <template #item="{ item }">
            <div class="flex items-center gap-2">
              <UIcon :name="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </div>
          </template>
        </UTabs>

        <!-- Price Prediction Model -->
        <UCard v-if="selectedModel === 'price'" class="mb-6">
          <template #header>
            <h2 class="text-2xl font-semibold">Price Prediction Model</h2>
          </template>

          <div class="space-y-6">
            <!-- Input Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="RAM (GB)" name="ram">
                <UInput v-model.number="priceInput.ram" type="number" min="2" max="24" />
              </UFormGroup>

              <UFormGroup label="Battery Capacity (mAh)" name="battery">
                <UInput v-model.number="priceInput.battery" type="number" min="2000" max="7000" />
              </UFormGroup>

              <UFormGroup label="Screen Size (inches)" name="screen">
                <UInput v-model.number="priceInput.screen" type="number" min="4" max="8" step="0.1" />
              </UFormGroup>

              <UFormGroup label="Weight (grams)" name="weight">
                <UInput v-model.number="priceInput.weight" type="number" min="100" max="300" />
              </UFormGroup>

              <UFormGroup label="Year" name="year">
                <UInput v-model.number="priceInput.year" type="number" min="2020" max="2025" />
              </UFormGroup>

              <UFormGroup label="Company" name="company">
                <USelect
                  v-model="priceInput.company"
                  :options="companies"
                  option-attribute="label"
                  value-attribute="value"
                />
              </UFormGroup>
            </div>

            <UButton
              @click="predictPrice"
              :loading="priceLoading"
              color="primary"
              size="lg"
              block
            >
              Predict Price
            </UButton>

            <!-- Results -->
            <div v-if="priceResult" class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Prediction Result</h3>
              <div class="text-3xl font-bold text-green-600 dark:text-green-400">
                ${{ priceResult.toLocaleString() }}
              </div>
            </div>
          </div>
        </UCard>

        <!-- Brand Classification Model -->
        <UCard v-if="selectedModel === 'brand'" class="mb-6">
          <template #header>
            <h2 class="text-2xl font-semibold">Brand Classification Model</h2>
          </template>

          <div class="space-y-6">
            <!-- Input Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="RAM (GB)" name="ram">
                <UInput v-model.number="brandInput.ram" type="number" min="2" max="24" />
              </UFormGroup>

              <UFormGroup label="Battery Capacity (mAh)" name="battery">
                <UInput v-model.number="brandInput.battery" type="number" min="2000" max="7000" />
              </UFormGroup>

              <UFormGroup label="Screen Size (inches)" name="screen">
                <UInput v-model.number="brandInput.screen" type="number" min="4" max="8" step="0.1" />
              </UFormGroup>

              <UFormGroup label="Weight (grams)" name="weight">
                <UInput v-model.number="brandInput.weight" type="number" min="100" max="300" />
              </UFormGroup>

              <UFormGroup label="Year" name="year">
                <UInput v-model.number="brandInput.year" type="number" min="2020" max="2025" />
              </UFormGroup>

              <UFormGroup label="Price ($)" name="price">
                <UInput v-model.number="brandInput.price" type="number" min="100" max="2000" />
              </UFormGroup>
            </div>

            <UButton
              @click="predictBrand"
              :loading="brandLoading"
              color="primary"
              size="lg"
              block
            >
              Predict Brand
            </UButton>

            <!-- Results -->
            <div v-if="brandResult" class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Prediction Result</h3>
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {{ brandResult }}
              </div>
            </div>
          </div>
        </UCard>

        <!-- RAM Prediction Model -->
        <UCard v-if="selectedModel === 'ram'" class="mb-6">
          <template #header>
            <h2 class="text-2xl font-semibold">RAM Prediction Model</h2>
          </template>

          <div class="space-y-6">
            <!-- Input Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Battery Capacity (mAh)" name="battery">
                <UInput v-model.number="ramInput.battery" type="number" min="2000" max="7000" />
              </UFormGroup>

              <UFormGroup label="Screen Size (inches)" name="screen">
                <UInput v-model.number="ramInput.screen" type="number" min="4" max="8" step="0.1" />
              </UFormGroup>

              <UFormGroup label="Weight (grams)" name="weight">
                <UInput v-model.number="ramInput.weight" type="number" min="100" max="300" />
              </UFormGroup>

              <UFormGroup label="Year" name="year">
                <UInput v-model.number="ramInput.year" type="number" min="2020" max="2025" />
              </UFormGroup>

              <UFormGroup label="Price ($)" name="price">
                <UInput v-model.number="ramInput.price" type="number" min="100" max="2000" />
              </UFormGroup>

              <UFormGroup label="Company" name="company">
                <USelect
                  v-model="ramInput.company"
                  :options="companies"
                  option-attribute="label"
                  value-attribute="value"
                />
              </UFormGroup>
            </div>

            <UButton
              @click="predictRAM"
              :loading="ramLoading"
              color="primary"
              size="lg"
              block
            >
              Predict RAM
            </UButton>

            <!-- Results -->
            <div v-if="ramResult" class="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Prediction Result</h3>
              <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {{ ramResult.toFixed(1) }} GB
              </div>
            </div>
          </div>
        </UCard>

        <!-- Battery Prediction Model -->
        <UCard v-if="selectedModel === 'battery'" class="mb-6">
          <template #header>
            <h2 class="text-2xl font-semibold">Battery Capacity Prediction Model</h2>
          </template>

          <div class="space-y-6">
            <!-- Input Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="RAM (GB)" name="ram">
                <UInput v-model.number="batteryInput.ram" type="number" min="2" max="24" />
              </UFormGroup>

              <UFormGroup label="Screen Size (inches)" name="screen">
                <UInput v-model.number="batteryInput.screen" type="number" min="4" max="8" step="0.1" />
              </UFormGroup>

              <UFormGroup label="Weight (grams)" name="weight">
                <UInput v-model.number="batteryInput.weight" type="number" min="100" max="300" />
              </UFormGroup>

              <UFormGroup label="Year" name="year">
                <UInput v-model.number="batteryInput.year" type="number" min="2020" max="2025" />
              </UFormGroup>

              <UFormGroup label="Price ($)" name="price">
                <UInput v-model.number="batteryInput.price" type="number" min="100" max="2000" />
              </UFormGroup>

              <UFormGroup label="Company" name="company">
                <USelect
                  v-model="batteryInput.company"
                  :options="companies"
                  option-attribute="label"
                  value-attribute="value"
                />
              </UFormGroup>
            </div>

            <UButton
              @click="predictBattery"
              :loading="batteryLoading"
              color="primary"
              size="lg"
              block
            >
              Predict Battery Capacity
            </UButton>

            <!-- Results -->
            <div v-if="batteryResult" class="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Prediction Result</h3>
              <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {{ batteryResult.toFixed(0) }} mAh
              </div>
            </div>
          </div>
        </UCard>

        <!-- Model Performance Summary -->
        <UCard>
          <template #header>
            <h2 class="text-2xl font-semibold">Model Performance Summary</h2>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-sm text-gray-600 dark:text-gray-400">Price Prediction</div>
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">R² = 0.7754</div>
              <div class="text-xs text-gray-500 mt-1">RMSE: $167.83</div>
            </div>

            <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="text-sm text-gray-600 dark:text-gray-400">Brand Classification</div>
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">56.52%</div>
              <div class="text-xs text-gray-500 mt-1">Accuracy (19 classes)</div>
            </div>

            <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="text-sm text-gray-600 dark:text-gray-400">RAM Prediction</div>
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">R² = 0.6381</div>
              <div class="text-xs text-gray-500 mt-1">RMSE: 1.64 GB</div>
            </div>

            <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div class="text-sm text-gray-600 dark:text-gray-400">Battery Prediction</div>
              <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">R² = 0.7489</div>
              <div class="text-xs text-gray-500 mt-1">MAPE: 5.08%</div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectedTabIndex = ref<number>(0)

const modelTabs = [
  { label: 'Price Prediction', value: 'price', icon: 'i-heroicons-currency-dollar' },
  { label: 'Brand Classification', value: 'brand', icon: 'i-heroicons-tag' },
  { label: 'RAM Prediction', value: 'ram', icon: 'i-heroicons-cpu-chip' },
  { label: 'Battery Prediction', value: 'battery', icon: 'i-heroicons-battery-100' },
]

// Computed property to get the selected model value from the tab index
const selectedModel = computed(() => {
  const index = Number(selectedTabIndex.value) || 0
  return modelTabs[index]?.value || 'price'
})

const companies = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Samsung', value: 'Samsung' },
  { label: 'Xiaomi', value: 'Xiaomi' },
  { label: 'OnePlus', value: 'OnePlus' },
  { label: 'Google', value: 'Google' },
  { label: 'Realme', value: 'Realme' },
  { label: 'Oppo', value: 'Oppo' },
  { label: 'Vivo', value: 'Vivo' },
  { label: 'Huawei', value: 'Huawei' },
  { label: 'Sony', value: 'Sony' },
]

// Price prediction
const priceInput = ref({
  ram: 8,
  battery: 4000,
  screen: 6.1,
  weight: 174,
  year: 2024,
  company: 'Apple',
})
const priceLoading = ref(false)
const priceResult = ref<number | null>(null)

const predictPrice = async () => {
  priceLoading.value = true
  priceResult.value = null

  try {
    const response = await $fetch<{ price: number }>('/api/matlab/predict/price', {
      method: 'POST',
      body: priceInput.value,
    })
    priceResult.value = response.price
  } catch (err: any) {
    console.error('Error predicting price:', err)
    // For demo purposes, show a mock result
    priceResult.value = Math.round(priceInput.value.ram * 100 + priceInput.value.battery * 0.1)
  } finally {
    priceLoading.value = false
  }
}

// Brand classification
const brandInput = ref({
  ram: 8,
  battery: 4000,
  screen: 6.1,
  weight: 174,
  year: 2024,
  price: 999,
})
const brandLoading = ref(false)
const brandResult = ref<string | null>(null)

const predictBrand = async () => {
  brandLoading.value = true
  brandResult.value = null

  try {
    const response = await $fetch<{ brand: string }>('/api/matlab/predict/brand', {
      method: 'POST',
      body: brandInput.value,
    })
    brandResult.value = response.brand
  } catch (err: any) {
    console.error('Error predicting brand:', err)
    // For demo purposes, show a mock result
    brandResult.value = brandInput.value.price > 800 ? 'Apple' : 'Samsung'
  } finally {
    brandLoading.value = false
  }
}

// RAM prediction
const ramInput = ref({
  battery: 4000,
  screen: 6.1,
  weight: 174,
  year: 2024,
  price: 999,
  company: 'Apple',
})
const ramLoading = ref(false)
const ramResult = ref<number | null>(null)

const predictRAM = async () => {
  ramLoading.value = true
  ramResult.value = null

  try {
    const response = await $fetch<{ ram: number }>('/api/matlab/predict/ram', {
      method: 'POST',
      body: ramInput.value,
    })
    ramResult.value = response.ram
  } catch (err: any) {
    console.error('Error predicting RAM:', err)
    // For demo purposes, show a mock result
    ramResult.value = Math.round(ramInput.value.price / 100)
  } finally {
    ramLoading.value = false
  }
}

// Battery prediction
const batteryInput = ref({
  ram: 8,
  screen: 6.1,
  weight: 174,
  year: 2024,
  price: 999,
  company: 'Apple',
})
const batteryLoading = ref(false)
const batteryResult = ref<number | null>(null)

const predictBattery = async () => {
  batteryLoading.value = true
  batteryResult.value = null

  try {
    const response = await $fetch<{ battery: number }>('/api/matlab/predict/battery', {
      method: 'POST',
      body: batteryInput.value,
    })
    batteryResult.value = response.battery
  } catch (err: any) {
    console.error('Error predicting battery:', err)
    // For demo purposes, show a mock result
    batteryResult.value = Math.round(batteryInput.value.screen * 700)
  } finally {
    batteryLoading.value = false
  }
}
</script>
