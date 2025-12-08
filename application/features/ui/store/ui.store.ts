/**
 * Unified UI Store
 *
 * Consolidates:
 * - userPreferencesStore
 * - localeStore
 * - imageCacheStore
 *
 * Provides unified state management for all UI-related functionality.
 */

import { defineStore } from 'pinia';
import type { AlgoliaRecord } from '~/types/algolia';

// ============================================================================
// Types
// ============================================================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  animations: boolean;
  compactMode: boolean;
  autoRefresh: boolean;
  language: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'el';
  preferredCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  searchFilters: {
    priceRange: [number, number];
    screenSize: [number, number];
    batteryCapacity: [number, number];
    ram: number[];
    storage: number[];
    brands: string[];
  };
  notifications: {
    priceAlerts: boolean;
    apiStatus: boolean;
    updates: boolean;
  };
}

export interface LocaleInfo {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

interface ImageCacheEntry {
  url: string;
  loaded: boolean;
  error: boolean;
  timestamp: number;
  dimensions?: { width: number; height: number };
}

// ============================================================================
// Defaults
// ============================================================================

const defaultPreferences: UserPreferences = {
  theme: 'system',
  animations: true,
  compactMode: false,
  autoRefresh: true,
  language: 'en',
  preferredCurrency: 'USD',
  searchFilters: {
    priceRange: [0, 2000],
    screenSize: [5, 8],
    batteryCapacity: [2000, 7000],
    ram: [4, 8, 12, 16],
    storage: [64, 128, 256, 512],
    brands: [],
  },
  notifications: {
    priceAlerts: true,
    apiStatus: true,
    updates: false,
  },
};

const supportedLocales: LocaleInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
];

// ============================================================================
// Store
// ============================================================================

