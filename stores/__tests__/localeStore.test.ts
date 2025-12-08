import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock auto-imported composables using global mock - MUST be before importing the store
const mockUserPreferencesStore = {
  language: 'en',
  setLanguage: vi.fn(),
};

// Mock the store module
vi.mock('~/stores/userPreferencesStore', () => ({
  useUserPreferencesStore: () => mockUserPreferencesStore,
}));

// Make useUserPreferencesStore available globally (for auto-imports)
vi.stubGlobal('useUserPreferencesStore', () => mockUserPreferencesStore);

// Import after mocks are set up
import { useLocaleStore } from '../localeStore';

// Mock useI18n - Nuxt auto-imports this
const mockI18n = {
  t: (key: string) => key,
  setLocale: vi.fn(),
  locale: { value: 'en' },
};

vi.mock('#app', () => ({
  useI18n: () => mockI18n,
  useNuxtApp: () => ({
    $i18n: {
      setLocale: vi.fn(),
    },
  }),
}));

// Make useI18n and useNuxtApp available globally (for auto-imports)
vi.stubGlobal('useI18n', () => mockI18n);
vi.stubGlobal('useNuxtApp', () => ({
  $i18n: {
    setLocale: vi.fn(),
  },
}));

describe('localeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Mock document
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'en';
    }
  });

  describe('state', () => {
    it('should initialize with default state', () => {
      const store = useLocaleStore();

      expect(store.currentLocale).toBe('en');
      expect(store.availableLocales).toHaveLength(7);
      expect(store.isLoading).toBe(false);
    });
  });

  describe('getters', () => {
    it('should get current locale info', () => {
      const store = useLocaleStore();
      store.currentLocale = 'es';

      const info = store.currentLocaleInfo;

      expect(info?.code).toBe('es');
      expect(info?.name).toBe('Spanish');
      expect(info?.nativeName).toBe('Español');
    });

    it('should get locale by code', () => {
      const store = useLocaleStore();

      const locale = store.getLocaleByCode('fr');

      expect(locale?.code).toBe('fr');
      expect(locale?.name).toBe('French');
    });

    it('should check if locale is supported', () => {
      const store = useLocaleStore();

      expect(store.isLocaleSupported('en')).toBe(true);
      expect(store.isLocaleSupported('es')).toBe(true);
      expect(store.isLocaleSupported('xx')).toBe(false);
    });
  });

  describe('actions', () => {
    it('should initialize locale from user preferences', async () => {
      mockUserPreferencesStore.language = 'es';

      const store = useLocaleStore();
      await store.initializeLocale();

      expect(store.currentLocale).toBe('es');
    });

    it('should fallback to browser locale if preference not supported', async () => {
      mockUserPreferencesStore.language = 'xx' as any; // Unsupported

      // Mock navigator.language
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        writable: true,
      });

      const store = useLocaleStore();
      await store.initializeLocale();

      expect(store.currentLocale).toBe('fr');
    });

    it('should fallback to English if browser locale not supported', async () => {
      mockUserPreferencesStore.language = 'xx' as any;

      Object.defineProperty(navigator, 'language', {
        value: 'xx-XX',
        writable: true,
      });

      const store = useLocaleStore();
      await store.initializeLocale();

      expect(store.currentLocale).toBe('en');
    });

    it('should set locale', async () => {
      const store = useLocaleStore();

      await store.setLocale('fr');

      expect(store.currentLocale).toBe('fr');
      expect(store.isLoading).toBe(false);
    });

    it('should not set unsupported locale', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const store = useLocaleStore();
      const originalLocale = store.currentLocale;

      await store.setLocale('xx');

      expect(store.currentLocale).toBe(originalLocale);
      expect(consoleSpy).toHaveBeenCalledWith('Locale xx is not supported');

      consoleSpy.mockRestore();
    });

    it('should update HTML lang attribute when setting locale', async () => {
      const store = useLocaleStore();

      await store.setLocale('es');

      if (typeof document !== 'undefined') {
        expect(document.documentElement.lang).toBe('es');
      }
    });

    it('should emit locale-changed event', async () => {
      const store = useLocaleStore();
      const eventSpy = vi.fn();
      if (typeof window !== 'undefined') {
        window.addEventListener('locale-changed', eventSpy);

        await store.setLocale('de');

        // Wait for event to be dispatched
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(eventSpy).toHaveBeenCalled();
        window.removeEventListener('locale-changed', eventSpy);
      }
    });

    it('should get translation', () => {
      const store = useLocaleStore();

      const translation = store.t('test.key', { param: 'value' });

      expect(translation).toBe('test.key'); // Mocked to return key
    });
  });
});
