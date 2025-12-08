/**
 * Nuxt 4 plugin for VueUse integration
 * Provides global access to VueUse composables
 */
export default defineNuxtPlugin((nuxtApp: any) => {
  // VueUse is auto-imported in Nuxt 4
  // This plugin can be used to configure VueUse globally or add custom utilities

  if (process.client) {
    // Example: Configure useLocalStorage defaults
    // This is just a setup example - actual usage is in composables

    // You can also add global VueUse utilities here
    nuxtApp.provide('vueuse', {
      // Add any global VueUse configurations
    });
  }
});
