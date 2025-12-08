/**
 * Database utility for planning sessions
 * Supports both in-memory (development) and database (production) storage
 */

import type { PlanningSession } from '@/types/planning';

// In-memory fallback storage
const memoryStore = new Map<string, PlanningSession>();

/**
 * Get database instance with proper error handling
 * Note: useDatabase must be called within a Nitro context (event handler or plugin)
 */
function getDb(_event?: any) {
  try {
    // Try to get Nitro database instance
    // useDatabase is available in Nitro context as an auto-import
    if (typeof useDatabase === 'function') {
      // Try with 'default' name first (matches nuxt.config.ts)
      let db = useDatabase('default');

      // If that doesn't work, try without parameters (should default to 'default')
      if (!db || typeof db.prepare !== 'function') {
        db = useDatabase();
      }

      // Check if db is a valid database instance (has methods like prepare, exec)
      if (db && typeof db.prepare === 'function') {
        return db;
      }

      // If db exists but doesn't have prepare method, it's not a valid connection
      if (db) {
        console.warn(
          '[Database] useDatabase returned invalid object. Type:',
          typeof db,
          'Keys:',
          Object.keys(db || {})
        );
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Database] Database object:', db);
        }
      } else {
        console.debug(
          '[Database] useDatabase returned null/undefined (database may not be configured)'
        );
      }
    } else {
      // useDatabase is not available - database might not be configured
      console.debug(
        '[Database] useDatabase is not available (database may not be configured or experimental.database not enabled)'
      );
    }
  } catch (error) {
    // Better error logging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? error.stack : error;
    console.warn('[Database] Database not available, using in-memory storage:', errorMessage);
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Database] Error details:', errorDetails);
    }
  }
  return null;
}

/**
 * Get planning session by ID
 */
export async function getPlanningSession(
  sessionId: string,
  event?: any
): Promise<PlanningSession | null> {
  try {
    const db = getDb(event);
    if (db) {
      // Use database query
      const result = await db
        .prepare('SELECT * FROM planning_sessions WHERE id = ?')
        .bind(sessionId)
        .get();
      if (result) {
        const dbResult = result as any;
        return {
          ...dbResult,
          checklist:
            typeof dbResult.checklist === 'string'
              ? JSON.parse(dbResult.checklist)
              : dbResult.checklist,
          architectureDecisions:
            typeof dbResult.architectureDecisions === 'string'
              ? JSON.parse(dbResult.architectureDecisions)
              : dbResult.architectureDecisions,
          features:
            typeof dbResult.features === 'string'
              ? JSON.parse(dbResult.features)
              : dbResult.features,
        } as PlanningSession;
      }
      return null;
    }
  } catch (error) {
    console.error('[Database] Error fetching planning session:', error);
  }

  // Fallback to in-memory storage
  return memoryStore.get(sessionId) || null;
}

/**
 * Save planning session
 */
