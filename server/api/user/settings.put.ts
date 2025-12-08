interface UserSettings {
  general: {
    compactMode: boolean;
    animations: boolean;
    analytics: boolean;
    errorReporting: boolean;
    dataRetention: string;
  };
  notifications: {
    email: boolean;
    priceAlerts: boolean;
    newDevices: boolean;
    weeklyDigest: boolean;
    frequency: string;
  };
  performance: {
    imageCache: boolean;
    preloadData: boolean;
    lazyLoading: boolean;
    cacheSize: string;
    requestTimeout: number;
    retryAttempts: number;
    offlineMode: boolean;
  };
  advanced: {
    debugMode: boolean;
    consoleLogging: boolean;
    apiEndpoint: string;
  };
}

import { setCorsHeaders } from '~/server/utils/cors';

export default defineEventHandler(async (event: any) => {
  // Set secure CORS headers (replaces insecure '*' origin)
  setCorsHeaders(event);

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    const body = await readBody(event);

    // Validate settings structure
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid settings data',
      });
    }

    // Validate required sections
    const requiredSections = ['general', 'notifications', 'performance', 'advanced'];
    for (const section of requiredSections) {
      if (!body[section] || typeof body[section] !== 'object') {
        throw createError({
          statusCode: 400,
          statusMessage: `Missing or invalid ${section} settings`,
        });
      }
    }

    // Validate specific fields
    if (
      typeof body.performance.requestTimeout !== 'number' ||
      body.performance.requestTimeout < 5 ||
      body.performance.requestTimeout > 60
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request timeout must be between 5 and 60 seconds',
      });
    }

    if (
      typeof body.performance.retryAttempts !== 'number' ||
      body.performance.retryAttempts < 0 ||
      body.performance.retryAttempts > 5
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Retry attempts must be between 0 and 5',
      });
    }

    // Validate API endpoint URL
    if (body.advanced.apiEndpoint) {
      try {
        new URL(body.advanced.apiEndpoint);
      } catch {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid API endpoint URL',
        });
      }
    }

    // SECURITY: Validate user authentication
    // In production, use proper session tokens or JWT validation
    const userId = getCookie(event, 'user-id');

    // Validate user ID format to prevent injection
    if (!userId || typeof userId !== 'string') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      });
    }

    // Sanitize user ID to prevent injection attacks
    // Only allow alphanumeric, hyphens, underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid user ID format',
      });
    }

    // TODO: In production, validate userId against session/token
    // For now, we validate format but don't verify ownership
    // This prevents basic injection but still allows cookie manipulation
    // Proper fix requires session management or JWT validation

    const storage = useStorage('redis'); // Falls back to memory storage
    const settingsKey = `user:settings:${userId}`;

    // Get existing settings to merge
    const existingSettings = (await storage.getItem(settingsKey)) as UserSettings | null;

    // Merge with existing settings (deep merge)
    const updatedSettings: UserSettings = {
      general: {
        ...existingSettings?.general,
        ...body.general,
      },
      notifications: {
        ...existingSettings?.notifications,
        ...body.notifications,
      },
      performance: {
        ...existingSettings?.performance,
        ...body.performance,
      },
      advanced: {
        ...existingSettings?.advanced,
        ...body.advanced,
      },
    };

    // Save updated settings
    await storage.setItem(settingsKey, updatedSettings);

    return {
      success: true,
      settings: updatedSettings,
      message: 'Settings updated successfully',
    };
  } catch (error: unknown) {
    console.error('Error updating user settings:', error);

    if ((error as any)?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update settings',
    });
  }
});
