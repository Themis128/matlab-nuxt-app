/**
 * Sentry User Context Composable
 *
 * Provides enhanced user context tracking for Sentry
 */

import { setUserContext } from './useSentryUtils';
import { useSentryLogger } from './useSentryLogger';

export interface UserInfo {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  ip?: string;
  [key: string]: string | undefined;
}

/**
 * Composable for managing Sentry user context
 */
export const useSentryUser = () => {
  const logger = useSentryLogger();
  let currentUser: UserInfo | null = null;

  /**
   * Set user context in Sentry
   */
  const setUser = (userInfo: UserInfo) => {
    try {
      currentUser = userInfo;

      // Build additional context
      const additionalContext: Record<string, unknown> = {};

      if (userInfo.email) {
        additionalContext.email = userInfo.email;
      }
      if (userInfo.username) {
        additionalContext.username = userInfo.username;
      }
      if (userInfo.name) {
        additionalContext.name = userInfo.name;
      }
      if (userInfo.ip) {
        additionalContext.ip_address = userInfo.ip;
      }

      // Add any additional custom fields
      Object.keys(userInfo).forEach((key) => {
        if (!['id', 'email', 'username', 'name', 'ip'].includes(key)) {
          additionalContext[key] = userInfo[key];
        }
      });

      setUserContext(userInfo.id, additionalContext);

      logger.info('User context set in Sentry', {
        userId: userInfo.id,
        ...additionalContext,
      });
    } catch (error) {
      console.warn('[Sentry User] Failed to set user context:', error);
    }
  };

  /**
   * Update user context (merge with existing)
   */
  const updateUser = (updates: Partial<UserInfo>) => {
    if (!currentUser) {
      console.warn('[Sentry User] No user context to update. Call setUser first.');
      return;
    }

    setUser({
      ...currentUser,
      ...updates,
    });
  };

  /**
   * Clear user context
   */
  const clearUser = () => {
    try {
      currentUser = null;
      setUserContext(undefined, {});
      logger.info('User context cleared from Sentry');
    } catch (error) {
      console.warn('[Sentry User] Failed to clear user context:', error);
    }
  };

  /**
   * Get current user context
   */
  const getUser = (): UserInfo | null => {
    return currentUser;
  };

  /**
   * Track user action
   */
  const trackAction = (action: string, details?: Record<string, unknown>) => {
    logger.logUserAction(action, details, {
      userId: currentUser?.id,
    });
  };

  /**
   * Track user login
   */
  const trackLogin = (userInfo: UserInfo) => {
    setUser(userInfo);
    logger.info('User logged in', {
      userId: userInfo.id,
      email: userInfo.email,
    });
  };

  /**
   * Track user logout
   */
  const trackLogout = () => {
    const userId = currentUser?.id;
    logger.info('User logged out', {
      userId,
    });
    clearUser();
  };

  return {
    setUser,
    updateUser,
    clearUser,
    getUser,
    trackAction,
    trackLogin,
    trackLogout,
  };
};
