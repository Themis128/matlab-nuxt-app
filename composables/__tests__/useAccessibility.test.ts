import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAccessibility } from '../useAccessibility';

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      client: true,
    },
  },
  writable: true,
});

describe('useAccessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should return accessibility methods', () => {
    const a11y = useAccessibility();

    expect(a11y).toHaveProperty('announceToScreenReader');
    expect(a11y).toHaveProperty('trapFocus');
    expect(a11y).toHaveProperty('prefersReducedMotion');
    expect(a11y).toHaveProperty('getAnimationDuration');
    expect(a11y).toHaveProperty('setupSkipLinks');
    expect(a11y).toHaveProperty('setAriaLabel');
    expect(a11y).toHaveProperty('setAriaBusy');
    expect(a11y).toHaveProperty('announceLoadingState');
    expect(a11y).toHaveProperty('isElementVisible');
    expect(a11y).toHaveProperty('scrollToElement');
    expect(a11y).toHaveProperty('getContrastRatio');
    expect(a11y).toHaveProperty('isTouchDevice');
  });

  it('should announce to screen reader', () => {
    const a11y = useAccessibility();
    const cleanup = a11y.announceToScreenReader('Test message');

    const announcement = document.querySelector('[role="status"]');
    expect(announcement).toBeTruthy();
    expect(announcement?.textContent).toBe('Test message');

    if (cleanup) {
      cleanup();
    }
  });

  it('should trap focus within element', () => {
    const a11y = useAccessibility();
    const container = document.createElement('div');
    container.innerHTML = '<button>Button 1</button><button>Button 2</button>';
    document.body.appendChild(container);

    const cleanup = a11y.trapFocus(container);

    expect(cleanup).toBeDefined();
    cleanup();
  });

  it('should check prefers reduced motion', () => {
    const a11y = useAccessibility();
    window.matchMedia = vi.fn(() => ({
      matches: true,
    })) as any;

    const prefers = a11y.prefersReducedMotion();

    expect(typeof prefers).toBe('boolean');
  });

  it('should get animation duration', () => {
    const a11y = useAccessibility();
    window.matchMedia = vi.fn(() => ({
      matches: false,
    })) as any;

    const duration = a11y.getAnimationDuration(300);

    expect(duration).toBe(300);
  });

  it('should setup skip links', () => {
    const a11y = useAccessibility();
    a11y.setupSkipLinks();

    const skipLink = document.querySelector('.skip-to-main');
    expect(skipLink).toBeTruthy();
  });

  it('should set ARIA label', () => {
    const a11y = useAccessibility();
    const element = document.createElement('button');
    a11y.setAriaLabel(element, 'Test label');

    expect(element.getAttribute('aria-label')).toBe('Test label');
  });

  it('should set ARIA busy state', () => {
    const a11y = useAccessibility();
    const element = document.createElement('div');
    a11y.setAriaBusy(element, true);

    expect(element.getAttribute('aria-busy')).toBe('true');
  });

  it('should check element visibility', () => {
    const a11y = useAccessibility();
    const element = document.createElement('div');
    document.body.appendChild(element);

    const visible = a11y.isElementVisible(element);

    expect(typeof visible).toBe('boolean');
  });

  it('should get contrast ratio', () => {
    const a11y = useAccessibility();
    const ratio = a11y.getContrastRatio('#000000', '#FFFFFF');

    expect(ratio).toBeGreaterThan(1);
  });

  it('should check if touch device', () => {
    const a11y = useAccessibility();
    (navigator as any).maxTouchPoints = 1;

    const isTouch = a11y.isTouchDevice();

    expect(typeof isTouch).toBe('boolean');
  });
});
