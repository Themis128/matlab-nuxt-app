// Runtime types for useRuntimeConfig() to allow strong typing for environment variables
// Add keys here as your runtime config grows. This helps ensure runtime values have consistent types.
export {};

declare global {
  interface AppRuntimeConfig {
    ALGOLIA_APP_ID?: string;
    ALGOLIA_ADMIN_API_KEY?: string;
    ALGOLIA_INDEX?: string;
    PYTHON_API_URL?: string;
    NUXT_PUBLIC_API_BASE?: string;
    NUXT_PUBLIC_PY_API_DISABLED?: boolean | string | number;
    // Public/nested config object that Nuxt exposes as `useRuntimeConfig().public`
    public?: {
      apiBase?: string;
      pyApiDisabled?: boolean;
      googleAnalyticsId?: string;
      plausibleDomain?: string;
      siteUrl?: string;
      algoliaAppId?: string;
      algoliaSearchApiKey?: string;
      algoliaIndex?: string;
    };
    // Add additional runtime keys as needed here
  }

  // Use a typed signature for `useRuntimeConfig()` so it's available in server and SFC contexts
  function useRuntimeConfig(): AppRuntimeConfig;
}

// Also add to the `#imports` module to allow typed auto-imports
declare module '#imports' {
  export function useRuntimeConfig(): AppRuntimeConfig;
}
