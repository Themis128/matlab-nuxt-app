/**
 * User preferences composable
 * Manages persistent user settings across sessions
 */

import { ref, readonly, onMounted, onUnmounted } from 'vue';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  animations: boolean;
  compactMode: boolean;
  autoRefresh: boolean;
  language: string;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  animations: true,
  compactMode: false,
  autoRefresh: true,
  language: 'en',
};

export function useUserPreferences() {
  const preferences = ref<UserPreferences>({ ...defaultPreferences });

  // Load preferences from localStorage on client side
  const loadPreferences = () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem('mobile-finder-preferences');
        if (stored) {
          const parsed = JSON.parse(stored);
          preferences.value = { ...defaultPreferences, ...parsed };
        }
      } catch (error) {
        console.warn('Failed to load user preferences:', error);
      }
    }
  };

  // Save preferences to localStorage
  const savePreferences = () => {
    if (process.client) {
      try {
        localStorage.setItem('mobile-finder-preferences', JSON.stringify(preferences.value));
      } catch (error) {
        console.warn('Failed to save user preferences:', error);
      }
    }
  };

  // Update a specific preference
  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    preferences.value[key] = value;
    savePreferences();

    // Apply theme change immediately
    if (key === 'theme') {
      applyTheme(value as UserPreferences['theme']);
    }

    // Apply animation preference
    if (key === 'animations') {
      applyAnimationPreference(value as boolean);
    }
  };

  // Apply theme based on preference
  const applyTheme = (_theme: UserPreferences['theme']) => {
    if (process.client) {
      // For now, just store the preference - the ThemeToggle component handles the actual theme switching
      // This can be enhanced later to work with @nuxtjs/color-mode if needed
    }
  };

  // Apply animation preference
  const applyAnimationPreference = (enabled: boolean) => {
    if (process.client) {
      document.documentElement.style.setProperty('--animation-duration', enabled ? '300ms' : '0ms');

      if (enabled) {
        document.documentElement.classList.remove('no-animations');
      } else {
        document.documentElement.classList.add('no-animations');
      }
    }
  };

  // Reset preferences to defaults
  const resetPreferences = () => {
    preferences.value = { ...defaultPreferences };
    savePreferences();
    applyTheme(defaultPreferences.theme);
    applyAnimationPreference(defaultPreferences.animations);
  };

  // Initialize preferences on client side
  onMounted(() => {
    loadPreferences();
    applyTheme(preferences.value.theme);
    applyAnimationPreference(preferences.value.animations);
  });

  // Watch for system theme changes when theme is set to 'system'
  if (process.client) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      if (preferences.value.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    });
  }

  return {
    preferences: readonly(preferences),
    updatePreference,
    resetPreferences,
    loadPreferences,
    savePreferences,
  };
}
