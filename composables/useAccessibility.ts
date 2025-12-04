/**
 * Accessibility utilities composable
 * Provides helpers for improved accessibility and UX
 */

export function useAccessibility() {
  /**
   * Announce message to screen readers
   */
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!import.meta.client) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Store reference for cleanup
    const cleanup = () => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };

    const timeoutId = setTimeout(cleanup, 1000);

    // Return cleanup function for manual cleanup if needed
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  };

  /**
   * Trap focus within an element (for modals, dialogs)
   */
  const trapFocus = (element: HTMLElement) => {
    if (!import.meta.client) return () => {};

    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable && lastFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable && firstFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  };

  /**
   * Check if user prefers reduced motion
   */
  const prefersReducedMotion = (): boolean => {
    if (!import.meta.client) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Get appropriate animation duration based on user preferences
   */
  const getAnimationDuration = (defaultMs: number = 300): number => {
    return prefersReducedMotion() ? 0 : defaultMs;
  };

  /**
   * Manage skip links for keyboard navigation
   */
  const setupSkipLinks = () => {
    if (!import.meta.client) return;

    // Check if skip link already exists
    const existingSkipLink = document.querySelector('.skip-to-main');
    if (existingSkipLink) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-main';
    skipLink.textContent = 'Skip to main content';

    document.body.insertBefore(skipLink, document.body.firstChild);
  };

  /**
   * Add ARIA labels dynamically
   */
  const setAriaLabel = (element: HTMLElement | null, label: string) => {
    if (element) {
      element.setAttribute('aria-label', label);
    }
  };

  /**
   * Set ARIA busy state for loading states
   */
  const setAriaBusy = (element: HTMLElement | null, busy: boolean) => {
    if (element) {
      element.setAttribute('aria-busy', String(busy));
    }
  };

  /**
   * Announce loading state to screen readers
   */
  const announceLoadingState = (isLoading: boolean, message?: string) => {
    if (isLoading) {
      announceToScreenReader(message || 'Loading, please wait...', 'polite');
    } else {
      announceToScreenReader(message || 'Loading complete', 'polite');
    }
  };

  /**
   * Check if element is visible on screen
   */
  const isElementVisible = (element: HTMLElement): boolean => {
    if (!import.meta.client) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  /**
   * Smooth scroll to element with focus management
   */
  const scrollToElement = (elementId: string, focusElement = true) => {
    if (!import.meta.client) return;

    const element = document.getElementById(elementId);
    if (element) {
      const scrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
      element.scrollIntoView({ behavior: scrollBehavior, block: 'start' });

      if (focusElement && element.tabIndex === -1) {
        element.tabIndex = -1;
        element.focus();
      }
    }
  };

  /**
   * Get luminance of a color for contrast calculation
   */
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const sRGB = c / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    }) as [number, number, number];
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  /**
   * Parse hex color to RGB
   */
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1]!, 16),
          g: parseInt(result[2]!, 16),
          b: parseInt(result[3]!, 16),
        }
      : null;
  };

  /**
   * Get contrast ratio between two colors
   * Returns a value between 1 and 21
   */
  const getContrastRatio = (color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  };

  /**
   * Check if touch device
   */
  const isTouchDevice = (): boolean => {
    if (!import.meta.client) return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  return {
    announceToScreenReader,
    trapFocus,
    prefersReducedMotion,
    getAnimationDuration,
    setupSkipLinks,
    setAriaLabel,
    setAriaBusy,
    announceLoadingState,
    isElementVisible,
    scrollToElement,
    getContrastRatio,
    isTouchDevice,
  };
}
