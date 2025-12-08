interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
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
    // SECURITY: Validate user authentication
    const userId = getCookie(event, 'user-id');

    // Validate user ID format to prevent injection
    if (!userId || typeof userId !== 'string') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      });
    }

    // Sanitize user ID to prevent injection attacks
    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid user ID format',
      });
    }

    // TODO: In production, validate userId against session/token

    // Try to get profile from storage (in production, this would be a database)
    const storage = useStorage('redis'); // Falls back to memory storage
    const profileKey = `user:profile:${userId}`;

    let profile = (await storage.getItem(profileKey)) as UserProfile | null;

    if (!profile) {
      // Create default profile
      profile = {
        id: userId,
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '',
        location: '',
        bio: '',
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save default profile
      await storage.setItem(profileKey, profile);
    }

    return profile;
  } catch (error: unknown) {
    console.error('Error fetching user profile:', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user profile',
    });
  }
});
