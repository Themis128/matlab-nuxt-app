import type { DefineLocaleMessage } from 'vue-i18n'

/**
 * Vue I18n Configuration
 *
 * This file configures vue-i18n for use with @nuxtjs/i18n
 */

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {},
    el: {},
    es: {},
    fr: {},
    de: {},
    it: {},
    pt: {},
  },
  // Global injection
  globalInjection: true,
  // Composition API mode
  compositionOnly: false,
  // Missing key handler
  missingWarn: process.env.NODE_ENV === 'development',
  fallbackWarn: process.env.NODE_ENV === 'development',
  // Pluralization rules
  pluralizationRules: {
    // Add custom pluralization rules if needed
  },
  // Number formatting
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD',
      },
    },
    es: {
      currency: {
        style: 'currency',
        currency: 'EUR',
      },
    },
    fr: {
      currency: {
        style: 'currency',
        currency: 'EUR',
      },
    },
    de: {
      currency: {
        style: 'currency',
        currency: 'EUR',
      },
    },
    it: {
      currency: {
        style: 'currency',
        currency: 'EUR',
      },
    },
    pt: {
      currency: {
        style: 'currency',
        currency: 'BRL',
      },
    },
    el: {
      currency: {
        style: 'currency',
        currency: 'EUR',
      },
    },
  },
  // Date formatting
  datetimeFormats: {
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    es: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    fr: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    de: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    it: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    pt: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    el: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
  },
}))
