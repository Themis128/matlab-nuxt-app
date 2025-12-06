<template>
  <div class="optimized-image-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="image-skeleton" :class="[{ 'animate-pulse': showAnimation }]">
      <div class="skeleton-shimmer"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="image-error" :class="errorClass">
      <div class="error-content">
        <UIcon name="i-heroicons-photo-x-mark" class="h-12 w-12 text-gray-400" />
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ errorMessage }}
        </p>
      </div>
    </div>

    <!-- Main Image Container -->
    <div v-else class="image-wrapper" :class="wrapperClass">
      <!-- Performance Indicator -->
      <div v-if="showPerformanceIndicator" class="performance-indicator">
        <div class="flex items-center gap-1">
          <div
            :class="['h-2 w-2 rounded-full', getPerformanceColor()]"
            :style="{
              backgroundColor: getPerformanceColor(),
              animation: isOptimized ? 'pulse 2s infinite' : 'none',
            }"
          ></div>
          <span class="text-xs font-medium" :style="{ color: getPerformanceColor() }">
            {{ performanceLabel }}
          </span>
        </div>
      </div>

      <!-- Picture Element with WebP Support -->
      <picture :class="pictureClass">
        <!-- WebP Source -->
        <source :srcset="webpSrcSet" type="image/webp" :sizes="responsiveSizes" />
        <!-- Fallback Source -->
        <source :srcset="originalSrcSet" type="image/jpeg" :sizes="responsiveSizes" />
        <!-- Main Image -->
        <img
          :src="finalSrc"
          :alt="alt"
          :class="imageClass"
          :loading="lazy ? 'lazy' : 'eager'"
          :decoding="decodingMode"
          @load="handleImageLoad"
          @error="handleImageError"
          @loadstart="handleLoadStart"
        />
      </picture>

      <!-- Quality Indicator -->
      <div v-if="showQualityIndicator" class="quality-badge" :class="getQualityBadgeClass()">
        <div class="flex items-center gap-1">
          <UIcon name="i-heroicons-star" class="h-3 w-3" />
          <span class="text-xs font-medium">{{ qualityLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Image Info Overlay -->
    <div v-if="showImageInfo && !isLoading && !hasError" class="image-info-overlay">
      <div class="info-content">
        <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <UIcon name="i-heroicons-information-circle" class="h-4 w-4" />
          <span>{{ formatBytes(imageSize) }}</span>
          <span v-if="formatUsed">• {{ formatUsed }}</span>
          <span v-if="dimensions">• {{ dimensions }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

interface Props {
  src: string; // base filename with extension (e.g. 'network-visualization.png')
  alt?: string;
  class?: string;
  lazy?: boolean;
  showPerformanceIndicator?: boolean;
  showQualityIndicator?: boolean;
  showImageInfo?: boolean;
  responsiveSizes?: string;
  decodingMode?: 'sync' | 'async' | 'auto';
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  class: '',
  lazy: true,
  showPerformanceIndicator: true,
  showQualityIndicator: false,
  showImageInfo: false,
  responsiveSizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  decodingMode: 'async',
});

// Reactive state
const isLoading = ref(true);
const hasError = ref(false);
const isOptimized = ref(false);
const showAnimation = ref(true);
const imageSize = ref(0);
const dimensions = ref('');
const formatUsed = ref('');
const loadStartTime = ref(0);

// Computed properties
const webpSrc = computed(() => {
  return props.src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
});

const finalSrc = computed(() => {
  return isOptimized.value ? `/images/${webpSrc.value}` : `/images/${props.src}`;
});

const webpSrcSet = computed(() => {
  const baseName = webpSrc.value.replace(/\.[^/.]+$/, '');
  return `/images/${baseName}-480w.webp 480w, /images/${baseName}-768w.webp 768w, /images/${baseName}-1024w.webp 1024w, /images/${baseName}-1440w.webp 1440w`;
});

const originalSrcSet = computed(() => {
  const baseName = props.src.replace(/\.[^/.]+$/, '');
  return `/images/${baseName}-480w.jpg 480w, /images/${baseName}-768w.jpg 768w, /images/${baseName}-1024w.jpg 1024w, /images/${baseName}-1440w.jpg 1440w`;
});

// Style computed properties
const wrapperClass = computed(() => ({
  'relative overflow-hidden': true,
  'rounded-lg': !props.class.includes('rounded'),
}));

const imageClass = computed(() => ({
  'transition-all duration-300': true,
  'opacity-0': isLoading.value,
  'opacity-100': !isLoading.value,
  [props.class]: !!props.class,
}));

const pictureClass = computed(() => ({
  'block w-full h-full': true,
}));

const errorClass = computed(() => ({
  'bg-gray-100 dark:bg-gray-800': true,
  'flex items-center justify-center': true,
  'rounded-lg border border-gray-200 dark:border-gray-700': true,
}));

const performanceLabel = computed(() => {
  if (hasError.value) return 'Error';
  if (isLoading.value) return 'Loading...';
  return isOptimized.value ? 'Optimized' : 'Original';
});

const qualityLabel = computed(() => {
  if (hasError.value) return 'Error';
  if (isLoading.value) return 'Loading';
  return isOptimized.value ? 'WebP' : 'JPEG';
});

// Methods
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  const loadTime = performance.now() - loadStartTime.value;

  isLoading.value = false;
  hasError.value = false;

  // Check if WebP was successfully loaded
  isOptimized.value = img.src.includes('.webp');

  // Get image dimensions
  if (img.naturalWidth && img.naturalHeight) {
    dimensions.value = `${img.naturalWidth}×${img.naturalHeight}`;
  }

  // Get file size (approximate)
  imageSize.value = Math.round((img.naturalWidth * img.naturalHeight * 3) / 1024);

  // Determine format
  formatUsed.value = isOptimized.value ? 'WebP' : 'JPEG';

  // Hide animation after a delay
  setTimeout(() => {
    showAnimation.value = false;
  }, 1000);

  // Emit load event
  emit('load', { loadTime, format: formatUsed.value, optimized: isOptimized.value });
};

const handleImageError = (event: Event) => {
  const logger = useSentryLogger();
  logger.logError('Image failed to load', new Error('Image load failed'), {
    component: 'OptimizedImage',
    imageSrc: props.src,
  });
  isLoading.value = false;
  hasError.value = true;
  emit('error', event);
};

const handleLoadStart = () => {
  loadStartTime.value = performance.now();
};

const getPerformanceColor = () => {
  if (hasError.value) return '#ef4444';
  if (isLoading.value) return '#f59e0b';
  if (isOptimized.value) return '#10b981';
  return '#6b7280';
};

const getQualityBadgeClass = () => {
  if (hasError.value) return 'bg-red-500 text-white';
  if (isLoading.value) return 'bg-yellow-500 text-white';
  if (isOptimized.value) return 'bg-green-500 text-white';
  return 'bg-gray-500 text-white';
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const errorMessage = computed(() => {
  if (hasError.value) {
    return 'Failed to load image';
  }
  return '';
});

// Emits
const emit = defineEmits<{
  load: [event: { loadTime: number; format: string; optimized: boolean }];
  error: [event: Event];
}>();

// Lifecycle
onMounted(() => {
  // Reset states when src changes
  if (props.src) {
    isLoading.value = true;
    hasError.value = false;
  }
});

// Watch for src changes
watch(
  () => props.src,
  (newSrc: string) => {
    if (newSrc) {
      isLoading.value = true;
      hasError.value = false;
      showAnimation.value = true;
    }
  }
);
</script>

<style scoped>
.optimized-image-container {
  position: relative;
  display: inline-block;
}

.image-wrapper {
  position: relative;
  display: inline-block;
}

.image-skeleton {
  position: relative;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  border-radius: 0.5rem;
  overflow: hidden;
}

.dark .image-skeleton {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
}

.dark .skeleton-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.image-error {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
}

.dark .image-error {
  background: #1f2937;
  border-color: #4b5563;
}

.error-content {
  text-align: center;
}

.performance-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 0.5rem;
  padding: 4px 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark .performance-indicator {
  background: rgba(17, 24, 39, 0.9);
}

.quality-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  border-radius: 0.5rem;
  padding: 4px 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  padding: 16px;
  z-index: 10;
}

.info-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: 0.5rem;
  padding: 8px 12px;
  display: inline-block;
}

.dark .info-content {
  background: rgba(17, 24, 39, 0.95);
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Animation for optimized indicator */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive improvements */
@media (max-width: 768px) {
  .performance-indicator,
  .quality-badge {
    font-size: 0.75rem;
    padding: 2px 6px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer,
  .image-skeleton {
    animation: none;
  }

  img {
    transition: none;
  }
}
</style>
