import VueApexCharts from 'vue3-apexcharts';

// @ts-ignore - defineNuxtPlugin is auto-imported in Nuxt
export default defineNuxtPlugin((nuxtApp: any) => {
  nuxtApp.vueApp.use(VueApexCharts);
});
