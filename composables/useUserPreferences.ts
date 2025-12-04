/**
 * User preferences composable
 * Manages persistent user settings across sessions
 */

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
    if (!import.meta.client) return;

    try {
      const stored = localStorage.getItem('mobile-finder-preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate stored data structure
        if (parsed && typeof parsed === 'object') {
          preferences.value = { ...defaultPreferences, ...parsed };
        }
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
      // Clear corrupted data
      localStorage.removeItem('mobile-finder-preferences');
    }
  };

  // Save preferences to localStorage
  const savePreferences = () => {
    if (!import.meta.client) return;

    try {
      localStorage.setItem('mobile-finder-preferences', JSON.stringify(preferences.value));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
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
  const applyTheme = (theme: UserPreferences['theme']) => {
    if (!import.meta.client) return;

    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      // Use selected theme
      root.classList.add(theme);
    }

    // Trigger theme change event for other components
    root.setAttribute('data-theme', theme);
  };

  // Apply animation preference
  const applyAnimationPreference = (enabled: boolean) => {
    if (!import.meta.client) return;

    const root = document.documentElement;
    root.style.setProperty('--animation-duration', enabled ? '300ms' : '0ms');

    if (enabled) {
      root.classList.remove('no-animations');
    } else {
      root.classList.add('no-animations');
    }
  };

  // Watch for system theme changes when theme is set to 'system'
  let mediaQuery: MediaQueryList | null = null;

  const setupThemeListener = () => {
    if (!import.meta.client) return;

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = (_e: MediaQueryListEvent) => {
      if (preferences.value.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    // Return cleanup function
    return () => {
      mediaQuery?.removeEventListener('change', handleThemeChange);
      mediaQuery = null;
    };
  };

  // Initialize preferences on client side
  onMounted(() => {
    loadPreferences();
    applyTheme(preferences.value.theme);
    applyAnimationPreference(preferences.value.animations);

    // Setup theme listener and store cleanup
    const cleanup = setupThemeListener();

    // Clean up on unmount
    if (cleanup) {
      onUnmounted(() => {
        cleanup();
      });
    }
  });

  // Reset preferences to defaults
  const resetPreferences = () => {
    preferences.value = { ...defaultPreferences };
    savePreferences();
    applyTheme(defaultPreferences.theme);
    applyAnimationPreference(defaultPreferences.animations);
  };

  // Get preference with validation
  const getPreference = <K extends keyof UserPreferences>(key: K): UserPreferences[K] => {
    return preferences.value[key];
  };

  // Check if preferences have been modified from defaults
  const hasUnsavedChanges = computed(() => {
    const current = preferences.value;
    return (
      current.theme !== defaultPreferences.theme ||
      current.animations !== defaultPreferences.animations ||
      current.compactMode !== defaultPreferences.compactMode ||
      current.autoRefresh !== defaultPreferences.autoRefresh ||
      current.language !== defaultPreferences.language
    );
  });

  return {
    preferences: readonly(preferences),
    updatePreference,
    resetPreferences,
    loadPreferences,
    savePreferences,
    getPreference,
    hasUnsavedChanges,
  };
}
