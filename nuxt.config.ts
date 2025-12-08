// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  pages: true,
  devtools: {
    enabled: true,
    // Handle port conflicts gracefully - use port from environment if set
    ...(process.env.NUXT_DEVTOOLS_PORT && { port: parseInt(process.env.NUXT_DEVTOOLS_PORT, 10) }),
  },

  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/icon',
    '@formkit/auto-animate',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    ...(process.env.SENTRY_DSN && !process.env.SENTRY_DSN.includes('your-dsn') ? ['@sentry/nuxt'] : []),
  ],



  css: [
    '~/assets/css/main.css',
    // PrimeVue v4 uses CSS variables for theming, no separate theme CSS files needed
    // Theme is configured via PrimeVue config in plugins/primevue.client.ts
    'primeicons/primeicons.css',
  ],

  // Server-side configuration
  nitro: {
    // Allow running Node.js scripts
    experimental: {
      wasm: true,
      database: true, // Enable database support for Sentry instrumentation
    },
    // Better error handling for directory cleanup
    storage: {
      // Use in-memory cache for dev to avoid file system issues
      cache: process.env.NODE_ENV === 'development' ? { driver: 'memory' } : undefined,
    },
    // Handle directory cleanup errors gracefully
    devStorage: {
      cache: { driver: 'memory' },
    },
    // Database configuration
    // Supports both SQLite (development) and PostgreSQL (production)
    database: {
      default: {
        // Use 'better-sqlite3' explicitly for Node.js < 22.5
        // 'sqlite' connector tries node:sqlite first (requires Node.js >= 22.5)
        connector: process.env.DATABASE_URL ? 'postgresql' : 'better-sqlite3',
        options: process.env.DATABASE_URL
          ? {
              // PostgreSQL connection (production)
              connectionString: process.env.DATABASE_URL,
              // Secure SSL configuration
              ssl: process.env.DATABASE_SSL === 'true'
                ? {
                    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
                    ...(process.env.DATABASE_CA_CERT && { ca: process.env.DATABASE_CA_CERT }),
                    ...(process.env.DATABASE_CLIENT_CERT && { cert: process.env.DATABASE_CLIENT_CERT }),
                    ...(process.env.DATABASE_CLIENT_KEY && { key: process.env.DATABASE_CLIENT_KEY }),
                  }
                : false,
              // Connection pooling for better performance
              max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
              idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT || '30000', 10),
              connectionTimeoutMillis: parseInt(process.env.DATABASE_POOL_CONNECTION_TIMEOUT || '2000', 10),
            }
          : {
              // SQLite (development/fallback) using better-sqlite3
              // Database file will be created at .data/db.sqlite3
              name: 'db', // Database name (creates .data/db.sqlite3)
            },
      },
    },
  },

  // Runtime configuration
  runtimeConfig: {
    // Private keys (server-only)
    apiSecret: process.env.NUXT_API_SECRET,
    // Algolia credentials (server-only, never expose to client)
    ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
    ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY,
    ALGOLIA_INDEX: process.env.ALGOLIA_INDEX || 'phones_index',
    // Public keys (exposed to client)
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE || process.env.PYTHON_API_URL || 'http://localhost:8000',
      pyApiDisabled: process.env.NUXT_PUBLIC_PY_API_DISABLED === '1' || false,
      googleAnalyticsId: process.env.NUXT_PUBLIC_GA_ID || '',
      plausibleDomain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://matlab-analytics.com',
      // Algolia public keys (safe for client-side)
      // Note: Only use public search API key, never admin keys
      algoliaAppId: process.env.ALGOLIA_APP_ID || '',
      algoliaSearchApiKey: process.env.ALGOLIA_PUBLIC_API_KEY || '',
      algoliaIndex: process.env.ALGOLIA_INDEX || 'phones_index',
    },
  },

  // Image optimization
  // @ts-ignore - image config may not be in type definitions
  image: {
    quality: 80,
    format: ['webp', 'avif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    densities: [1, 2],
    presets: {
      phone: {
        modifiers: {
          format: 'webp',
          quality: 85,
          width: 400,
          height: 400,
        },
      },
    },
  },

  // Icon configuration
  icon: {
    provider: 'iconify',
    // @ts-ignore - serverBundle.enabled is valid but not in type definitions
    serverBundle: {
      // Disable server bundle to avoid module loading issues
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
        // Open Graph tags
        { property: 'og:title', content: 'MATLAB Deep Learning & Mobile Dataset Analysis' },
        {
          property: 'og:description',
          content:
            'Explore deep learning models, analyze mobile phone datasets, and discover insights with MATLAB and modern web technologies',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/og-image.png' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'MATLAB Deep Learning & Mobile Dataset Analysis' },
        {
          name: 'twitter:description',
          content:
            'Explore deep learning models, analyze mobile phone datasets, and discover insights with MATLAB and modern web technologies',
        },
        // Theme color
        { name: 'theme-color', content: '#00DC82' },
      ],
      link: [
        // Canonical URL (will be set dynamically per page)
        // Favicon - using data URI to avoid 404 error
        // Favicon temporarily removed to debug HTML parsing issue
        // { rel: 'icon', type: 'image/svg+xml', href: 'data:image/svg+xml,...' },
      ],
    },
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: process.env.NODE_ENV === 'production' || process.env.CI === 'true', // Enable in production and CI
  },

  // Enable source maps for Sentry integration
  sourcemap: {
    client: 'hidden', // Generate source maps but don't expose them publicly
    server: true, // Enable server-side source maps for proper error tracing
  },

  // Vite configuration for source maps and optimization
  vite: {
    build: {
      cssCodeSplit: true,
      sourcemap: 'hidden', // Generate source maps for production builds
      rollupOptions: {
        output: {
          // Manual chunk splitting for better code splitting
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              // Chart libraries in separate chunk
              if (id.includes('apexcharts')) {
                return 'charts';
              }
              // UI libraries
              if (id.includes('@nuxt/ui') || id.includes('@heroicons')) {
                return 'ui';
              }
              // State management
              if (id.includes('pinia')) {
                return 'state';
              }
              // Large dependencies
              if (id.includes('algoliasearch') || id.includes('@algolia')) {
                return 'search';
              }
              // i18n libraries
              if (id.includes('@nuxtjs/i18n') || id.includes('vue-i18n')) {
                return 'i18n';
              }
              // Sentry (only load when needed)
              if (id.includes('@sentry')) {
                return 'monitoring';
              }
              // Default vendor chunk
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      watch: {
        // Reduce file watcher load on Windows to prevent EPERM errors
        usePolling: process.platform === 'win32', // Use polling on Windows to avoid EPERM
        interval: process.platform === 'win32' ? 1000 : undefined, // Poll every 1s on Windows
        binaryInterval: process.platform === 'win32' ? 3000 : undefined, // Poll binaries every 3s
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.nuxt/**',
          '**/.output/**',
          '**/.nitro/**',
          '**/dist/**',
          '**/build/**',
          '**/.cache/**',
          '**/venv/**',
          '**/.venv/**',
          '**/__pycache__/**',
          '**/python_api/trained_models/**',
          '**/lancedb_data/**',
          '**/.goosy/**',
          '**/test-results/**',
          '**/playwright-report/**',
          '**/coverage/**',
          '**/*.log',
          '**/*.tmp',
          '**/.DS_Store',
          '**/Thumbs.db',
        ],
        // Ignore permission errors on Windows
        ignorePermissionErrors: true,
      },
    },
  },

  // Experimental features for better performance
  experimental: {
    payloadExtraction: true, // Extract payload for better caching
  },

  // Route rules for code splitting, caching, and security
  routeRules: {
    // Static pages with ISR (Incremental Static Regeneration)
    '/': {
      prerender: true,
      isr: 3600, // Revalidate every hour
    },
    '/api-docs': {
      prerender: true,
      isr: 86400, // Revalidate daily
    },
    // Dynamic pages with caching
    '/search': {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    },
    '/compare': {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    },
    // Heavy pages with lazy loading (client-side only for better initial load)
    '/advanced': {
      prerender: false,
    },
    '/datamine': {
      prerender: false,
    },
    '/ml-comparison': {
      prerender: false,
    },
    '/ab-testing': {
      prerender: false,
    },
    '/model-showcase': {
      prerender: false,
    },
    // API routes with caching
    '/api/**': {
      cors: true,
      headers: {
        'Cache-Control': 's-maxage=60',
      },
    },
    // Security headers for all routes (handled by middleware, but reinforced here)
    '/**': {
      headers: {
        // Security headers are primarily set by server/middleware/security-headers.ts
        // These can be customized per route if needed
        // Middleware handles: CSP, X-Frame-Options, X-Content-Type-Options, etc.
      },
    },
  },

  // Color Mode Configuration (for better theme management)
  colorMode: {
    preference: 'system', // 'system', 'light', or 'dark'
    fallback: 'light',
    classSuffix: '',
    storageKey: 'nuxt-color-mode',
  },

  // Nuxt UI Configuration
  ui: {
    // safelistColors removed as it's not a valid property
  },

  // i18n Configuration
  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English', language: 'en-US' },
      { code: 'es', file: 'es.json', name: 'Español', language: 'es-ES' },
      { code: 'fr', file: 'fr.json', name: 'Français', language: 'fr-FR' },
      { code: 'de', file: 'de.json', name: 'Deutsch', language: 'de-DE' },
      { code: 'it', file: 'it.json', name: 'Italiano', language: 'it-IT' },
      { code: 'pt', file: 'pt.json', name: 'Português', language: 'pt-BR' },
      { code: 'el', file: 'el.json', name: 'Ελληνικά', language: 'el-GR' },
    ],
    // @ts-ignore - lazy is valid but not in type definitions for this version
    lazy: true,
    // langDir is relative to project root, and @nuxtjs/i18n v10 looks in i18n/ by default
    // So 'locales' resolves to i18n/locales/
    langDir: 'locales',
    defaultLocale: 'en',
    fallbackLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
    vueI18n: './i18n.config.ts',
    compilation: {
      strictMessage: false,
    },
  },
})
