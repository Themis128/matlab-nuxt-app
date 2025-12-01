// https://nuxt.com/docs/api/configuration/nuxt-config
// Detect automated test context (Playwright / CI)
const isTestEnv =
  !!process.env.PLAYWRIGHT ||
  !!process.env.PW_TEST_REPORTER ||
  !!process.env.NUXT_TEST ||
  process.env.CI === 'true'

const isProd = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  // Disable devtools during automated tests to avoid WebSocket port (24678) conflicts
  // Allow override of the devtools websocket port using NUXT_DEVTOOLS_PORT env var to avoid conflicts
  devtools: {
    enabled: !isTestEnv && !isProd,
    // port expects a number; default to 24678 if not specified
    port: process.env.NUXT_DEVTOOLS_PORT ? Number(process.env.NUXT_DEVTOOLS_PORT) : 24678,
  },

  modules: ['@nuxt/ui', '@pinia/nuxt', '@sentry/nuxt/module'],

  css: ['~/assets/css/main.css'],

  // Server-side configuration
  nitro: {
    // Allow running Node.js scripts
    experimental: {
      wasm: true,
    },
    // Production optimizations
    preset: isProd ? 'node-server' : undefined,
    compressPublicAssets: isProd,
    minify: isProd,
    // Route rules for caching and security headers
    routeRules: isProd
      ? {
          '/api/**': { cors: true, cache: { maxAge: 60 * 5 } }, // Cache API responses for 5 minutes
          '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }, // Cache assets for 1 year
          '/images/**': { headers: { 'cache-control': 'public, max-age=86400' } }, // Cache images for 1 day
          '/**': {
            headers: {
              'X-Content-Type-Options': 'nosniff',
              'X-Frame-Options': 'SAMEORIGIN',
              'X-XSS-Protection': '1; mode=block',
              'Referrer-Policy': 'strict-origin-when-cross-origin',
              'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
            },
          },
        }
      : {},
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
      rollupOptions: isProd
        ? {
            output: {
              manualChunks: {
                'chart-js': ['chart.js', 'vue-chartjs'],
                pinia: ['pinia'],
              },
            },
          }
        : {},
    },
  },
})
