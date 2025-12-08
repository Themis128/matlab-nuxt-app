/**
 * daisyUI Plugin
 *
 * Integrates daisyUI theme management with Nuxt color mode
 * Follows DAISYUI_MIGRATION_GUIDE.md patterns
 * Ensures daisyUI themes are properly applied using data-theme attribute
 */
export default defineNuxtPlugin(() => {
  if (import.meta.server) return;

  const colorMode = useColorMode();

  // Function to apply daisyUI theme - using data-theme attribute as per guide
  const applyDaisyUITheme = (theme: string) => {
    const html = document.documentElement;

    // Set data-theme attribute (DaisyUI way)
    html.setAttribute('data-theme', theme);

    // Also maintain dark class for compatibility
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  // Apply initial theme
  applyDaisyUITheme(colorMode.value);

  // Watch for color mode changes
  watch(
    () => colorMode.value,
    (newTheme) => {
      applyDaisyUITheme(newTheme);
    },
    { immediate: true }
  );

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (colorMode.preference === 'system') {
        applyDaisyUITheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }
});
