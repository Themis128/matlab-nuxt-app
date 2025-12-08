import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUserPreferences } from '../useUserPreferences';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock Vue lifecycle hooks
const mockOnMounted = vi.fn((fn: () => void) => fn());
const mockOnUnmounted = vi.fn((fn: () => void) => fn());

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onMounted: mockOnMounted,
    onUnmounted: mockOnUnmounted,
    readonly: (val: any) => val,
    computed: (fn: () => any) => ({ value: fn() }),
  };
});

// Mock useSentryLogger
const mockSentryLogger = {
  warn: vi.fn(),
};

vi.mock('~/composables/useSentryLogger', () => ({
  useSentryLogger: () => mockSentryLogger,
}));

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      client: true,
    },
  },
  writable: true,
});

describe('useUserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return preferences interface', () => {
    const prefs = useUserPreferences();

    expect(prefs).toHaveProperty('preferences');
    expect(prefs).toHaveProperty('updatePreference');
    expect(prefs).toHaveProperty('resetPreferences');
    expect(prefs).toHaveProperty('loadPreferences');
    expect(prefs).toHaveProperty('savePreferences');
    expect(prefs).toHaveProperty('getPreference');
    expect(prefs).toHaveProperty('hasUnsavedChanges');
  });

  it('should initialize with default preferences', () => {
    const prefs = useUserPreferences();

    expect(prefs.preferences.value.theme).toBe('system');
    expect(prefs.preferences.value.animations).toBe(true);
  });

  it('should load preferences from localStorage', () => {
    const stored = {
      theme: 'dark',
      animations: false,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(stored));

    const prefs = useUserPreferences();
    prefs.loadPreferences();

    expect(prefs.preferences.value.theme).toBe('dark');
    expect(prefs.preferences.value.animations).toBe(false);
  });

  it('should save preferences to localStorage', () => {
    const prefs = useUserPreferences();
    prefs.savePreferences();

    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should update preference', () => {
    const prefs = useUserPreferences();
    prefs.updatePreference('theme', 'dark');

    expect(prefs.preferences.value.theme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should reset preferences', () => {
    const prefs = useUserPreferences();
    prefs.updatePreference('theme', 'dark');
    prefs.resetPreferences();

    expect(prefs.preferences.value.theme).toBe('system');
  });

  it('should get preference', () => {
    const prefs = useUserPreferences();
    const theme = prefs.getPreference('theme');

    expect(theme).toBe('system');
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const prefs = useUserPreferences();
    prefs.loadPreferences();

    expect(mockSentryLogger.warn).toHaveBeenCalled();
  });
});
