// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  // Server-side configuration
  nitro: {
    // Allow running Node.js scripts
    experimental: {
      wasm: true
    }
  },

  // App configuration
  app: {
    head: {
      title: 'MATLAB Deep Learning & Mobile Dataset Analysis',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Explore deep learning models, analyze mobile phone datasets, and discover insights with MATLAB and modern web technologies' }
      ]
    }
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false // Disable in dev for faster startup, enable in CI/build
  }
})
