// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  pages: true,
  devtools: {
    enabled: true,
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  // css: ['assets/css/main.css'],

  // Server-side configuration
  nitro: {
    // Allow running Node.js scripts
    experimental: {
      wasm: true,
    },
  },

  // Runtime configuration
  runtimeConfig: {
    // Private keys (server-only)
    apiSecret: process.env.NUXT_API_SECRET,
    // Public keys (exposed to client)
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE || process.env.PYTHON_API_URL || 'http://localhost:8000',
      pyApiDisabled: process.env.NUXT_PUBLIC_PY_API_DISABLED === '1' || false,
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

  // Enable source maps for Sentry integration
  sourcemap: {
    client: 'hidden', // Generate source maps but don't expose them publicly
    server: true, // Enable server-side source maps for proper error tracing
  },

  // Vite configuration for source maps
  vite: {
    build: {
      cssCodeSplit: true,
      sourcemap: 'hidden', // Generate source maps for production builds
    },
  },
})
