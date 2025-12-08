/**
 * Motion composable using @vueuse/motion
 * Provides reusable animation utilities
 */

import type { MaybeRef } from 'vue';
import { useMotion } from '@vueuse/motion';

export const usePageMotion = () => {
  /**
   * Fade in animation
   */
  const fadeIn = (target: MaybeRef<HTMLElement>, options?: any) => {
    return useMotion(target, {
      initial: { opacity: 0 },
      enter: {
        opacity: 1,
        transition: {
          duration: 300,
          ease: 'easeInOut',
          ...options,
        },
      },
    });
  };

  /**
   * Slide in from bottom
   */
  const slideUp = (target: MaybeRef<HTMLElement>, options?: any) => {
    return useMotion(target, {
      initial: { opacity: 0, y: 20 },
      enter: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 400,
          ease: 'easeOut',
          ...options,
        },
      },
    });
  };

  /**
   * Slide in from left
   */
  const slideLeft = (target: MaybeRef<HTMLElement>, options?: any) => {
    return useMotion(target, {
      initial: { opacity: 0, x: -20 },
      enter: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 400,
          ease: 'easeOut',
          ...options,
        },
      },
    });
  };

  /**
   * Scale in animation
   */
  const scaleIn = (target: MaybeRef<HTMLElement>, options?: any) => {
    return useMotion(target, {
      initial: { opacity: 0, scale: 0.9 },
      enter: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 300,
          ease: 'easeOut',
          ...options,
        },
      },
    });
  };

  /**
   * Stagger children animation
   */
  const staggerChildren = (target: MaybeRef<HTMLElement>, delay: number = 100) => {
    return useMotion(target, {
      initial: { opacity: 0, y: 20 },
      enter: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 400,
          ease: 'easeOut',
          staggerChildren: delay,
        },
      },
    });
  };

  /**
   * Hover scale effect
   */
  const hoverScale = (target: MaybeRef<HTMLElement>) => {
    return useMotion(target, {
      hover: {
        scale: 1.05,
        transition: {
          duration: 200,
          ease: 'easeInOut',
        },
      },
      tap: {
        scale: 0.95,
      },
    });
  };

  /**
   * Card entrance animation
   */
  const cardEntrance = (target: MaybeRef<HTMLElement>, index: number = 0) => {
    return useMotion(target, {
      initial: { opacity: 0, y: 30, scale: 0.95 },
      enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 400,
          delay: index * 100,
          ease: 'easeOut',
        },
      },
    });
  };

  return {
    fadeIn,
    slideUp,
    slideLeft,
    scaleIn,
    staggerChildren,
    hoverScale,
    cardEntrance,
  };
};
