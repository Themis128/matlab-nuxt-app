import { defineStore } from 'pinia';

/**
 * Pinia store for user preferences (persisted across sessions)
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  animations: boolean;
  compactMode: boolean;
  autoRefresh: boolean;
  language: 'en' | 'el' | 'es' | 'fr';
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

export const useUserPreferencesStore = defineStore('userPreferences', {
  state: (): UserPreferences => {
    // Load persisted preferences from localStorage
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
          component: 'userPreferencesStore',
          action: 'loadPreferences',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return { ...defaultPreferences };
  },

  actions: {
    /**
     * Save current state to localStorage
     */
    saveToStorage() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mobile-finder-preferences', JSON.stringify(this.$state));
        } catch (error) {
          const logger = useSentryLogger();
          logger.warn('Failed to save preferences to localStorage', {
            component: 'userPreferencesStore',
            action: 'saveToStorage',
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    },

    /**
     * Reset all preferences to default values
     */
    resetToDefaults() {
      Object.assign(this, defaultPreferences);
      this.saveToStorage();
    },

    /**
     * Update theme preference
     */
    setTheme(theme: UserPreferences['theme']) {
      this.theme = theme;
      this.saveToStorage();
    },

    /**
     * Update language preference
     */
    setLanguage(language: UserPreferences['language']) {
      this.language = language;
      this.saveToStorage();
    },

    /**
     * Update currency preference
     */
    setCurrency(currency: UserPreferences['preferredCurrency']) {
      this.preferredCurrency = currency;
      this.saveToStorage();
    },

    /**
     * Update price range filter
     */
    setPriceRange(range: [number, number]) {
      this.searchFilters.priceRange = range;
      this.saveToStorage();
    },

    /**
     * Update screen size filter
     */
    setScreenSizeFilter(range: [number, number]) {
      this.searchFilters.screenSize = range;
      this.saveToStorage();
    },

    /**
     * Update battery capacity filter
     */
    setBatteryFilter(range: [number, number]) {
      this.searchFilters.batteryCapacity = range;
      this.saveToStorage();
    },

    /**
     * Update RAM filters
     */
    setRamFilters(ramOptions: number[]) {
      this.searchFilters.ram = [...ramOptions];
      this.saveToStorage();
    },

    /**
     * Update storage filters
     */
    setStorageFilters(storageOptions: number[]) {
      this.searchFilters.storage = [...storageOptions];
      this.saveToStorage();
    },

    /**
     * Toggle brand in filters
     */
    toggleBrandFilter(brand: string) {
      const index = this.searchFilters.brands.indexOf(brand);
      if (index > -1) {
        this.searchFilters.brands.splice(index, 1);
      } else {
        this.searchFilters.brands.push(brand);
      }
      this.saveToStorage();
    },

    /**
     * Update notification preferences
     */
    setNotificationSettings(settings: Partial<UserPreferences['notifications']>) {
      Object.assign(this.notifications, settings);
      this.saveToStorage();
    },
  },

  getters: {
    /**
     * Get current theme (resolved if 'system')
     */
    getResolvedTheme: (state) => {
      if (state.theme !== 'system') return state.theme;

      // If system preference, detect from browser
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      return 'light';
    },

    /**
     * Check if a brand filter is active
     */
    isBrandFilterActive: (state) => (brand: string) => {
      return state.searchFilters.brands.includes(brand);
    },

    /**
     * Get active filters count
     */
    activeFiltersCount: (state) => {
      let count = 0;

      // Check price range (not default)
      if (state.searchFilters.priceRange[0] !== 0 || state.searchFilters.priceRange[1] !== 2000) {
        count++;
      }

      // Check screen size
      if (state.searchFilters.screenSize[0] !== 5 || state.searchFilters.screenSize[1] !== 8) {
        count++;
      }

      // Check battery
      if (
        state.searchFilters.batteryCapacity[0] !== 2000 ||
        state.searchFilters.batteryCapacity[1] !== 7000
      ) {
        count++;
      }

      // Check RAM (not all selected)
      if (state.searchFilters.ram.length !== 4) {
        count++;
      }

      // Check storage (not all selected)
      if (state.searchFilters.storage.length !== 4) {
        count++;
      }

      // Check brands
      if (state.searchFilters.brands.length > 0) {
        count++;
      }

      return count;
    },
  },
});
