/**
 * Nitro plugin to handle common errors gracefully
 * Addresses: ENOTEMPTY directory cleanup errors, EPERM file watcher errors
 */

export default defineNitroPlugin((_nitroApp) => {
  // Handle directory cleanup errors gracefully
  const originalErrorHandler = process.listeners('uncaughtException')[0];

  process.on('uncaughtException', (error: Error) => {
    // Ignore ENOTEMPTY errors (directory not empty) - Nuxt handles these
    if (error.message?.includes('ENOTEMPTY') || error.message?.includes('directory not empty')) {
      console.warn('[Nitro] Directory cleanup warning (safe to ignore):', error.message);
      return;
    }

    // Ignore EPERM errors (file watcher permission) - handled by Vite config
    if (error.message?.includes('EPERM') || error.message?.includes('operation not permitted')) {
      console.warn('[Nitro] File watcher permission warning (safe to ignore):', error.message);
      return;
    }

    // Call original error handler for other errors
    if (originalErrorHandler) {
      (originalErrorHandler as any)(error, 'uncaughtException');
    } else {
      console.error('[Nitro] Uncaught exception:', error);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any) => {
    // Ignore directory cleanup errors
    if (
      reason?.message?.includes('ENOTEMPTY') ||
      reason?.message?.includes('directory not empty')
    ) {
      console.warn('[Nitro] Directory cleanup warning (safe to ignore):', reason.message);
      return;
    }

    // Ignore file watcher permission errors
    if (
      reason?.message?.includes('EPERM') ||
      reason?.message?.includes('operation not permitted')
    ) {
      console.warn('[Nitro] File watcher permission warning (safe to ignore):', reason.message);
      return;
    }

    console.error('[Nitro] Unhandled promise rejection:', reason);
  });
});
