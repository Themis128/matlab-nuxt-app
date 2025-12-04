/**
 * Accessibility utilities composable
 * Provides helpers for improved accessibility and UX
 */

export function useAccessibility() {
  /**
   * Announce message to screen readers
   */
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  /**
   * Trap focus within an element (for modals, dialogs)
   */
  const trapFocus = (element: HTMLElement) => {
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
  const prefersReducedMotion = () => {
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
   * Get contrast ratio between two colors (basic implementation)
   */
  const getContrastRatio = (_color1: string, _color2: string): number => {
    // Simplified implementation - in production, use a proper color contrast library
    return 4.5; // Placeholder - should calculate actual contrast
  };

  /**
   * Check if touch device
   */
  const isTouchDevice = () => {
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
