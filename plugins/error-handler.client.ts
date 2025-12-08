/**
 * Error Handler Plugin for Sentry Integration
 *
 * This plugin sets up global error handlers to automatically
 * capture errors and send them to Sentry with custom filtering.
 */

export default defineNuxtPlugin({
  name: 'error-handler',
  setup(nuxtApp: any) {
    // Initialize error filtering
    const errorFilter = useSentryErrorFilter();
    errorFilter.addCommonFilters();

    // Vue error handler
    nuxtApp.vueApp.config.errorHandler = (error: unknown, instance: any, info: string) => {
      try {
        const _logger = useSentryLogger();
        const errorObj = error instanceof Error ? error : new Error(String(error));

        const context = {
          component: instance?.$options?.name || 'Unknown',
          info: info || 'No additional info',
          componentInstance: instance ? 'present' : 'missing',
        };

        // Use filtered error capture
        errorFilter.captureFilteredError(errorObj, context, {
          error_type: 'vue_error',
        });
      } catch (err) {
        // Fallback to console if Sentry fails
        console.error('[Error Handler] Failed to log Vue error:', err);
        console.error('Original error:', error);
      }
    };

    // Global unhandled error handler (client-side only)
    if (process.client) {
      // Handle unhandled errors
      window.addEventListener('error', (event) => {
        try {
          const error = event.error || new Error(event.message || 'Unknown error');
          const errorObj = error instanceof Error ? error : new Error(String(error));

          const context = {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            type: 'unhandled_error',
          };

          errorFilter.captureFilteredError(errorObj, context, {
            error_type: 'global_error',
          });
        } catch (err) {
          console.error('[Error Handler] Failed to log global error:', err);
        }
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        try {
          const error =
            event.reason instanceof Error
              ? event.reason
              : new Error(String(event.reason || 'Unhandled promise rejection'));

          const context = {
            type: 'unhandled_promise_rejection',
            reason: String(event.reason),
          };

          errorFilter.captureFilteredError(error, context, {
            error_type: 'promise_rejection',
          });
        } catch (err) {
          console.error('[Error Handler] Failed to log promise rejection:', err);
        }
      });
    }
  },
});
