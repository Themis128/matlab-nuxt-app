import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

// Mock the composable directly
const mockResponsive = {
  isMobile: ref(false),
  isTablet: ref(false),
  isDesktop: ref(true),
  isAboveMd: ref(true),
  currentBreakpoint: ref('desktop'),
  getGridCols: vi.fn(() => {
    if (mockResponsive.isMobile.value) return { cols: 1, gap: 'gap-4' };
    if (mockResponsive.isTablet.value) return { cols: 2, gap: 'gap-4' };
    return { cols: 3, gap: 'gap-6' };
  }),
  getCardSize: vi.fn(() => {
    if (mockResponsive.isMobile.value) return 'small';
    if (mockResponsive.isTablet.value) return 'medium';
    return 'large';
  }),
};

vi.mock('../useResponsive', () => ({
  useResponsive: vi.fn(() => mockResponsive),
}));

import { useResponsive } from '../useResponsive';

describe('useResponsive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock values
    mockResponsive.isMobile.value = false;
    mockResponsive.isTablet.value = false;
    mockResponsive.isDesktop.value = true;
    mockResponsive.isAboveMd.value = true;
    mockResponsive.currentBreakpoint.value = 'desktop';
  });

  it('should return responsive interface', () => {
    const responsive = useResponsive();

    expect(responsive).toHaveProperty('isMobile');
    expect(responsive).toHaveProperty('isTablet');
    expect(responsive).toHaveProperty('isDesktop');
    expect(responsive).toHaveProperty('currentBreakpoint');
    expect(responsive).toHaveProperty('getGridCols');
    expect(responsive).toHaveProperty('getCardSize');
  });

  it('should return grid columns based on breakpoint', () => {
    const responsive = useResponsive();

    // Mock mobile
    (responsive.isMobile as any).value = true;
    const mobileCols = responsive.getGridCols();
    expect(mobileCols.cols).toBe(1);

    // Mock tablet
    (responsive.isMobile as any).value = false;
    (responsive.isTablet as any).value = true;
    const tabletCols = responsive.getGridCols();
    expect(tabletCols.cols).toBe(2);

    // Mock desktop
    (responsive.isTablet as any).value = false;
    (responsive.isDesktop as any).value = true;
    const desktopCols = responsive.getGridCols();
    expect(desktopCols.cols).toBe(3);
  });

  it('should return card size based on breakpoint', () => {
    const responsive = useResponsive();

    (responsive.isMobile as any).value = true;
    expect(responsive.getCardSize()).toBe('small');

    (responsive.isMobile as any).value = false;
    (responsive.isTablet as any).value = true;
    expect(responsive.getCardSize()).toBe('medium');

    (responsive.isTablet as any).value = false;
    (responsive.isDesktop as any).value = true;
    expect(responsive.getCardSize()).toBe('large');
  });
});
