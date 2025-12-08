<template>
  <!--
    DaisyUI best practice: data-theme is applied to <html> by plugin
    This wrapper uses semantic DaisyUI classes for consistent theming
  -->
  <div class="min-h-screen bg-base-100">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- DaisyUI Toast Container -->
    <DToastContainer />
  </div>
</template>

<script setup lang="ts">
/**
 * App.vue - Root component with DaisyUI theme integration
 *
 * DaisyUI theme is applied via:
 * - daisyui.client.ts plugin (applies data-theme to <html> element)
 * - Theme switching is handled by @nuxtjs/color-mode module
 *
 * According to DaisyUI documentation:
 * - data-theme should be on the root HTML element (handled by plugin)
 * - Use semantic color classes: bg-base-100, bg-base-200, text-base-content
 * - Components automatically adapt to the current theme
 */
const colorMode = useColorMode();

// Sync theme on mount (plugin handles it, but this ensures consistency)
onMounted(() => {
  if (import.meta.client) {
    // Plugin already handles this, but ensure sync
    const currentTheme = colorMode.value || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }
});
</script>
