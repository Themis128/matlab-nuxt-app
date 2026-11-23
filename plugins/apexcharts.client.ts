import VueApexCharts from 'vue3-apexcharts';
import type { ObjectPlugin } from 'nuxt/app';

/**
 * ApexCharts plugin for Nuxt 4
 * Registers VueApexCharts globally
 */
const apexchartsPlugin: ObjectPlugin = defineNuxtPlugin({
  name: 'apexcharts',
  setup(nuxtApp: any): void {
    nuxtApp.vueApp.use(VueApexCharts);
  },
});

export default apexchartsPlugin;
