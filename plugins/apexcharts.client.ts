import VueApexCharts from 'vue3-apexcharts';

/**
 * ApexCharts plugin for Nuxt 4
 * Registers VueApexCharts globally
 */
export default defineNuxtPlugin({
  name: 'apexcharts',
  setup(nuxtApp) {
    nuxtApp.vueApp.use(VueApexCharts);
  },
});
