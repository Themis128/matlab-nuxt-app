/**
 * Nuxt 4 composable for Christmas theme management
 * Uses useCookie for SSR-friendly theme persistence
 */
export const useChristmasTheme = () => {
  const isActive = useCookie<boolean>('christmas-theme', {
    default: () => false,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  });

  const theme = computed(() => ({
    colors: {
      primary: isActive.value ? '#059669' : '#9333ea', // Green for Christmas, Purple default
      secondary: isActive.value ? '#dc2626' : '#2563eb', // Red for Christmas, Blue default
      accent: isActive.value ? '#fbbf24' : '#f59e0b', // Gold for Christmas, Amber default
      background: isActive.value ? '#fefefe' : '#ffffff',
      text: isActive.value ? '#1f2937' : '#111827',
    },
    isActive: isActive.value,
  }));

  const toggle = () => {
    isActive.value = !isActive.value;

    if (process.client) {
      document.documentElement.classList.toggle('christmas-theme', isActive.value);

      // Trigger theme change event for other components
      window.dispatchEvent(
        new CustomEvent('theme-changed', {
          detail: { isChristmas: isActive.value },
        })
      );
    }
  };

  // Auto-enable during December
  if (process.client) {
    const month = new Date().getMonth();
    if (month === 11 && !isActive.value) {
      // December (0-indexed, so 11 = December)
      isActive.value = true;
      document.documentElement.classList.add('christmas-theme');
    }
  }

  // Watch for theme changes and apply CSS classes
  watch(
    isActive,
    (newValue) => {
      if (process.client) {
        if (newValue) {
          document.documentElement.classList.add('christmas-theme');
        } else {
          document.documentElement.classList.remove('christmas-theme');
        }
      }
    },
    { immediate: true }
  );

  return {
    theme,
    isActive: readonly(isActive),
    toggle,
  };
};
