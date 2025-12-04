import { defineStore } from 'pinia';

/**
 * Pinia store for managing prediction history
 */
export interface PredictionHistoryItem {
  id: string;
  model: 'price' | 'brand' | 'ram' | 'battery';
  input: Record<string, any>;
  result: number | string;
  timestamp: number;
  predictionTime: number;
  source: 'api' | 'fallback';
  error?: string;
}

const STORAGE_KEY = 'mobile-prediction-history';
const MAX_HISTORY = 50; // Keep last 50 predictions

export const usePredictionHistoryStore = defineStore('predictionHistory', {
  state: () => ({
    history: [] as PredictionHistoryItem[],
  }),

  actions: {
    /**
     * Load history from localStorage
     * Call this when the app initializes
     */
    loadHistory() {
      if (typeof window === 'undefined') return;

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.history = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Failed to load prediction history:', error);
      }
    },

    /**
     * Save a new prediction to history
     */
    savePrediction(item: Omit<PredictionHistoryItem, 'id' | 'timestamp'>) {
      if (typeof window === 'undefined') return;

      try {
        const newItem: PredictionHistoryItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: Date.now(),
        };

        // Add to state
        this.history.unshift(newItem);
        // Keep only the last MAX_HISTORY items
        this.history = this.history.slice(0, MAX_HISTORY);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
      } catch (error) {
        console.error('Failed to save prediction history:', error);
      }
    },

    /**
     * Clear all history
     */
    clearHistory() {
      if (typeof window === 'undefined') return;

      this.history = [];
      localStorage.removeItem(STORAGE_KEY);
    },
  },

  getters: {
    /**
     * Get all history items
     */
    getAllHistory(): PredictionHistoryItem[] {
      return this.history;
    },

    /**
     * Get history items by model type
     */
    getHistoryByModel:
      (state) =>
      (model: string): PredictionHistoryItem[] => {
        return state.history.filter((item) => item.model === model);
      },
  },
});
