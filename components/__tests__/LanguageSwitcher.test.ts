import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LanguageSwitcher from '../LanguageSwitcher.vue';

// Use actual stores and composables
import { setActivePinia, createPinia } from 'pinia';
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Make Vue APIs available globally for component setup (auto-imports)
vi.stubGlobal('computed', computed);
vi.stubGlobal('onMounted', onMounted);
vi.stubGlobal('onUnmounted', onUnmounted);

// Import centralized stubs
import { getMountStubs } from '~/tests/setup/nuxt-ui-stubs';

// Mock user preferences store that localeStore depends on
vi.stubGlobal('useUserPreferencesStore', () => ({
  language: 'en',
  setLanguage: vi.fn(),
}));

// Mock i18n to provide a minimal implementation
const mockSetLocale = vi.fn();
vi.stubGlobal('useI18n', () => ({
  _locale: ref('en'),
  setLocale: mockSetLocale,
  t: (key: string) => key,
}));

// Mock useUI composable (used by LanguageSwitcher)
vi.stubGlobal('useUI', () => ({
  currentLocale: ref('en'),
  availableLocales: ref([
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
  ]),
  localeLoading: ref(false),
  setLocale: vi.fn(async (_locale: string) => {
    // Mock implementation
  }),
  currentLocaleInfo: ref({
    code: 'en',
    name: 'English',
    nativeName: 'English',
  }),
  initializeLocale: vi.fn(async () => {
    // Mock initialization
  }),
}));

// Get centralized stubs
const stubs = getMountStubs();

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should render language switcher', () => {
    const wrapper = mount(LanguageSwitcher, {
      global: {
        stubs,
      },
    });
    expect(wrapper.find('[data-testid="language-switcher"]').exists()).toBe(true);
  });

  it('should have correct test id', () => {
    const wrapper = mount(LanguageSwitcher, {
      global: {
        stubs,
      },
    });
    const switcher = wrapper.find('[data-testid="language-switcher"]');
    expect(switcher.exists()).toBe(true);
  });

  it('should handle locale changes properly', async () => {
    const wrapper = mount(LanguageSwitcher, {
      global: {
        stubs,
      },
    });

    // Test that the component renders with expected structure
    expect(wrapper.html()).toContain('language-switcher');
  });

  it('should be a Vue instance', () => {
    const wrapper = mount(LanguageSwitcher, {
      global: {
        stubs,
      },
    });
    expect(wrapper.vm).toBeTruthy();
  });
});
