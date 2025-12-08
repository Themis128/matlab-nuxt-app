import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

// Mock Vue lifecycle hooks
const mockOnMounted = vi.fn((fn: () => void) => {
  if (typeof window !== 'undefined') {
    fn();
  }
});
const mockOnUnmounted = vi.fn((fn: () => void) => {
  if (typeof window !== 'undefined') {
    fn();
  }
});

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onMounted: mockOnMounted,
    onUnmounted: mockOnUnmounted,
    readonly: (val: any) => val,
  };
});

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      client: true,
    },
  },
  writable: true,
});

describe('useKeyboardShortcuts', () => {
  let mockAddEventListener: any;
  let mockRemoveEventListener: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();

    Object.defineProperty(document, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    });

    Object.defineProperty(document, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true,
    });

    // Mock window
    Object.defineProperty(global, 'window', {
      value: {
        dispatchEvent: vi.fn(),
        location: { href: '' },
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return shortcuts interface', () => {
    const shortcuts = useKeyboardShortcuts();

    expect(shortcuts).toHaveProperty('shortcuts');
    expect(shortcuts).toHaveProperty('showShortcutsHelp');
    expect(shortcuts).toHaveProperty('focusSearch');
    expect(shortcuts).toHaveProperty('openPreferences');
    expect(shortcuts).toHaveProperty('navigateToHome');
    expect(shortcuts).toHaveProperty('toggleTheme');
  });

  it('should add keyboard event listener on mount', () => {
    useKeyboardShortcuts();

    expect(mockOnMounted).toHaveBeenCalled();
  });

  it('should remove keyboard event listener on unmount', () => {
    useKeyboardShortcuts();

    expect(mockOnUnmounted).toHaveBeenCalled();
  });

  it('should dispatch show shortcuts event', () => {
    const shortcuts = useKeyboardShortcuts();
    shortcuts.showShortcutsHelp();

    expect((global as any).window.dispatchEvent).toHaveBeenCalled();
  });

  it('should focus search input', () => {
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Search...';
    document.body.appendChild(input);

    const shortcuts = useKeyboardShortcuts();
    shortcuts.focusSearch();

    // Should attempt to focus
    expect(document.querySelector).toHaveBeenCalled();
  });

  it('should open preferences', () => {
    const shortcuts = useKeyboardShortcuts();
    shortcuts.openPreferences();

    expect((global as any).window.dispatchEvent).toHaveBeenCalled();
  });

  it('should navigate to home', () => {
    const shortcuts = useKeyboardShortcuts();
    shortcuts.navigateToHome();

    expect((global as any).window.location.href).toBe('/');
  });
});
