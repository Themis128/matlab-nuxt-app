/**
 * Server-side Error Handler Plugin for Sentry Integration
 *
 * This plugin sets up server-side error handlers to automatically
 * capture errors and send them to Sentry.
 */

export default defineNuxtPlugin({
  name: 'error-handler-server',
  setup(nuxtApp: any) {
    // Handle Nitro errors
    nuxtApp.hook('error', (error: unknown) => {
      try {
        const logger = useSentryLogger();
        const errorObj = error instanceof Error ? error : new Error(String(error));

        logger.logError('Server Error', errorObj, {
          type: 'nitro_error',
          server: true,
        });
      } catch (err) {
        // Fallback to console if Sentry fails
        console.error('[Error Handler] Failed to log server error:', err);
        console.error('Original error:', error);
      }
    });

    // Handle render errors
    nuxtApp.hook('app:error', (error: unknown) => {
      try {
        const logger = useSentryLogger();
        const errorObj = error instanceof Error ? error : new Error(String(error));

        logger.logError('App Error', errorObj, {
          type: 'app_error',
          server: true,
        });
      } catch (err) {
        console.error('[Error Handler] Failed to log app error:', err);
      }
    });
  },
});
