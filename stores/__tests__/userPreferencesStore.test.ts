import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserPreferencesStore } from '../userPreferencesStore';

// Mock Sentry logger
vi.mock('~/composables/useSentryLogger', () => ({
  useSentryLogger: () => ({
    warn: vi.fn(),
    logError: vi.fn(),
  }),
}));

describe('userPreferencesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  describe('state', () => {
    it('should initialize with default preferences', () => {
      const store = useUserPreferencesStore();

      expect(store.theme).toBe('system');
      expect(store.animations).toBe(true);
      expect(store.language).toBe('en');
      expect(store.preferredCurrency).toBe('USD');
    });

    it('should load persisted preferences from localStorage', () => {
      const persisted = {
        theme: 'dark',
        language: 'es',
      };
      localStorage.setItem('mobile-finder-preferences', JSON.stringify(persisted));

      const store = useUserPreferencesStore();

      expect(store.theme).toBe('dark');
      expect(store.language).toBe('es');
      // Other defaults should still apply
      expect(store.animations).toBe(true);
    });
  });

  describe('actions', () => {
    it('should save preferences to localStorage', () => {
      const store = useUserPreferencesStore();
      store.theme = 'dark';
      store.language = 'fr';

      store.saveToStorage();

      const saved = JSON.parse(localStorage.getItem('mobile-finder-preferences') || '{}');
      expect(saved.theme).toBe('dark');
      expect(saved.language).toBe('fr');
    });

    it('should reset to default preferences', () => {
      const store = useUserPreferencesStore();
      store.theme = 'dark';
      store.language = 'es';
      store.animations = false;

      store.resetToDefaults();

      expect(store.theme).toBe('system');
      expect(store.language).toBe('en');
      expect(store.animations).toBe(true);
    });

    it('should update theme preference', () => {
      const store = useUserPreferencesStore();
      store.theme = 'dark';
      store.saveToStorage();

      expect(store.theme).toBe('dark');
    });

    it('should handle localStorage errors gracefully', () => {
      const store = useUserPreferencesStore();
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      store.saveToStorage();

      // Should not throw
      expect(store.theme).toBeDefined();

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });
});