export const useUIStore = defineStore('ui', {
  state: () => ({
    // User Preferences
    preferences: (() => {
      if (typeof window !== 'undefined') {
        try {
          const persisted = localStorage.getItem('mobile-finder-preferences');
          if (persisted) {
            const parsed = JSON.parse(persisted);
            return { ...defaultPreferences, ...parsed };
          }
        } catch (error) {
          const logger = useSentryLogger();
          logger.warn('Failed to load persisted preferences', {
            component: 'uiStore',
            action: 'loadPreferences',
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      return { ...defaultPreferences };
    })() as UserPreferences,

    // Locale
    currentLocale: 'en' as string,
    availableLocales: supportedLocales,
    localeLoading: false,

    // Image Cache
    imageCache: {} as Record<string, ImageCacheEntry>,
    preloadedImages: [] as string[],
    maxCacheSize: 500,
    cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  }),

  getters: {
    // ========================================================================
    // Preferences Getters
    // ========================================================================

    /**
     * Get current theme (resolved if 'system')
     */
    resolvedTheme: (state) => {
      if (state.preferences.theme !== 'system') return state.preferences.theme;

      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      return 'light';
    },

    /**
     * Check if a brand filter is active
     */
    isBrandFilterActive: (state) => (brand: string) => {
      return state.preferences.searchFilters.brands.includes(brand);
    },

    /**
     * Get active filters count
     */
    activeFiltersCount: (state) => {
      let count = 0;
      const filters = state.preferences.searchFilters;

      if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 2000) count++;
      if (filters.screenSize[0] !== 5 || filters.screenSize[1] !== 8) count++;
      if (filters.batteryCapacity[0] !== 2000 || filters.batteryCapacity[1] !== 7000) count++;
      if (filters.ram.length !== 4) count++;
      if (filters.storage.length !== 4) count++;
      if (filters.brands.length > 0) count++;

      return count;
    },

    // ========================================================================
    // Locale Getters
    // ========================================================================

    /**
     * Get current locale info
     */
    currentLocaleInfo: (state): LocaleInfo | undefined => {
      return state.availableLocales.find((l) => l.code === state.currentLocale);
    },

    /**
     * Get locale by code
     */
    getLocaleByCode:
      (state) =>
      (code: string): LocaleInfo | undefined => {
        return state.availableLocales.find((l) => l.code === code);
      },

    /**
     * Check if locale is supported
     */
    isLocaleSupported:
      (state) =>
      (code: string): boolean => {
        return state.availableLocales.some((l) => l.code === code);
      },

    // ========================================================================
    // Image Cache Getters
    // ========================================================================

    /**
     * Check if an image is cached and valid
     */
    isImageCached:
      (state) =>
      (url: string): boolean => {
        const entry = state.imageCache[url];
        if (!entry) return false;

        const now = Date.now();
        if (now - entry.timestamp > state.cacheExpiry) {
          return false;
        }

        return entry.loaded && !entry.error;
      },

    /**
     * Get cache entry for an image
     */
    getImageCacheEntry:
      (state) =>
      (url: string): ImageCacheEntry | undefined => {
        return state.imageCache[url];
      },

    /**
     * Check if image is preloaded
     */
    isImagePreloaded:
      (state) =>
      (url: string): boolean => {
        return state.preloadedImages.includes(url);
      },

    /**
     * Get cache statistics
     */
    imageCacheStats: (state) => {
      const entries = Object.values(state.imageCache);
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
    // ========================================================================
    // Preferences Actions
    // ========================================================================

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mobile-finder-preferences', JSON.stringify(this.preferences));
        } catch (error) {
          const logger = useSentryLogger();
          logger.warn('Failed to save preferences', {
            component: 'uiStore',
            action: 'savePreferences',
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    },

    /**
     * Reset preferences to defaults
     */
    resetPreferences() {
      this.preferences = { ...defaultPreferences };
      this.savePreferences();
    },

    /**
     * Update theme preference
     */
    setTheme(theme: UserPreferences['theme']) {
      this.preferences.theme = theme;
      this.savePreferences();
    },

    /**
     * Update language preference
     */
    setLanguage(language: UserPreferences['language']) {
      this.preferences.language = language;
      this.savePreferences();
      // Sync with locale
      if (this.isLocaleSupported(language)) {
        this.setLocale(language);
      }
    },

    /**
     * Update currency preference
     */
    setCurrency(currency: UserPreferences['preferredCurrency']) {
      this.preferences.preferredCurrency = currency;
      this.savePreferences();
    },

    /**
     * Update search filters
     */
    setPriceRange(range: [number, number]) {
      this.preferences.searchFilters.priceRange = range;
      this.savePreferences();
    },

    setScreenSizeFilter(range: [number, number]) {
      this.preferences.searchFilters.screenSize = range;
      this.savePreferences();
    },

    setBatteryFilter(range: [number, number]) {
      this.preferences.searchFilters.batteryCapacity = range;
      this.savePreferences();
    },

    setRamFilters(ramOptions: number[]) {
      this.preferences.searchFilters.ram = [...ramOptions];
      this.savePreferences();
    },

    setStorageFilters(storageOptions: number[]) {
      this.preferences.searchFilters.storage = [...storageOptions];
      this.savePreferences();
    },

    toggleBrandFilter(brand: string) {
      const index = this.preferences.searchFilters.brands.indexOf(brand);
      if (index > -1) {
        this.preferences.searchFilters.brands.splice(index, 1);
      } else {
        this.preferences.searchFilters.brands.push(brand);
      }
      this.savePreferences();
    },

    setNotificationSettings(settings: Partial<UserPreferences['notifications']>) {
      Object.assign(this.preferences.notifications, settings);
      this.savePreferences();
    },

    // ========================================================================
    // Locale Actions
    // ========================================================================

    /**
     * Initialize locale from preferences or browser
     */
    async initializeLocale() {
      if (typeof window === 'undefined') return;

      const preferredLocale = this.preferences.language;

      if (preferredLocale && this.isLocaleSupported(preferredLocale)) {
        this.currentLocale = preferredLocale;
      } else {
        const browserLocale =
          typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : undefined;
        if (browserLocale && this.isLocaleSupported(browserLocale)) {
          this.currentLocale = browserLocale;
        } else {
          this.currentLocale = 'en';
        }
      }

      document.documentElement.lang = this.currentLocale;

      if (this.preferences.language !== this.currentLocale) {
        this.setLanguage(this.currentLocale as UserPreferences['language']);
      }
    },

    /**
     * Set locale
     */
    async setLocale(locale: string) {
      if (!this.isLocaleSupported(locale)) {
        // Non-critical warning - locale not supported
        if (process.dev) {
          console.warn(`[UI Store] Locale ${locale} is not supported`);
        }
        return;
      }

      this.localeLoading = true;

      try {
        this.currentLocale = locale;

        if (typeof window !== 'undefined') {
          document.documentElement.lang = locale;
        }

        this.setLanguage(locale as UserPreferences['language']);

        try {
          const nuxtApp = useNuxtApp();
          const $i18n = nuxtApp.$i18n;
          if ($i18n && typeof $i18n.setLocale === 'function') {
            await $i18n.setLocale(locale as 'en' | 'el' | 'es' | 'fr' | 'de' | 'it' | 'pt');
          }
        } catch (error) {
          // Non-critical - i18n might not be available yet
          if (process.dev) {
            console.warn('[UI Store] Could not sync with i18n:', error);
          }
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale } }));
        }
      } catch (error) {
        // Log error properly
        if (process.client) {
          try {
            const logger = useSentryLogger();
            logger.logError(
              'Failed to set locale',
              error instanceof Error ? error : new Error(String(error)),
              {
                component: 'ui.store',
                action: 'setLocale',
                locale,
              }
            );
          } catch {
            // Fallback to console if logger unavailable
            console.error('[UI Store] Failed to set locale:', error);
          }
        }
      } finally {
        this.localeLoading = false;
      }
    },

    /**
     * Get translation (delegates to useI18n composable)
     */
    t(key: string, params?: Record<string, unknown>): string {
      const { t } = useI18n();
      return t(key, params ?? {});
    },

    // ========================================================================
    // Image Cache Actions
    // ========================================================================

    /**
     * Add or update image cache entry
     */
    setImageCacheEntry(url: string, entry: Partial<ImageCacheEntry>) {
      const existing = this.imageCache[url] || {
        url,
        loaded: false,
        error: false,
        timestamp: Date.now(),
      };

      const timestamp =
        entry.timestamp !== undefined ? entry.timestamp : existing.timestamp || Date.now();

      this.imageCache[url] = {
        ...existing,
        ...entry,
        timestamp,
      };

      // Enforce max cache size
      const entries = Object.entries(this.imageCache);
      if (entries.length > this.maxCacheSize) {
        entries
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, entries.length - this.maxCacheSize)
          .forEach(([url]) => delete this.imageCache[url]);
      }
    },

    /**
     * Mark image as loaded
     */
    markImageAsLoaded(url: string, dimensions?: { width: number; height: number }) {
      this.setImageCacheEntry(url, {
        loaded: true,
        error: false,
        dimensions,
      });
    },

    /**
     * Mark image as error
     */
    markImageAsError(url: string) {
      this.setImageCacheEntry(url, {
        loaded: false,
        error: true,
      });
    },

    /**
     * Preload an image
     */
    async preloadImage(url: string): Promise<boolean> {
      if (this.isImagePreloaded(url) || this.isImageCached(url)) {
        return true;
      }

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (!this.preloadedImages.includes(url)) {
            this.preloadedImages.push(url);
          }
          this.markImageAsLoaded(url, {
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          resolve(true);
        };
        img.onerror = () => {
          this.markImageAsError(url);
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
        .filter((url) => !this.isImagePreloaded(url) && !this.isImageCached(url));

      if (urls.length > 0) {
        const batchSize = 5;
        for (let i = 0; i < urls.length; i += batchSize) {
          const batch = urls.slice(i, i + batchSize);
          await this.preloadImages(batch);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    },

    /**
     * Clear expired cache entries
     */
    clearExpiredImageCache() {
      const now = Date.now();
      const expired: string[] = [];

      Object.entries(this.imageCache).forEach(([url, entry]) => {
        if (now - entry.timestamp > this.cacheExpiry) {
          expired.push(url);
        }
      });

      expired.forEach((url) => {
        delete this.imageCache[url];
      });
      return expired.length;
    },

    /**
     * Clear all image cache
     */
    clearImageCache() {
      this.imageCache = {};
      this.preloadedImages = [];
    },

    /**
     * Remove specific cache entry
     */
    removeImageCacheEntry(url: string) {
      delete this.imageCache[url];
      const index = this.preloadedImages.indexOf(url);
      if (index > -1) {
        this.preloadedImages.splice(index, 1);
      }
    },
  },

  persist: {
    key: 'ui-store',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    paths: ['preferences', 'currentLocale', 'imageCache', 'preloadedImages'],
  },
});
