/**
 * Composable for responsive design utilities using VueUse
 * Provides breakpoint detection and responsive behavior
 */

import { computed } from 'vue'
import { useBreakpoints } from '@vueuse/core'

export const useResponsive = () => {
  // Define breakpoints matching Tailwind CSS
  const breakpoints = useBreakpoints({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  })

  // Responsive state
  const isMobile = breakpoints.smaller('md')
  const isTablet = breakpoints.between('md', 'lg')
  const isDesktop = breakpoints.greater('lg')
  const isAboveMd = breakpoints.greaterOrEqual('md')

  // Current breakpoint
  const currentBreakpoint = computed(() => {
    if (isMobile.value) return 'mobile'
    if (isTablet.value) return 'tablet'
    return 'desktop'
  })

  // Utility functions
  const getGridCols = () => {
    if (isMobile.value) return { cols: 1, gap: 'gap-4' }
    if (isTablet.value) return { cols: 2, gap: 'gap-4' }
    return { cols: 3, gap: 'gap-6' }
  }

  const getCardSize = () => {
    if (isMobile.value) return 'small'
    if (isTablet.value) return 'medium'
    return 'large'
  }

  return {
    // Reactive states
    isMobile,
    isTablet,
    isDesktop,
    isAboveMd,
    currentBreakpoint,
    breakpoints,

    // Utility functions
    getGridCols,
    getCardSize,

    // Breakpoints for component logic
    greater: breakpoints.greater,
    smaller: breakpoints.smaller,
    between: breakpoints.between,
    greaterOrEqual: breakpoints.greaterOrEqual,
    smallerOrEqual: breakpoints.smallerOrEqual,
  }
}
