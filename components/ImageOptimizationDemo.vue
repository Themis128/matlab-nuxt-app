<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Image Optimization Demo</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        See @nuxt/image in action with automatic WebP conversion and responsive sizes
      </p>
      <div class="flex flex-wrap justify-center gap-2 mb-6">
        <UBadge color="green" variant="soft">WebP/AVIF</UBadge>
        <UBadge color="blue" variant="soft">Responsive</UBadge>
        <UBadge color="purple" variant="soft">Lazy Loading</UBadge>
        <UBadge color="orange" variant="soft">Compression</UBadge>
      </div>
    </div>

    <!-- Basic Image Usage -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Basic Image Usage</h3>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Original image -->
        <div class="text-center">
          <h4 class="font-medium mb-2">Original Image</h4>
          <NuxtImg
            :src="sampleImages[0]?.url || ''"
            alt="Mobile phone example"
            class="w-full h-32 object-cover rounded-lg shadow-sm"
            :loading="'lazy'"
          />
          <p class="text-xs text-gray-500 mt-2">Auto-optimized format & size</p>
        </div>

        <!-- WebP conversion -->
        <div class="text-center">
          <h4 class="font-medium mb-2">WebP Format</h4>
          <NuxtImg
            :src="sampleImages[0]?.url || ''"
            alt="Mobile phone example"
            class="w-full h-32 object-cover rounded-lg shadow-sm"
            format="webp"
            quality="80"
            :loading="'lazy'"
          />
          <p class="text-xs text-gray-500 mt-2">Explicit WebP conversion</p>
        </div>

        <!-- Responsive sizes -->
        <div class="text-center">
          <h4 class="font-medium mb-2">Responsive</h4>
          <NuxtImg
            :src="sampleImages[0]?.url || ''"
            alt="Mobile phone example"
            class="w-full h-32 object-cover rounded-lg shadow-sm"
            sizes="320px sm:640px lg:1024px"
            :loading="'lazy'"
          />
          <p class="text-xs text-gray-500 mt-2">Custom responsive sizes</p>
        </div>
      </div>
    </UCard>

    <!-- Performance Comparison -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Performance Benefits</h3>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium mb-3">Before Optimization</h4>
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex justify-between">
              <span>File Format:</span>
              <span class="text-red-500">JPEG/PNG (large)</span>
            </div>
            <div class="flex justify-between">
              <span>Load Time:</span>
              <span class="text-red-500">~2-3 seconds</span>
            </div>
            <div class="flex justify-between">
              <span>File Size:</span>
              <span class="text-red-500">~500KB+</span>
            </div>
            <div class="flex justify-between">
              <span>Mobile Speed:</span>
              <span class="text-red-500">Slow</span>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium mb-3">After @nuxt/image</h4>
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex justify-between">
              <span>File Format:</span>
              <span class="text-green-500">WebP/AVIF</span>
            </div>
            <div class="flex justify-between">
              <span>Load Time:</span>
              <span class="text-green-500">~200-400ms</span>
            </div>
            <div class="flex justify-between">
              <span>File Size:</span>
              <span class="text-green-500">~50-100KB</span>
            </div>
            <div class="flex justify-between">
              <span>Mobile Speed:</span>
              <span class="text-green-500">10x faster</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="font-medium text-blue-800 dark:text-blue-200">Pro Tip</h4>
            <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
              @nuxt/image automatically serves the best format (WebP, AVIF) based on browser
              support. Images are compressed and sized appropriately for each device.
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Phone Gallery -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Mobile Phone Gallery</h3>
          <UBadge
            :color="
              imageQuality === 'high' ? 'green' : imageQuality === 'medium' ? 'yellow' : 'red'
            "
            variant="soft"
          >
            Quality: {{ imageQuality.toUpperCase() }}
          </UBadge>
        </div>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(image, index) in paginatedImages"
          :key="index"
          class="group cursor-pointer"
          @click="openModal(image)"
        >
          <div
            class="relative overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
          >
            <NuxtImg
              :src="image.url"
              :alt="image.alt"
              class="w-full h-48 object-cover group-hover:scale-105 transition-transform"
              :quality="imageQualityValue"
              format="webp"
              :loading="'lazy'"
              placeholder-class="bg-gray-200 dark:bg-gray-700 animate-pulse"
            />
            <div
              class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <UIcon name="i-heroicons-eye" class="w-8 h-8 text-white" />
            </div>
          </div>
          <h4 class="font-medium mt-2 text-sm">{{ image.name }}</h4>
          <p class="text-xs text-gray-500">{{ image.brand }}</p>
        </div>
      </div>

      <!-- Load More Button -->
      <div class="mt-6 text-center">
        <UButton @click="loadMoreImages" :disabled="currentPage >= totalPages" variant="outline">
          {{ currentPage >= totalPages ? 'All Images Loaded' : 'Load More Phones' }}
        </UButton>
      </div>
    </UCard>

    <!-- Image Modal -->
    <UModal v-model="isModalOpen">
      <div class="p-4">
        <div v-if="selectedImage" class="text-center">
          <NuxtImg
            :src="selectedImage.url"
            :alt="selectedImage.alt"
            class="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-lg"
            format="webp"
            quality="95"
          />
          <h3 class="mt-4 text-xl font-semibold">{{ selectedImage.name }}</h3>
          <p class="text-gray-600 dark:text-gray-400">{{ selectedImage.brand }}</p>
          <div class="mt-4">
            <UButton @click="closeModal" variant="outline">Close</UButton>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  // Define image interface
  interface PhoneImage {
    name: string
    brand: string
    url: string
    alt: string
  }

  // Sample images for demonstration - using real phone images from the project
  const sampleImages: PhoneImage[] = [
    {
      name: 'iPhone 15 Pro 256GB',
      brand: 'Apple',
      url: '/mobile_images/Apple_iPhone_15_Pro_256GB/Apple_iPhone_15_Pro_256GB_1.jpg',
      alt: 'Apple iPhone 15 Pro 256GB',
    },
    {
      name: 'Samsung Galaxy S24',
      brand: 'Samsung',
      url: '/mobile_images/Huawei_P50_Pocket/Huawei_P50_Pocket_1.jpg',
      alt: 'Huawei P50 Pocket',
    },
    {
      name: 'Google Pixel 8 128GB',
      brand: 'Google',
      url: '/mobile_images/Google_Pixel_8_128GB/Google_Pixel_8_128GB_1.jpg',
      alt: 'Google Pixel 8 128GB',
    },
    {
      name: 'Xiaomi 14',
      brand: 'Xiaomi',
      url: '/mobile_images/Honor_90/Honor_90_1.jpg',
      alt: 'Honor 90',
    },
    {
      name: 'Sony Xperia 5',
      brand: 'Sony',
      url: '/mobile_images/Honor_Magic_Vs/Honor_Magic_Vs_1.jpg',
      alt: 'Honor Magic Vs',
    },
    {
      name: 'OnePlus 12',
      brand: 'OnePlus',
      url: '/mobile_images/Honor_Play_8T/Honor_Play_8T_1.jpg',
      alt: 'Honor Play 8T',
    },
    {
      name: 'Motorola Edge 40',
      brand: 'Motorola',
      url: '/mobile_images/Apple_iPhone_14_Pro_Max_512GB/Apple_iPhone_14_Pro_Max_512GB_1.jpg',
      alt: 'Apple iPhone 14 Pro Max 512GB',
    },
    {
      name: 'Asus ROG Phone 8',
      brand: 'Asus',
      url: '/mobile_images/Google_Pixel_9_Pro_256GB/Google_Pixel_9_Pro_256GB_1.jpg',
      alt: 'Google Pixel 9 Pro 256GB',
    },
    {
      name: 'Honor Magic 6 Pro',
      brand: 'Honor',
      url: '/mobile_images/Honor_Magic6_Pro/Honor_Magic6_Pro_1.jpg',
      alt: 'Honor Magic 6 Pro',
    },
    {
      name: 'Realme GT 5',
      brand: 'Realme',
      url: '/mobile_images/Honor_Pad_X10_Pro/Honor_Pad_X10_Pro_1.jpg',
      alt: 'Honor Pad X10 Pro',
    },
  ]

  // State
  const currentPage = ref(1)
  const itemsPerPage = 4
  const isModalOpen = ref(false)
  const selectedImage = ref<PhoneImage | null>(null)

  // Image quality settings
  const qualityPresets = [
    { label: 'High', value: 95 },
    { label: 'Medium', value: 80 },
    { label: 'Low', value: 60 },
  ]

  const imageQuality = computed(() => {
    return (
      qualityPresets.find(p => p.value === imageQualityValue.value)?.label.toLowerCase() || 'medium'
    )
  })

  const imageQualityValue = ref(80)

  // Computed
  const totalPages = computed(() => Math.ceil(sampleImages.length / itemsPerPage))

  const paginatedImages = computed(() => {
    const start = 0
    const end = currentPage.value * itemsPerPage
    return sampleImages.slice(start, end)
  })

  // Methods
  const loadMoreImages = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const openModal = (image: PhoneImage) => {
    selectedImage.value = image
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
    selectedImage.value = null
  }
</script>
