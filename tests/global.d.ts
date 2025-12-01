/**
 * Global type declarations for Playwright test suites
 */

declare global {
  interface Window {
    // Sentry testing globals
    __sentryErrors?: Array<{
      error?: Error
      message?: string
      level?: string
      hint?: any
      timestamp: number
    }>
    __sentryTransactions?: Array<any>
    Sentry?: any

    // Algolia testing globals
    __algoliaEvents?: Array<{
      type: string
      appId?: string
      apiKey?: string
      queries?: any
      options?: any
      timestamp: number
    }>
    __algoliaErrors?: Array<any>

    // Navigation timing
    __navigationStart?: number

    // Algolia client
    algoliasearch?: any
    instantsearch?: any

    // Environment variables for testing
    ALGOLIA_APP_ID?: string
    ALGOLIA_SEARCH_KEY?: string
  }
}

export {}
