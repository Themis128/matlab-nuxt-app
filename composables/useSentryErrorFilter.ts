/**
 * Sentry Error Filter Composable
 *
 * Provides custom error filtering and processing for Sentry
 */

import { captureException } from './useSentryUtils';
import { useSentryLogger } from './useSentryLogger';

export interface ErrorFilterRule {
  // Pattern to match against error message or stack
  pattern: RegExp | string;
  // Action to take: 'ignore', 'modify', 'tag'
  action: 'ignore' | 'modify' | 'tag';
  // Optional: tags to add if action is 'tag'
  tags?: Record<string, string>;
  // Optional: modification function if action is 'modify'
  modify?: (error: Error) => Error;
  // Optional: custom message if action is 'modify'
  message?: string;
}

/**
 * Composable for custom error filtering
 */
export const useSentryErrorFilter = () => {
  const logger = useSentryLogger();
  const filters: ErrorFilterRule[] = [];

  /**
   * Add a custom error filter rule
   */
  const addFilter = (rule: ErrorFilterRule) => {
    filters.push(rule);
  };

  /**
   * Remove all filters
   */
  const clearFilters = () => {
    filters.length = 0;
  };

  /**
   * Process an error through all filters
   */
  const processError = (
    error: Error,
    context?: Record<string, unknown>,
    tags?: Record<string, string | number | boolean>
  ): boolean => {
    const errorMessage = error.message || String(error);
    const errorStack = error.stack || '';

    for (const filter of filters) {
      const pattern =
        typeof filter.pattern === 'string' ? new RegExp(filter.pattern, 'i') : filter.pattern;

      const matchesMessage = pattern.test(errorMessage);
      const matchesStack = pattern.test(errorStack);

      if (matchesMessage || matchesStack) {
        switch (filter.action) {
          case 'ignore':
            logger.debug('Error filtered (ignored)', {
              error: errorMessage,
              filter: filter.pattern.toString(),
            });
            return false; // Don't send to Sentry

          case 'modify':
            const modifiedError = filter.modify
              ? filter.modify(error)
              : new Error(filter.message || errorMessage);

            captureException(modifiedError, 'error', context, {
              ...tags,
              filtered: 'true',
              original_message: errorMessage,
            });
            return true;

          case 'tag':
            captureException(error, 'error', context, {
              ...tags,
              ...filter.tags,
            });
            return true;
        }
      }
    }

    // No filter matched, send error normally
    return true;
  };

  /**
   * Capture error with filtering
   */
  const captureFilteredError = (
    error: Error,
    context?: Record<string, unknown>,
    tags?: Record<string, string | number | boolean>
  ) => {
    if (processError(error, context, tags)) {
      captureException(error, 'error', context, tags);
    }
  };

  /**
   * Add common filter rules
   */
  const addCommonFilters = () => {
    // Ignore browser extension errors
    addFilter({
      pattern: /(chrome-extension|moz-extension|safari-extension)/i,
      action: 'ignore',
    });

    // Ignore common benign errors
    addFilter({
      pattern: /(ResizeObserver|Non-Error promise rejection|Script error)/i,
      action: 'ignore',
    });

    // Tag network errors
    addFilter({
      pattern: /(fetch|network|timeout|connection)/i,
      action: 'tag',
      tags: { error_category: 'network' },
    });

    // Tag authentication errors
    addFilter({
      pattern: /(unauthorized|forbidden|401|403)/i,
      action: 'tag',
      tags: { error_category: 'authentication' },
    });
  };

  return {
    addFilter,
    clearFilters,
    processError,
    captureFilteredError,
    addCommonFilters,
  };
};
