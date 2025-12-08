/**
 * Database initialization plugin
 * Ensures database tables are created on server startup
 */

export default defineNitroPlugin(async (_nitroApp) => {
  try {
    // Diagnostic: Check if useDatabase is available
    console.log('[Database] Starting initialization...');
    console.log('[Database] useDatabase available:', typeof useDatabase === 'function');
    console.log(
      '[Database] DATABASE_URL:',
      process.env.DATABASE_URL ? 'set' : 'not set (using SQLite)'
    );

    // Try to get database instance for diagnostics
    if (typeof useDatabase === 'function') {
      try {
        const dbDefault = useDatabase('default');
        const dbNoParam = useDatabase();

        console.log(
          '[Database] useDatabase("default") result:',
          dbDefault ? 'object returned' : 'null/undefined'
        );
        console.log(
          '[Database] useDatabase() result:',
          dbNoParam ? 'object returned' : 'null/undefined'
        );

        if (dbDefault) {
          console.log('[Database] useDatabase("default") type:', typeof dbDefault);
          console.log(
            '[Database] useDatabase("default") has prepare:',
            typeof dbDefault.prepare === 'function'
          );
          console.log(
            '[Database] useDatabase("default") keys:',
            Object.keys(dbDefault || {}).slice(0, 10)
          );
        }
        if (dbNoParam) {
          console.log('[Database] useDatabase() type:', typeof dbNoParam);
          console.log(
            '[Database] useDatabase() has prepare:',
            typeof dbNoParam.prepare === 'function'
          );
        }
      } catch (dbError) {
        console.warn(
          '[Database] Error calling useDatabase:',
          dbError instanceof Error ? dbError.message : String(dbError)
        );
      }
    }

    // Import database utilities
    const { initDatabase } = await import('../utils/database');

    // Initialize database tables
    // useDatabase should be called without parameters in plugin context
    // or we can pass the event from nitroApp if needed
    await initDatabase();

    console.log('[Database] Initialization complete');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Database] Initialization failed:', errorMessage);
    // Don't fail server startup if database init fails
    // The app will fall back to in-memory storage
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Database] Initialization error details:', error);
      if (error instanceof Error && error.stack) {
        console.debug('[Database] Stack trace:', error.stack);
      }
    }
  }
});
