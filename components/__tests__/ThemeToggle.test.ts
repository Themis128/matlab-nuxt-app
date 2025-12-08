import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ThemeToggle from '../ThemeToggle.vue';

// Mock composables
vi.mock('#app', () => ({
  useColorMode: () => ({
    value: 'light',
    preference: 'light',
  }),
}));

// Mock useUI composable (used by ThemeToggle)
vi.stubGlobal('useUI', () => ({
  theme: { value: 'light' },
  preferences: { value: { theme: 'light' } },
  setTheme: vi.fn(),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render theme toggle button', () => {
    const wrapper = mount(ThemeToggle, {
      global: {
        stubs: {
          SunIcon: true,
          MoonIcon: true,
        },
      },
    });

    const button = wrapper.find('button[role="switch"]');
    expect(button.exists()).toBe(true);
    expect(button.attributes('aria-label')).toBe('Toggle theme');
  });

  it('should have correct accessibility attributes', () => {
    const wrapper = mount(ThemeToggle, {
      global: {
        stubs: {
          SunIcon: true,
          MoonIcon: true,
        },
      },
    });

    const button = wrapper.find('button[role="switch"]');
    expect(button.attributes('role')).toBe('switch');
    expect(button.attributes('aria-label')).toBe('Toggle theme');
    expect(button.attributes('tabindex')).toBe('0');
  });

  it('should be a Vue instance', () => {
    const wrapper = mount(ThemeToggle, {
      global: {
        stubs: {
          SunIcon: true,
          MoonIcon: true,
        },
      },
    });

    expect(wrapper.vm).toBeTruthy();
  });
});
