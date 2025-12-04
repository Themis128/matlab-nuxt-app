// Test-related type declarations for Playwright tests
// Extends the global Window interface with test-specific properties

declare global {
  interface Window {
    // Sentry test properties
    __sentryErrors?: Array<{
      error?: Error;
      message?: string;
      level?: string;
      hint?: any;
      timestamp: number;
    }>;
    __sentryTransactions?: any[];
    __navigationStart?: number;

    // Algolia test properties
    __algoliaEvents?: Array<{
      type: string;
      appId?: string;
      apiKey?: string;
      queries?: any;
      options?: any;
      timestamp: number;
    }>;
    __algoliaErrors?: any[];

    // Algolia global objects
    algoliasearch?: any;
    instantsearch?: any;
  }
}

export {};
