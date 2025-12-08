/**
 * Robust composable for handling Algolia search result images
 * Ensures correct image paths, dimensions, and fallbacks
 */

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio?: number;
}

export interface ImageConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

export type ImageSizePreset = 'thumbnail' | 'card' | 'detail' | 'gallery' | 'hero';

const IMAGE_PRESETS: Record<ImageSizePreset, { width: number; height: number; quality: number }> = {
  thumbnail: { width: 64, height: 64, quality: 75 },
  card: { width: 200, height: 200, quality: 80 },
  detail: { width: 400, height: 400, quality: 85 },
  gallery: { width: 800, height: 800, quality: 90 },
  hero: { width: 1200, height: 800, quality: 90 },
};

const DEFAULT_IMAGE = '/mobile_images/default-phone.svg';
const DEFAULT_ALT = 'Phone image not available';

/**
 * Normalize image URL from Algolia record
 * Handles multiple possible field names and path formats
 */
export function normalizeImageUrl(
  record: {
    image_url?: string;
    image?: string;
    photo?: string;
    [key: string]: any;
  },
  fallback: string = DEFAULT_IMAGE
): string {
  // Try different field names in order of preference
  const imageUrl = record.image_url || record.image || record.photo;

  if (!imageUrl || typeof imageUrl !== 'string') {
    return fallback;
  }

  // Normalize path - ensure it starts with / if it's a relative path
  let normalized = imageUrl.trim();

  // If it's already a full URL, return as-is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  // Ensure relative paths start with /
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  // Remove duplicate slashes
  normalized = normalized.replace(/\/+/g, '/');

  // Validate path format
  if (normalized.includes('..') || normalized.includes('//')) {
    console.warn(`Invalid image path detected: ${imageUrl}, using fallback`);
    return fallback;
  }

  return normalized;
}

/**
 * Get image configuration for a specific preset
 */
export function getImageConfig(
  record: {
    image_url?: string;
    image?: string;
    photo?: string;
    brand?: string;
    name?: string;
    model_name?: string;
    title?: string;
    [key: string]: any;
  },
  preset: ImageSizePreset = 'card',
  customDimensions?: { width: number; height: number }
): ImageConfig {
  const presetConfig = IMAGE_PRESETS[preset];
  const dimensions = customDimensions || presetConfig;

  const src = normalizeImageUrl(record);
  const alt =
    record.brand && (record.name || record.model_name || record.title)
      ? `${record.brand} ${record.name || record.model_name || record.title}`
      : DEFAULT_ALT;

  return {
    src,
    alt,
    width: dimensions.width,
    height: dimensions.height,
    quality: presetConfig.quality,
    format: 'webp',
    sizes: getResponsiveSizes(preset),
  };
}

/**
 * Get responsive sizes string for different presets
 */
function getResponsiveSizes(preset: ImageSizePreset): string {
  switch (preset) {
    case 'thumbnail':
      return '(max-width: 640px) 64px, 64px';
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 200px';
    case 'detail':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 400px, 400px';
    case 'gallery':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px';
    case 'hero':
      return '100vw';
    default:
      return '100vw';
  }
}

/**
 * Validate image URL format
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Check for valid URL format
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Check for valid relative path
  if (url.startsWith('/')) {
    // Reject paths with dangerous patterns
    if (url.includes('..') || url.includes('//')) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Get multiple image URLs from record (for gallery views)
 */
export function getImageUrls(record: {
  image_url?: string;
  image?: string;
  photo?: string;
  images?: string[];
  [key: string]: any;
}): string[] {
  const urls: string[] = [];

  // Primary image
  const primary = normalizeImageUrl(record);
  if (primary !== DEFAULT_IMAGE) {
    urls.push(primary);
  }

  // Additional images array
  if (Array.isArray(record.images)) {
    record.images.forEach((img) => {
      if (typeof img === 'string' && isValidImageUrl(img)) {
        const normalized = normalizeImageUrl({ image_url: img });
        if (normalized !== DEFAULT_IMAGE && !urls.includes(normalized)) {
          urls.push(normalized);
        }
      }
    });
  }

  return urls.length > 0 ? urls : [DEFAULT_IMAGE];
}

/**
 * Main composable for Algolia image handling
 */
export const useAlgoliaImage = () => {
  /**
   * Get optimized image configuration for search results
   */
  const getSearchResultImage = (
    record: {
      image_url?: string;
      image?: string;
      photo?: string;
      brand?: string;
      name?: string;
      model_name?: string;
      title?: string;
      [key: string]: any;
    },
    size: ImageSizePreset = 'card'
  ): ImageConfig => {
    return getImageConfig(record, size);
  };

  /**
   * Get image configuration for detail view
   */
  const getDetailImage = (record: {
    image_url?: string;
    image?: string;
    photo?: string;
    brand?: string;
    name?: string;
    model_name?: string;
    title?: string;
    [key: string]: any;
  }): ImageConfig => {
    return getImageConfig(record, 'detail');
  };

  /**
   * Get all images for a record (for galleries)
   */
  const getAllImages = (record: {
    image_url?: string;
    image?: string;
    photo?: string;
    images?: string[];
    [key: string]: any;
  }): string[] => {
    return getImageUrls(record);
  };

  /**
   * Check if image exists and is valid
   */
  const validateImage = async (url: string): Promise<boolean> => {
    if (!isValidImageUrl(url)) return false;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  /**
   * Preload images for better performance
   */
  const preloadImages = async (records: any[]) => {
    const imageCache = useImageCacheStore();
    await imageCache.preloadRecordImages(records);
  };

  /**
   * Get image with cache support
   */
  const getCachedImage = (record: any, preset: ImageSizePreset = 'card'): ImageConfig => {
    const config = getImageConfig(record, preset);
    const imageCache = useImageCacheStore();

    // Check if image is cached
    if (imageCache.isCached(config.src)) {
      const entry = imageCache.getCacheEntry(config.src);
      if (entry?.dimensions) {
        return {
          ...config,
          width: entry.dimensions.width,
          height: entry.dimensions.height,
        };
      }
    }

    return config;
  };

  return {
    getSearchResultImage,
    getDetailImage,
    getAllImages,
    validateImage,
    normalizeImageUrl,
    isValidImageUrl,
    preloadImages,
    getCachedImage,
    IMAGE_PRESETS,
    DEFAULT_IMAGE,
  };
};
