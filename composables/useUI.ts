/**
 * UI Composable
 * Provides UI-related utilities and state management
 */

interface UILocale {
  code: string;
  name: string;
  nativeName: string;
}

interface _UIState {
  currentLocale: string;
  availableLocales: UILocale[];
  localeLoading: boolean;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
}

export function useUI() {
  // Reactive state
  const currentLocale = ref('en');
  const localeLoading = ref(false);
  const theme = ref<'light' | 'dark' | 'system'>('system');
  const sidebarOpen = ref(false);

  // Available locales
  const availableLocales = ref<UILocale[]>([
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  ]);

  // Current locale info
  const currentLocaleInfo = computed(
    () =>
      availableLocales.value.find((locale: UILocale) => locale.code === currentLocale.value) ||
      availableLocales.value[0]
  );

  /**
   * Set the current locale
   */
  const setLocale = async (localeCode: string) => {
    if (localeLoading.value) return;

    localeLoading.value = true;
    try {
      // Validate locale exists
      const localeExists = availableLocales.value.some(
        (locale: UILocale) => locale.code === localeCode
      );
      if (!localeExists) {
        throw new Error(`Locale '${localeCode}' not available`);
      }

      // Update locale
      currentLocale.value = localeCode;

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('ui-locale', localeCode);
      }

      // Here you would typically update the i18n instance
      // For now, we'll just emit an event or call a callback
      console.log(`Locale changed to: ${localeCode}`);
    } catch (_error) {
      console.error('Failed to set locale:', _error);
      throw _error;
    } finally {
      localeLoading.value = false;
    }
  };

  /**
   * Initialize locale from localStorage or browser preference
   */
  const initializeLocale = async () => {
    if (typeof window === 'undefined') return;

    // Try to get from localStorage first
    const savedLocale = localStorage.getItem('ui-locale');
    if (savedLocale) {
      try {
        await setLocale(savedLocale);
        return;
      } catch (_error) {
        console.warn('Saved locale invalid, falling back to browser preference');
      }
    }

    // Fall back to browser language
    const browserLang = navigator.language.split('-')[0];
    const supportedLocale = availableLocales.value.find(
      (locale: UILocale) => locale.code === browserLang
    );

    if (supportedLocale) {
      await setLocale(supportedLocale.code);
    } else {
      // Default to English
      await setLocale('en');
    }
  };

  /**
   * Set theme
   */
  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    theme.value = newTheme;

    if (typeof window !== 'undefined') {
      localStorage.setItem('ui-theme', newTheme);

      // Apply theme to document
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else if (newTheme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  };

  /**
   * Toggle sidebar
   */
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  /**
   * Initialize UI state
   */
  const initialize = async () => {
    await initializeLocale();

    // Load theme from localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ui-theme') as 'light' | 'dark' | 'system' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  };

  // Initialize on first use
  onMounted(() => {
    initialize();
  });

  return {
    // Locale
    currentLocale: readonly(currentLocale),
    availableLocales: readonly(availableLocales),
    currentLocaleInfo,
    localeLoading: readonly(localeLoading),
    setLocale,
    initializeLocale,

    // Theme
    theme: readonly(theme),
    setTheme,

    // Preferences (for backward compatibility)
    preferences: computed(() => ({
      theme: theme.value,
      animations: true,
      compactMode: false,
      autoRefresh: false,
      language: currentLocale.value,
    })),

    // Sidebar
    sidebarOpen: readonly(sidebarOpen),
    toggleSidebar,

    // Additional methods for backward compatibility
    setLanguage: setLocale,
    setCurrency: () => {},
    setNotificationSettings: () => {},
    setPriceRange: () => {},
    setScreenSizeFilter: () => {},
    setBatteryFilter: () => {},
    setRamFilters: () => {},
    setStorageFilters: () => {},
    toggleBrandFilter: () => {},
    resetPreferences: () => {
      theme.value = 'system';
      currentLocale.value = 'en';
    },

    // Initialization
    initialize,
  };
}
