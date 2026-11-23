/**
 * Lucide Vue Icons plugin
 * Provides access to Lucide icons alongside Heroicons
 */
import { defineNuxtPlugin } from '#app';
import type { ObjectPlugin } from 'nuxt/app';

const lucidePlugin: ObjectPlugin = defineNuxtPlugin({
  name: 'lucide-icons',
  setup() {
    // Lucide icons can be imported on-demand in components
    // Example: import { TrendingUp, TrendingDown } from 'lucide-vue-next'
    // This plugin just ensures the package is available
  },
});

export default lucidePlugin;