export async function savePlanningSession(session: PlanningSession, event?: any): Promise<void> {
  try {
    const db = getDb(event);
    if (db) {
      // Use database insert/update
      const existing = await getPlanningSession(session.id, event);
      const checklistJson = JSON.stringify(session.checklist);
      const architectureDecisionsJson = JSON.stringify(session.architectureDecisions);
      const featuresJson = JSON.stringify(session.features);

      if (existing) {
        // Update existing session
        await db
          .prepare(
            `
          UPDATE planning_sessions
          SET project_name = ?, project_type = ?, scale = ?, features = ?,
              phase = ?, checklist = ?, architecture_decisions = ?, updated_at = ?
          WHERE id = ?
        `
          )
          .bind(
            session.projectName,
            session.projectType,
            session.scale,
            featuresJson,
            session.phase,
            checklistJson,
            architectureDecisionsJson,
            session.updatedAt,
            session.id
          )
          .run();
      } else {
        // Insert new session
        await db
          .prepare(
            `
          INSERT INTO planning_sessions
          (id, project_name, project_type, scale, features, phase, checklist,
           architecture_decisions, started_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
          )
          .bind(
            session.id,
            session.projectName,
            session.projectType,
            session.scale,
            featuresJson,
            session.phase,
            checklistJson,
            architectureDecisionsJson,
            session.startedAt,
            session.updatedAt
          )
          .run();
      }
      return;
    }
  } catch (error) {
    console.error('[Database] Error saving planning session:', error);
  }

  // Fallback to in-memory storage
  memoryStore.set(session.id, session);
}

/**
 * Update planning session
 */
export async function updatePlanningSession(
  sessionId: string,
  updates: Partial<PlanningSession>
): Promise<PlanningSession | null> {
  const session = await getPlanningSession(sessionId);
  if (!session) {
    return null;
  }

  const updated = {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await savePlanningSession(updated);
  return updated;
}

/**
 * Delete planning session
 */
export async function deletePlanningSession(sessionId: string, event?: any): Promise<boolean> {
  try {
    const db = getDb(event);
    if (db) {
      const result = await db
        .prepare('DELETE FROM planning_sessions WHERE id = ?')
        .bind(sessionId)
        .run();
      return (result as any).changes > 0;
    }
  } catch (error) {
    console.error('[Database] Error deleting planning session:', error);
  }

  // Fallback to in-memory storage
  return memoryStore.delete(sessionId);
}

/**
 * List all planning sessions (for admin/debugging)
 */
export async function listPlanningSessions(event?: any): Promise<PlanningSession[]> {
  try {
    const db = getDb(event);
    if (db) {
      const results = await db
        .prepare('SELECT * FROM planning_sessions ORDER BY updated_at DESC')
        .all();
      return results.map((row: any) => ({
        ...row,
        checklist: typeof row.checklist === 'string' ? JSON.parse(row.checklist) : row.checklist,
        architectureDecisions:
          typeof row.architectureDecisions === 'string'
            ? JSON.parse(row.architectureDecisions)
            : row.architectureDecisions,
        features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
      })) as PlanningSession[];
    }
  } catch (error) {
    console.error('[Database] Error listing planning sessions:', error);
  }

  // Fallback to in-memory storage
  return Array.from(memoryStore.values());
}

/**
 * Initialize database tables (when database is available)
 */
export async function initDatabase(event?: any): Promise<void> {
  try {
    console.log('[Database] initDatabase called');
    const db = getDb(event);
    if (!db) {
      console.log('[Database] Using in-memory storage (database not configured)');
      console.log(
        '[Database] This is expected if DATABASE_URL is not set and SQLite cannot be initialized'
      );
      return;
    }

    console.log('[Database] Database connection obtained, creating tables...');

    // Create planning_sessions table if it doesn't exist
    // SQLite syntax (works for both SQLite and PostgreSQL with minor adjustments)
    const createTableSQL = process.env.DATABASE_URL
      ? `
        CREATE TABLE IF NOT EXISTS planning_sessions (
          id TEXT PRIMARY KEY,
          project_name TEXT NOT NULL,
          project_type TEXT NOT NULL,
          scale TEXT NOT NULL,
          features TEXT NOT NULL,
          phase TEXT NOT NULL,
          checklist TEXT NOT NULL,
          architecture_decisions TEXT NOT NULL,
          started_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_planning_sessions_updated_at ON planning_sessions(updated_at);
      `
      : `
        CREATE TABLE IF NOT EXISTS planning_sessions (
          id TEXT PRIMARY KEY,
          project_name TEXT NOT NULL,
          project_type TEXT NOT NULL,
          scale TEXT NOT NULL,
          features TEXT NOT NULL,
          phase TEXT NOT NULL,
          checklist TEXT NOT NULL,
          architecture_decisions TEXT NOT NULL,
          started_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_planning_sessions_updated_at ON planning_sessions(updated_at);
      `;

    console.log('[Database] Executing CREATE TABLE statement...');
    await db.exec(createTableSQL);
    console.log('[Database] Planning sessions table initialized successfully');
    console.log('[Database] Database is ready for use');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[Database] Error initializing database:', errorMessage);
    if (errorStack && process.env.NODE_ENV === 'development') {
      console.error('[Database] Stack trace:', errorStack);
    }
    console.log('[Database] Falling back to in-memory storage');
  }
}
