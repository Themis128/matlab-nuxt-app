/**
 * Pinia store for managing image cache and preloading
 * Optimizes image loading performance across the application
 */

import { defineStore } from 'pinia';
import type { AlgoliaRecord } from '~/types/algolia';

interface ImageCacheEntry {
  url: string;
  loaded: boolean;
  error: boolean;
  timestamp: number;
  dimensions?: { width: number; height: number };
}

interface ImageCacheState {
  // Use plain objects/arrays for serialization compatibility
  cache: Record<string, ImageCacheEntry>;
  preloadedImages: string[];
  maxCacheSize: number;
  cacheExpiry: number; // in milliseconds (24 hours)
}

export const useImageCacheStore = defineStore('imageCache', {
  state: (): ImageCacheState => ({
    cache: {}, // Plain object instead of Map for serialization
    preloadedImages: [], // Array instead of Set for serialization
    maxCacheSize: 500, // Maximum number of cached images
    cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  }),

  getters: {
    /**
     * Check if an image is cached and valid
     */
    isCached:
      (state) =>
      (url: string): boolean => {
        const entry = state.cache[url];
        if (!entry) return false;

        // Check if cache entry is expired
        const now = Date.now();
        if (now - entry.timestamp > state.cacheExpiry) {
          // Entry is expired, return false immediately
          return false;
        }

        return entry.loaded && !entry.error;
      },

    /**
     * Get cache entry for an image
     */
    getCacheEntry:
      (state) =>
      (url: string): ImageCacheEntry | undefined => {
        return state.cache[url];
      },

    /**
     * Check if image is preloaded
     */
    isPreloaded:
      (state) =>
      (url: string): boolean => {
        return state.preloadedImages.includes(url);
      },

    /**
     * Get cache statistics
     */
    cacheStats: (state) => {
      const entries = Object.values(state.cache);
      const total = entries.length;
      const loaded = entries.filter((e) => e.loaded).length;
      const errors = entries.filter((e) => e.error).length;
      const preloaded = state.preloadedImages.length;

      return {
        total,
        loaded,
        errors,
        preloaded,
        hitRate: total > 0 ? (loaded / total) * 100 : 0,
      };
    },
  },

  actions: {
    /**
     * Add or update image cache entry
     */
    setCacheEntry(url: string, entry: Partial<ImageCacheEntry>) {
      const existing = this.cache[url] || {
        url,
        loaded: false,
        error: false,
        timestamp: Date.now(),
      };
      // Preserve timestamp if provided, otherwise use existing or current time
      const timestamp =
        entry.timestamp !== undefined ? entry.timestamp : existing.timestamp || Date.now();

      this.cache[url] = {
        ...existing,
        ...entry,
        timestamp, // Use the calculated timestamp (this overrides any timestamp from entry spread)
      };

      // Enforce max cache size
      const entries = Object.entries(this.cache);
      if (entries.length > this.maxCacheSize) {
        // Remove oldest entries
        entries
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, entries.length - this.maxCacheSize)
          .forEach(([url]) => delete this.cache[url]);
      }
    },

    /**
     * Mark image as loaded
     */
    markAsLoaded(url: string, dimensions?: { width: number; height: number }) {
      this.setCacheEntry(url, {
        loaded: true,
        error: false,
        dimensions,
      });
    },

    /**
     * Mark image as error
     */
    markAsError(url: string) {
      this.setCacheEntry(url, {
        loaded: false,
        error: true,
      });
    },

    /**
     * Preload an image
     */
    async preloadImage(url: string): Promise<boolean> {
      if (this.isPreloaded(url) || this.isCached(url)) {
        return true;
      }

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (!this.preloadedImages.includes(url)) {
            this.preloadedImages.push(url);
          }
          this.markAsLoaded(url, {
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          resolve(true);
        };
        img.onerror = () => {
          this.markAsError(url);
          resolve(false);
        };
        img.src = url;
      });
    },

    /**
     * Preload multiple images
     */
    async preloadImages(urls: string[]): Promise<{ success: number; failed: number }> {
      const results = await Promise.allSettled(urls.map((url) => this.preloadImage(url)));

      const success = results.filter((r) => r.status === 'fulfilled' && r.value).length;
      const failed = results.length - success;

      return { success, failed };
    },

    /**
     * Preload images from Algolia records
     */
    async preloadRecordImages(records: AlgoliaRecord[]): Promise<void> {
      const { normalizeImageUrl } = useAlgoliaImage();
      const urls = records
        .map((record) => normalizeImageUrl(record))
        .filter((url) => !this.isPreloaded(url) && !this.isCached(url));

      if (urls.length > 0) {
        // Preload in batches to avoid overwhelming the browser
        const batchSize = 5;
        for (let i = 0; i < urls.length; i += batchSize) {
          const batch = urls.slice(i, i + batchSize);
          await this.preloadImages(batch);
          // Small delay between batches
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    },

    /**
     * Clear expired cache entries
     */
    clearExpired() {
      const now = Date.now();
      const expired: string[] = [];

      Object.entries(this.cache).forEach(([url, entry]) => {
        if (now - entry.timestamp > this.cacheExpiry) {
          expired.push(url);
        }
      });

      expired.forEach((url) => {
        delete this.cache[url];
      });
      return expired.length;
    },

    /**
     * Clear all cache
     */
    clearCache() {
      this.cache = {};
      this.preloadedImages = [];
    },

    /**
     * Remove specific cache entry
     */
    removeCacheEntry(url: string) {
      delete this.cache[url];
      const index = this.preloadedImages.indexOf(url);
      if (index > -1) {
        this.preloadedImages.splice(index, 1);
      }
    },
  },

  persist: {
    key: 'image-cache-store',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    paths: ['cache', 'preloadedImages'],
  },
});
