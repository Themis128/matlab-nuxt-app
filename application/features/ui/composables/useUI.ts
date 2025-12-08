/**
 * Unified UI Composable
 *
 * Consolidates UI-related functionality:
 * - User preferences
 * - Locale management
 * - Image caching
 */

import { useUIStore } from '../store/ui.store';
import type { UserPreferences, LocaleInfo } from '../store/ui.store';

export const useUI = () => {
  const store = useUIStore();

  // ==========================================================================
  // Preferences
  // ==========================================================================

  /**
   * Get resolved theme
   */
  const theme = computed(() => store.resolvedTheme);

  /**
   * Set theme
   */
  const setTheme = (theme: UserPreferences['theme']) => {
    store.setTheme(theme);
  };

  /**
   * Set language
   */
  const setLanguage = (language: UserPreferences['language']) => {
    store.setLanguage(language);
  };

  /**
   * Set currency
   */
  const setCurrency = (currency: UserPreferences['preferredCurrency']) => {
    store.setCurrency(currency);
  };

  /**
   * Reset preferences
   */
  const resetPreferences = () => {
    store.resetPreferences();
  };

  /**
   * Update search filters
   */
  const setPriceRange = (range: [number, number]) => {
    store.setPriceRange(range);
  };

  const setScreenSizeFilter = (range: [number, number]) => {
    store.setScreenSizeFilter(range);
  };

  const setBatteryFilter = (range: [number, number]) => {
    store.setBatteryFilter(range);
  };

  const setRamFilters = (ramOptions: number[]) => {
    store.setRamFilters(ramOptions);
  };

  const setStorageFilters = (storageOptions: number[]) => {
    store.setStorageFilters(storageOptions);
  };

  const toggleBrandFilter = (brand: string) => {
    store.toggleBrandFilter(brand);
  };

  const setNotificationSettings = (settings: Partial<UserPreferences['notifications']>) => {
    store.setNotificationSettings(settings);
  };

  // ==========================================================================
  // Locale
  // ==========================================================================

  /**
   * Initialize locale
   */
  const initializeLocale = async () => {
    await store.initializeLocale();
  };

  /**
   * Set locale
   */
  const setLocale = async (locale: string) => {
    await store.setLocale(locale);
  };

  /**
   * Get translation
   */
  const t = (key: string, params?: Record<string, unknown>) => {
    return store.t(key, params);
  };

  // ==========================================================================
  // Image Cache
  // ==========================================================================

  /**
   * Preload image
   */
  const preloadImage = async (url: string) => {
    return await store.preloadImage(url);
  };

  /**
   * Preload multiple images
   */
  const preloadImages = async (urls: string[]) => {
    return await store.preloadImages(urls);
  };

  /**
   * Clear image cache
   */
  const clearImageCache = () => {
    store.clearImageCache();
  };

  /**
   * Clear expired cache
   */
  const clearExpiredImageCache = () => {
    return store.clearExpiredImageCache();
  };

  // ==========================================================================
  // Computed Properties
  // ==========================================================================

  const preferences = computed(() => store.preferences);
  const currentLocale = computed(() => store.currentLocale);
  const currentLocaleInfo = computed(() => store.currentLocaleInfo);
  const availableLocales = computed(() => store.availableLocales);
  const localeLoading = computed(() => store.localeLoading);
  const activeFiltersCount = computed(() => store.activeFiltersCount);
  const imageCacheStats = computed(() => store.imageCacheStats);

  /**
   * Check if brand filter is active
   */
  const isBrandFilterActive = (brand: string) => {
    return store.isBrandFilterActive(brand);
  };

  /**
   * Check if image is cached
   */
  const isImageCached = (url: string) => {
    return store.isImageCached(url);
  };

  /**
   * Check if image is preloaded
   */
  const isImagePreloaded = (url: string) => {
    return store.isImagePreloaded(url);
  };

  /**
   * Get locale by code
   */
  const getLocaleByCode = (code: string) => {
    return store.getLocaleByCode(code);
  };

  /**
   * Check if locale is supported
   */
  const isLocaleSupported = (code: string) => {
    return store.isLocaleSupported(code);
  };

  return {
    // Preferences
    theme,
    preferences,
    setTheme,
    setLanguage,
    setCurrency,
    resetPreferences,
    setPriceRange,
    setScreenSizeFilter,
    setBatteryFilter,
    setRamFilters,
    setStorageFilters,
    toggleBrandFilter,
    setNotificationSettings,
    activeFiltersCount,
    isBrandFilterActive,

    // Locale
    currentLocale,
    currentLocaleInfo,
    availableLocales,
    localeLoading,
    initializeLocale,
    setLocale,
    t,
    getLocaleByCode,
    isLocaleSupported,

    // Image Cache
    preloadImage,
    preloadImages,
    clearImageCache,
    clearExpiredImageCache,
    isImageCached,
    isImagePreloaded,
    imageCacheStats,
  };
};
