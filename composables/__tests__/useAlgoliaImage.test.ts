import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useAlgoliaImage,
  normalizeImageUrl,
  getImageConfig,
  isValidImageUrl,
  getImageUrls,
} from '../useAlgoliaImage';

// Mock image cache store
const mockImageCacheStore = {
  preloadRecordImages: vi.fn(),
  isCached: vi.fn(() => false),
  getCacheEntry: vi.fn(() => null),
};

vi.mock('~/stores/imageCacheStore', () => ({
  useImageCacheStore: () => mockImageCacheStore,
}));

describe('useAlgoliaImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeImageUrl', () => {
    it('should return image_url if available', () => {
      const record = { image_url: '/images/phone.jpg' };
      const result = normalizeImageUrl(record);

      expect(result).toBe('/images/phone.jpg');
    });

    it('should fallback to image field', () => {
      const record = { image: '/images/phone.jpg' };
      const result = normalizeImageUrl(record);

      expect(result).toBe('/images/phone.jpg');
    });

    it('should fallback to photo field', () => {
      const record = { photo: '/images/phone.jpg' };
      const result = normalizeImageUrl(record);

      expect(result).toBe('/images/phone.jpg');
    });

    it('should use default fallback if no image found', () => {
      const record = {};
      const result = normalizeImageUrl(record);

      expect(result).toBe('/mobile_images/default-phone.png');
    });

    it('should normalize relative paths to start with /', () => {
      const record = { image_url: 'images/phone.jpg' };
      const result = normalizeImageUrl(record);

      expect(result).toBe('/images/phone.jpg');
    });

    it('should keep absolute URLs as-is', () => {
      const record = { image_url: 'https://example.com/image.jpg' };
      const result = normalizeImageUrl(record);

      expect(result).toBe('https://example.com/image.jpg');
    });

    it('should reject paths with directory traversal', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const record = { image_url: '../../../etc/passwd' };
      const result = normalizeImageUrl(record);

      expect(result).toBe('/mobile_images/default-phone.png');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getImageConfig', () => {
    it('should return image config with default preset', () => {
      const record = {
        image_url: '/images/phone.jpg',
        brand: 'Apple',
        name: 'iPhone 15',
      };

      const config = getImageConfig(record);

      expect(config.src).toBe('/images/phone.jpg');
      expect(config.alt).toBe('Apple iPhone 15');
      expect(config.width).toBe(200);
      expect(config.height).toBe(200);
      expect(config.format).toBe('webp');
    });

    it('should use custom dimensions when provided', () => {
      const record = { image_url: '/images/phone.jpg' };
      const config = getImageConfig(record, 'card', { width: 300, height: 300 });

      expect(config.width).toBe(300);
      expect(config.height).toBe(300);
    });

    it('should use model_name if name not available', () => {
      const record = {
        image_url: '/images/phone.jpg',
        brand: 'Apple',
        model_name: 'iPhone 15',
      };

      const config = getImageConfig(record);

      expect(config.alt).toBe('Apple iPhone 15');
    });

    it('should use default alt if brand/name not available', () => {
      const record = { image_url: '/images/phone.jpg' };
      const config = getImageConfig(record);

      expect(config.alt).toBe('Phone image not available');
    });
  });

  describe('isValidImageUrl', () => {
    it('should validate absolute URLs', () => {
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true);
    });

    it('should validate relative paths', () => {
      expect(isValidImageUrl('/images/phone.jpg')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidImageUrl('')).toBe(false);
      expect(isValidImageUrl('not-a-url')).toBe(false);
      expect(isValidImageUrl('/images/../etc/passwd')).toBe(false);
    });

    it('should reject paths with directory traversal', () => {
      expect(isValidImageUrl('/images/../../etc/passwd')).toBe(false);
    });
  });

  describe('getImageUrls', () => {
    it('should return primary image URL', () => {
      const record = { image_url: '/images/phone.jpg' };
      const urls = getImageUrls(record);

      expect(urls).toContain('/images/phone.jpg');
    });

    it('should include additional images from images array', () => {
      const record = {
        image_url: '/images/phone1.jpg',
        images: ['/images/phone2.jpg', '/images/phone3.jpg'],
      };

      const urls = getImageUrls(record);

      expect(urls).toHaveLength(3);
      expect(urls).toContain('/images/phone1.jpg');
      expect(urls).toContain('/images/phone2.jpg');
      expect(urls).toContain('/images/phone3.jpg');
    });

    it('should return default image if no images found', () => {
      const record = {};
      const urls = getImageUrls(record);

      expect(urls).toEqual(['/mobile_images/default-phone.png']);
    });

    it('should filter out invalid image URLs', () => {
      const record = {
        image_url: '/images/phone.jpg',
        images: ['invalid-url', '/images/valid.jpg'],
      };

      const urls = getImageUrls(record);

      expect(urls).toContain('/images/phone.jpg');
      expect(urls).toContain('/images/valid.jpg');
      expect(urls).not.toContain('invalid-url');
    });
  });

  describe('useAlgoliaImage composable', () => {
    it('should return all image methods', () => {
      const image = useAlgoliaImage();

      expect(image).toHaveProperty('getSearchResultImage');
      expect(image).toHaveProperty('getDetailImage');
      expect(image).toHaveProperty('getAllImages');
      expect(image).toHaveProperty('validateImage');
      expect(image).toHaveProperty('preloadImages');
      expect(image).toHaveProperty('getCachedImage');
    });

    it('should get search result image with preset', () => {
      const image = useAlgoliaImage();
      const record = { image_url: '/images/phone.jpg', brand: 'Apple', name: 'iPhone' };

      const config = image.getSearchResultImage(record, 'thumbnail');

      expect(config.width).toBe(64);
      expect(config.height).toBe(64);
    });

    it('should get detail image', () => {
      const image = useAlgoliaImage();
      const record = { image_url: '/images/phone.jpg', brand: 'Apple', name: 'iPhone' };

      const config = image.getDetailImage(record);

      expect(config.width).toBe(400);
      expect(config.height).toBe(400);
    });

    it('should validate image URL', async () => {
      const image = useAlgoliaImage();

      // Mock Image constructor
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      };

      global.Image = vi.fn(() => mockImage) as any;

      const validatePromise = image.validateImage('/images/phone.jpg');

      // Simulate successful load
      if (mockImage.onload) {
        mockImage.onload();
      }

      const result = await validatePromise;
      expect(result).toBe(true);
    });

    it('should preload images', async () => {
      const image = useAlgoliaImage();
      const records = [{ image_url: '/images/phone1.jpg' }, { image_url: '/images/phone2.jpg' }];

      await image.preloadImages(records);

      expect(mockImageCacheStore.preloadRecordImages).toHaveBeenCalledWith(records);
    });

    it('should get cached image if available', () => {
      mockImageCacheStore.isCached.mockReturnValue(true);
      mockImageCacheStore.getCacheEntry.mockReturnValue({
        dimensions: { width: 300, height: 300 },
      } as any);

      const image = useAlgoliaImage();
      const record = { image_url: '/images/phone.jpg' };

      const config = image.getCachedImage(record);

      expect(config.width).toBe(300);
      expect(config.height).toBe(300);
    });

    it('should return normal config if not cached', () => {
      mockImageCacheStore.isCached.mockReturnValue(false);

      const image = useAlgoliaImage();
      const record = { image_url: '/images/phone.jpg' };

      const config = image.getCachedImage(record);

      expect(config.width).toBe(200); // Default card preset
      expect(config.height).toBe(200);
    });
  });
});
