/**
 * Composable for managing prediction history
 * Stores predictions in localStorage
 */

import type { PredictionHistoryItem } from '~/stores/predictionHistoryStore';

const STORAGE_KEY = 'mobile-prediction-history';
const MAX_HISTORY = 50; // Keep last 50 predictions

export const usePredictionHistory = () => {
  /**
   * Validate and parse stored history data
   */
  const validateHistoryItem = (item: unknown): item is PredictionHistoryItem => {
    return (
      item !== null &&
      typeof item === 'object' &&
      typeof (item as PredictionHistoryItem).id === 'string' &&
      typeof (item as PredictionHistoryItem).timestamp === 'number' &&
      typeof (item as PredictionHistoryItem).model === 'string' &&
      typeof (item as PredictionHistoryItem).input === 'object' &&
      ((item as PredictionHistoryItem).result !== undefined ||
        (item as PredictionHistoryItem).error !== undefined)
    );
  };

  const getHistory = (): PredictionHistoryItem[] => {
    if (!import.meta.client) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      // Validate each item to ensure data integrity
      const validItems = parsed.filter(validateHistoryItem);

      // Log any invalid items for debugging
      if (validItems.length !== parsed.length) {
        const logger = useSentryLogger();
        logger.warn(
          `Filtered out ${parsed.length - validItems.length} invalid history items from localStorage`,
          {
            component: 'usePredictionHistory',
            action: 'getHistory',
            filteredCount: parsed.length - validItems.length,
          }
        );
      }

      return validItems;
    } catch (error) {
      const logger = useSentryLogger();
      logger.warn('Failed to load prediction history', {
        component: 'usePredictionHistory',
        action: 'getHistory',
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  };

  const savePrediction = (item: Omit<PredictionHistoryItem, 'id' | 'timestamp'>) => {
    if (!import.meta.client) return;

    try {
      const history = getHistory();
      const newItem: PredictionHistoryItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: Date.now(),
      };

      history.unshift(newItem);
      // Keep only the last MAX_HISTORY items
      const trimmed = history.slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      const logger = useSentryLogger();
      logger.logError(
        'Failed to save prediction history',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'usePredictionHistory',
          action: 'savePrediction',
        }
      );
    }
  };

  const getHistoryByModel = (model: string): PredictionHistoryItem[] => {
    return getHistory().filter((item) => item.model === model);
  };

  const getHistoryByDateRange = (startDate: number, endDate: number): PredictionHistoryItem[] => {
    return getHistory().filter((item) => item.timestamp >= startDate && item.timestamp <= endDate);
  };

  const getHistoryByCompany = (company: string): PredictionHistoryItem[] => {
    return getHistory().filter(
      (item) => item.input.company?.toLowerCase() === company.toLowerCase()
    );
  };

  const clearHistory = () => {
    if (!import.meta.client) return;
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportHistory = (): string => {
    const history = getHistory();
    return JSON.stringify(history, null, 2);
  };

  const getStorageInfo = () => {
    if (!import.meta.client) return { size: 0, count: 0 };

    const data = localStorage.getItem(STORAGE_KEY) || '';
    const history = getHistory();

    return {
      size: new Blob([data]).size,
      count: history.length,
      lastUpdated: history.length > 0 ? Math.max(...history.map((h) => h.timestamp)) : null,
    };
  };

  return {
    getHistory,
    savePrediction,
    getHistoryByModel,
    getHistoryByDateRange,
    getHistoryByCompany,
    clearHistory,
    exportHistory,
    getStorageInfo,
  };
};
