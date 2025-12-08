import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useImageCacheStore } from '../imageCacheStore';

// Mock composable
vi.mock('~/composables/useAlgoliaImage', () => ({
  useAlgoliaImage: () => ({
    normalizeImageUrl: (record: { image?: string }) => record.image || 'default.jpg',
  }),
}));

describe('imageCacheStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('state', () => {
    it('should initialize with empty cache', () => {
      const store = useImageCacheStore();

      expect(store.cache).toEqual({});
      expect(store.preloadedImages).toEqual([]);
      expect(store.maxCacheSize).toBe(500);
      expect(store.cacheExpiry).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('getters', () => {
    it('should check if image is cached', () => {
      const store = useImageCacheStore();
      const url = 'https://example.com/image.jpg';

      expect(store.isCached(url)).toBe(false);

      store.markAsLoaded(url);
      expect(store.isCached(url)).toBe(true);
    });

    it('should return false for expired cache entries', () => {
      const store = useImageCacheStore();
      const url = 'https://example.com/image.jpg';

      // Set cache entry with old timestamp
      store.setCacheEntry(url, {
        loaded: true,
        error: false,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      });

      // isCached should return false for expired entries
      expect(store.isCached(url)).toBe(false);
    });

    it('should get cache entry', () => {
      const store = useImageCacheStore();
      const url = 'https://example.com/image.jpg';

      store.markAsLoaded(url, { width: 100, height: 200 });
      const entry = store.getCacheEntry(url);

      expect(entry).toBeDefined();
      expect(entry?.loaded).toBe(true);
      expect(entry?.dimensions).toEqual({ width: 100, height: 200 });
    });

    it('should check if image is preloaded', () => {
      const store = useImageCacheStore();
      const url = 'https://example.com/image.jpg';

      expect(store.isPreloaded(url)).toBe(false);

      store.preloadedImages.push(url);
      expect(store.isPreloaded(url)).toBe(true);
    });

    it('should calculate cache statistics', () => {
      const store = useImageCacheStore();

      store.markAsLoaded('image1.jpg');
      store.markAsLoaded('image2.jpg');
      store.markAsError('image3.jpg');

      const stats = store.cacheStats;

      expect(stats.total).toBe(3);
      expect(stats.loaded).toBe(2);
      expect(stats.errors).toBe(1);
    });
  });

  describe('actions', () => {
    it('should mark image as loaded', () => {
      const store = useImageCacheStore();
      const url = 'https://example.com/image.jpg';

      store.markAsLoaded(url, { width: 100, height: 200 });

      const entry = store.getCacheEntry(url);
      expect(entry?.loaded).toBe(true);
      expect(entry?.error).toBe(false);
      expect(entry?.dimensions).toEqual({ width: 100, height: 200 });
    });

    it('should mark image as error', () => {
      const store = useImageCacheStore();
      const url = 'https://example.com/image.jpg';

      store.markAsError(url);

      const entry = store.getCacheEntry(url);
      expect(entry?.error).toBe(true);
      expect(entry?.loaded).toBe(false);
    });

    it('should preload image', async () => {
      const store = useImageCacheStore();
      const url = 'https://example.com/image.jpg';

      // Mock Image constructor
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        naturalWidth = 100;
        naturalHeight = 200;

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      const result = await store.preloadImage(url);

      expect(result).toBe(true);
      expect(store.isPreloaded(url)).toBe(true);
      expect(store.isCached(url)).toBe(true);
    });

    it('should preload multiple images', async () => {
      const store = useImageCacheStore();
      const urls = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        naturalWidth = 100;
        naturalHeight = 200;

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      const result = await store.preloadImages(urls);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
    });

    it('should enforce max cache size', () => {
      const store = useImageCacheStore();
      store.maxCacheSize = 5;

      // Add more than max cache size
      for (let i = 0; i < 10; i++) {
        store.markAsLoaded(`image${i}.jpg`);
      }

      expect(Object.keys(store.cache).length).toBeLessThanOrEqual(5);
    });

    it('should clear expired cache entries', () => {
      const store = useImageCacheStore();

      // Add valid entry
      store.markAsLoaded('valid.jpg');

      // Add expired entry
      store.setCacheEntry('expired.jpg', {
        loaded: true,
        error: false,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago (expired)
      });

      // Verify expired entry exists before clearing
      expect(store.getCacheEntry('expired.jpg')).toBeDefined();

      const cleared = store.clearExpired();

      expect(cleared).toBe(1);
      expect(store.isCached('valid.jpg')).toBe(true);
      expect(store.isCached('expired.jpg')).toBe(false);
    });

    it('should clear all cache', () => {
      const store = useImageCacheStore();

      store.markAsLoaded('image1.jpg');
      store.markAsLoaded('image2.jpg');
      store.preloadedImages.push('image1.jpg');

      store.clearCache();

      expect(Object.keys(store.cache).length).toBe(0);
      expect(store.preloadedImages.length).toBe(0);
    });

    it('should remove specific cache entry', () => {
      const store = useImageCacheStore();

      store.markAsLoaded('image1.jpg');
      store.markAsLoaded('image2.jpg');
      store.preloadedImages.push('image1.jpg');
      store.preloadedImages.push('image2.jpg');

      store.removeCacheEntry('image1.jpg');

      expect(store.isCached('image1.jpg')).toBe(false);
      expect(store.isCached('image2.jpg')).toBe(true);
      expect(store.isPreloaded('image1.jpg')).toBe(false);
    });
  });
});
