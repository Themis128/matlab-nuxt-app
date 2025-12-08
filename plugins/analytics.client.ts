/**
 * Nuxt 4 plugin for analytics integration
 * Supports Google Analytics, Plausible, and custom analytics
 */
export default defineNuxtPlugin((nuxtApp: any) => {
  if (typeof window === 'undefined') return;

  const config = useRuntimeConfig();
  const publicConfig = config.public as {
    googleAnalyticsId?: string;
    plausibleDomain?: string;
    apiBase?: string;
    pyApiDisabled?: boolean;
  };

  // Google Analytics 4
  if (publicConfig?.googleAnalyticsId) {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${publicConfig.googleAnalyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      if (window.dataLayer) {
        window.dataLayer.push(args);
      }
    }
    window.gtag = gtag;
    gtag('js', new Date());
    if (publicConfig.googleAnalyticsId) {
      gtag('config', publicConfig.googleAnalyticsId);
    }
  }

  // Plausible Analytics
  if (publicConfig?.plausibleDomain) {
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', publicConfig.plausibleDomain);
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);

    // Initialize plausible function
    if (!window.plausible) {
      window.plausible = function (_eventName: string, _options?: { props?: Record<string, any> }) {
        // Plausible will handle this
      };
    }
  }

  // Track page views on route changes
  nuxtApp.hook('page:finish', () => {
    const route = useRoute();
    const analytics = useAnalytics();
    analytics.trackPageView(route.path, route.meta.title as string);
  });
});

// Extend Window interface
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
  }
}
