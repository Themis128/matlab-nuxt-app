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
  // Set secure CORS headers
  setCorsHeaders(event);

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    const body = await readBody(event);

    // Validate required fields
    if (!body.name || !body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and email are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format',
      });
    }

    // In a real app, you'd get the user ID from authentication token
    const userId = getCookie(event, 'user-id') || 'default-user';

    const storage = useStorage('redis'); // Falls back to memory storage
    const profileKey = `user:profile:${userId}`;

    // Get existing profile
    let existingProfile = (await storage.getItem(profileKey)) as UserProfile | null;

    if (!existingProfile) {
      // Create new profile if doesn't exist
      existingProfile = {
        id: userId,
        name: '',
        email: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Update profile with new data
    const updatedProfile: UserProfile = {
      ...existingProfile,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || '',
      location: body.location?.trim() || '',
      bio: body.bio?.trim() || '',
      avatar: body.avatar?.trim() || '',
      updatedAt: new Date().toISOString(),
    };

    // Save updated profile
    await storage.setItem(profileKey, updatedProfile);

    return updatedProfile;
  } catch (error: unknown) {
    console.error('Error updating user profile:', error);

    if ((error as any)?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user profile',
    });
  }
});
