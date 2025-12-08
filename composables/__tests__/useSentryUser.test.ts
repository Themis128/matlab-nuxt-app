import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSentryUser } from '../useSentryUser';

// Mock dependencies
const mockSetUserContext = vi.fn();
const mockSentryLogger = {
  info: vi.fn(),
  logUserAction: vi.fn(),
};

vi.mock('~/composables/useSentryUtils', () => ({
  setUserContext: (...args: any[]) => mockSetUserContext(...args),
}));

vi.mock('~/composables/useSentryLogger', () => ({
  useSentryLogger: () => mockSentryLogger,
}));

describe('useSentryUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user management methods', () => {
    const user = useSentryUser();

    expect(user).toHaveProperty('setUser');
    expect(user).toHaveProperty('updateUser');
    expect(user).toHaveProperty('clearUser');
    expect(user).toHaveProperty('getUser');
    expect(user).toHaveProperty('trackAction');
    expect(user).toHaveProperty('trackLogin');
    expect(user).toHaveProperty('trackLogout');
  });

  it('should set user context', () => {
    const user = useSentryUser();
    const userInfo = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
    };

    user.setUser(userInfo);

    expect(mockSetUserContext).toHaveBeenCalled();
    expect(mockSentryLogger.info).toHaveBeenCalled();
  });

  it('should update user context', () => {
    const user = useSentryUser();
    user.setUser({ id: 'user123' });
    user.updateUser({ email: 'new@example.com' });

    expect(mockSetUserContext).toHaveBeenCalledTimes(2);
  });

  it('should warn when updating without setting user first', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = useSentryUser();
    user.updateUser({ email: 'test@example.com' });

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should clear user context', () => {
    const user = useSentryUser();
    user.setUser({ id: 'user123' });
    user.clearUser();

    expect(mockSetUserContext).toHaveBeenCalledWith(undefined, {});
    expect(user.getUser()).toBeNull();
  });

  it('should track user action', () => {
    const user = useSentryUser();
    user.setUser({ id: 'user123' });
    user.trackAction('test_action', { key: 'value' });

    expect(mockSentryLogger.logUserAction).toHaveBeenCalled();
  });

  it('should track login', () => {
    const user = useSentryUser();
    const userInfo = { id: 'user123', email: 'test@example.com' };

    user.trackLogin(userInfo);

    expect(mockSetUserContext).toHaveBeenCalled();
    expect(mockSentryLogger.info).toHaveBeenCalledWith('User logged in', expect.any(Object));
  });

  it('should track logout', () => {
    const user = useSentryUser();
    user.setUser({ id: 'user123' });
    user.trackLogout();

    expect(mockSentryLogger.info).toHaveBeenCalledWith('User logged out', expect.any(Object));
    expect(user.getUser()).toBeNull();
  });
});
