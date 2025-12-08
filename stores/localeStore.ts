import { defineStore } from 'pinia';

/**
 * Locale Store
 *
 * Manages application locale/translation state
 * Integrates with user preferences store for persistence
 */
export interface LocaleInfo {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

const supportedLocales: LocaleInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
];

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    currentLocale: 'en' as string,
    availableLocales: supportedLocales,
    isLoading: false,
  }),

  getters: {
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
  },

  actions: {
    /**
     * Initialize locale from user preferences or browser
     */
    async initializeLocale() {
      if (typeof window === 'undefined') return;

      // Try to get from user preferences
      const preferencesStore = useUserPreferencesStore();
      const preferredLocale = preferencesStore.language;

      if (preferredLocale && this.isLocaleSupported(preferredLocale)) {
        this.currentLocale = preferredLocale;
      } else {
        // Detect from browser
        const browserLocale =
          typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : undefined;
        if (browserLocale && this.isLocaleSupported(browserLocale)) {
          this.currentLocale = browserLocale;
        } else {
          // Fallback to English
          this.currentLocale = 'en';
        }
      }

      // Update HTML lang attribute
      document.documentElement.lang = this.currentLocale;

      // Sync with user preferences
      if (preferencesStore.language !== this.currentLocale) {
        preferencesStore.setLanguage(this.currentLocale as any);
      }
    },

    /**
     * Set locale
     */
    async setLocale(locale: string) {
      if (!this.isLocaleSupported(locale)) {
        // Non-critical warning - locale not supported
        if (process.dev) {
          console.warn(`[Locale Store] Locale ${locale} is not supported`);
        }
        return;
      }

      this.isLoading = true;

      try {
        this.currentLocale = locale;

        // Update HTML lang attribute
        if (typeof window !== 'undefined') {
          document.documentElement.lang = locale;
        }

        // Update user preferences
        const preferencesStore = useUserPreferencesStore();
        preferencesStore.setLanguage(locale as any);

        // If using @nuxtjs/i18n, update it
        try {
          const nuxtApp = useNuxtApp();
          const $i18n = nuxtApp.$i18n;
          if ($i18n && typeof $i18n.setLocale === 'function') {
            // Type assertion for locale - i18n expects specific locale types
            await $i18n.setLocale(locale as 'en' | 'el' | 'es' | 'fr' | 'de' | 'it' | 'pt');
          }
        } catch (error) {
          // i18n might not be available yet - non-critical
          if (process.dev) {
            console.warn('[Locale Store] Could not sync with i18n:', error);
          }
        }

        // Emit event for other components
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
                component: 'localeStore',
                action: 'setLocale',
                locale,
              }
            );
          } catch {
            // Fallback to console if logger unavailable
            console.error('[Locale Store] Failed to set locale:', error);
          }
        }
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Get translation (delegates to useI18n composable)
     */
    t(key: string, params?: Record<string, unknown>): string {
      const { t } = useI18n();
      return t(key, params ?? {});
    },
  },
});
