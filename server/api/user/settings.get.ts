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

const defaultSettings: UserSettings = {
  general: {
    compactMode: false,
    animations: true,
    analytics: true,
    errorReporting: true,
    dataRetention: '1-year',
  },
  notifications: {
    email: true,
    priceAlerts: true,
    newDevices: false,
    weeklyDigest: true,
    frequency: 'daily',
  },
  performance: {
    imageCache: true,
    preloadData: true,
    lazyLoading: true,
    cacheSize: '100mb',
    requestTimeout: 30,
    retryAttempts: 3,
    offlineMode: false,
  },
  advanced: {
    debugMode: false,
    consoleLogging: false,
    apiEndpoint: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
  },
};

import { setCorsHeaders } from '~/server/utils/cors';

export default defineEventHandler(async (event: any) => {
  // Set secure CORS headers
  setCorsHeaders(event);

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    // In a real app, you'd get the user ID from authentication token
    const userId = getCookie(event, 'user-id') || 'default-user';

    const storage = useStorage('redis'); // Falls back to memory storage
    const settingsKey = `user:settings:${userId}`;

    // Get settings from storage
    let settings = (await storage.getItem(settingsKey)) as UserSettings | null;

    if (!settings) {
      // Return default settings and save them
      settings = { ...defaultSettings };
      await storage.setItem(settingsKey, settings);
    }

    return settings;
  } catch (error: unknown) {
    console.error('Error fetching user settings:', error);

    // Return default settings on error
    return defaultSettings;
  }
});
