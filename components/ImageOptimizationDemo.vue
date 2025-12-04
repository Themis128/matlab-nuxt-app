<template>
  <div class="space-y-8 p-6">
    <!-- Hero Section -->
    <div class="space-y-4 text-center">
      <div
        class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white"
      >
        <UIcon name="i-heroicons-sparkles" class="h-4 w-4" />
        Magic UI Enhanced
      </div>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Image Optimization Demo</h2>
      <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
        Experience @nuxt/image with automatic WebP conversion, responsive sizes, and performance
        optimization
      </p>

      <!-- Feature badges -->
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <div
          class="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-700 dark:bg-green-900/20 dark:text-green-400"
        >
          <div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
          <span class="text-sm font-medium">WebP/AVIF Support</span>
        </div>
        <div
          class="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
        >
          <UIcon name="i-heroicons-device-phone-mobile" class="h-4 w-4" />
          <span class="text-sm font-medium">Responsive Images</span>
        </div>
        <div
          class="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
        >
          <UIcon name="i-heroicons-bolt" class="h-4 w-4" />
          <span class="text-sm font-medium">Lazy Loading</span>
        </div>
        <div
          class="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
        >
          <UIcon name="i-heroicons-chart-bar-square" class="h-4 w-4" />
          <span class="text-sm font-medium">Smart Compression</span>
        </div>
      </div>
    </div>

    <!-- Enhanced Phone Gallery -->
    <div
      class="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Mobile Phone Gallery</h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Interactive showcase with quality controls
          </p>
        </div>
        <div class="flex items-center gap-4">
          <!-- Quality Control -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Quality:</span>
            <div class="flex items-center gap-1">
              <button
                v-for="preset in qualityPresets"
                :key="preset.label"
                @click="imageQualityValue = preset.value"
                :class="[
                  'rounded-full px-3 py-1 text-xs transition-all duration-200',
                  imageQualityValue === preset.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600',
                ]"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div
              :class="[
                'h-2 w-2 animate-pulse rounded-full',
                imageQuality === 'high'
                  ? 'bg-green-500'
                  : imageQuality === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-red-500',
              ]"
            ></div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ imageQuality.toUpperCase() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Enhanced Grid -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(image, index) in paginatedImages"
          :key="index"
          class="group cursor-pointer"
          @click="openModal(image)"
        >
          <div
            class="relative overflow-hidden rounded-xl shadow-md transition-all duration-300 group-hover:shadow-xl"
          >
            <!-- Loading placeholder -->
            <div
              class="absolute inset-0 flex animate-pulse items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
            >
              <UIcon name="i-heroicons-photo" class="h-8 w-8 text-gray-400" />
            </div>

            <!-- Actual image -->
            <NuxtImg
              :src="image.url"
              :alt="image.alt"
              class="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
              :quality="imageQualityValue"
              format="webp"
              :loading="'lazy'"
              @load="imageLoaded(index)"
              :class="{ 'opacity-0': !imagesLoaded[index] }"
            />

            <!-- Hover overlay -->
            <div
              class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/30 group-hover:opacity-100"
            >
              <UIcon name="i-heroicons-eye" class="h-8 w-8 text-white" />
            </div>

            <!-- Quality indicator -->
            <div class="absolute right-3 top-3">
              <span
                class="rounded-full px-2 py-1 text-xs font-medium"
                :class="getQualityBadgeClass()"
              >
                {{ imageQuality.toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="mt-3">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ image.name }}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ image.brand }}</p>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div class="mt-8 text-center">
        <button
          @click="loadMoreImages"
          :disabled="currentPage >= totalPages"
          :class="[
            'rounded-xl px-6 py-3 font-medium transition-all duration-200',
            currentPage >= totalPages
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              : 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl',
          ]"
        >
          {{ currentPage >= totalPages ? 'All Images Loaded' : 'Load More Phones' }}
        </button>
      </div>
    </div>

    <!-- Enhanced Image Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div
        class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
      >
        <div
          class="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700"
        >
          <div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ selectedImage?.name }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">{{ selectedImage?.brand }}</p>
          </div>
          <button
            @click="closeModal"
            class="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <UIcon name="i-heroicons-x-mark" class="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div class="p-6">
          <div v-if="selectedImage" class="text-center">
            <NuxtImg
              :src="selectedImage.url"
              :alt="selectedImage.alt"
              class="mx-auto h-auto max-h-96 max-w-full rounded-lg object-contain shadow-lg"
              format="webp"
              quality="95"
            />
            <div class="mt-4 flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-photo" class="h-4 w-4" />
                <span>WebP Format</span>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-bolt" class="h-4 w-4" />
                <span>95% Quality</span>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-device-phone-mobile" class="h-4 w-4" />
                <span>Responsive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define image interface
interface PhoneImage {
  name: string;
  brand: string;
  url: string;
  alt: string;
}

// Sample images for demonstration
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
];

// State
const currentPage = ref(1);
const itemsPerPage = 4;
const isModalOpen = ref(false);
const selectedImage = ref<PhoneImage | null>(null);
const imagesLoaded = ref<boolean[]>(new Array(sampleImages.length).fill(false));

// Image quality settings
const qualityPresets = [
  { label: 'High', value: 95 },
  { label: 'Medium', value: 80 },
  { label: 'Low', value: 60 },
];

const imageQuality = computed(() => {
  return (
    qualityPresets.find((p) => p.value === imageQualityValue.value)?.label.toLowerCase() || 'medium'
  );
});

const imageQualityValue = ref(80);

// Computed
const totalPages = computed(() => Math.ceil(sampleImages.length / itemsPerPage));

const paginatedImages = computed(() => {
  const start = 0;
  const end = currentPage.value * itemsPerPage;
  return sampleImages.slice(start, end);
});

// Methods
const loadMoreImages = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const openModal = (image: PhoneImage) => {
  selectedImage.value = image;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedImage.value = null;
};

const imageLoaded = (index: number) => {
  imagesLoaded.value[index] = true;
};

const getQualityBadgeClass = () => {
  switch (imageQuality.value) {
    case 'high':
      return 'bg-green-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

// Close modal on escape key
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isModalOpen.value) {
      closeModal();
    }
  };

  document.addEventListener('keydown', handleEscape);

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape);
  });
});
</script>

<style scoped>
/* Smooth transitions for image loading */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Enhanced hover effects */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Backdrop blur animation */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}
</style>
