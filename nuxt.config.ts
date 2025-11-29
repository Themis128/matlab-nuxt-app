// https://nuxt.com/docs/api/configuration/nuxt-config
// Detect automated test context (Playwright / CI)
const isTestEnv =
  !!process.env.PLAYWRIGHT ||
  !!process.env.PW_TEST_REPORTER ||
  !!process.env.NUXT_TEST ||
  process.env.CI === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  // Disable devtools during automated tests to avoid WebSocket port (24678) conflicts
  devtools: { enabled: !isTestEnv },

  modules: ['@nuxt/ui', '@pinia/nuxt'],

  // Server-side configuration
  nitro: {
    // Allow running Node.js scripts
    experimental: {
      wasm: true,
    },
  },

  // App configuration
  app: {
    head: {
      title: 'MATLAB Deep Learning & Mobile Dataset Analysis',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Explore deep learning models, analyze mobile phone datasets, and discover insights with MATLAB and modern web technologies',
        },
      ],
    },
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false, // Disable in dev for faster startup, enable in CI/build
  },
})
