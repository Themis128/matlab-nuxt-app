/**
 * Composable for managing prediction history
 * Stores predictions in localStorage
 */

import type { PredictionHistoryItem } from '~/stores/predictionHistoryStore'

const STORAGE_KEY = 'mobile-prediction-history'
const MAX_HISTORY = 50 // Keep last 50 predictions

export const usePredictionHistory = () => {
  const getHistory = (): PredictionHistoryItem[] => {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  const savePrediction = (item: Omit<PredictionHistoryItem, 'id' | 'timestamp'>) => {
    if (typeof window === 'undefined') return

    try {
      const history = getHistory()
      const newItem: PredictionHistoryItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      }

      history.unshift(newItem)
      // Keep only the last MAX_HISTORY items
      const trimmed = history.slice(0, MAX_HISTORY)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } catch (error) {
      console.error('Failed to save prediction history:', error)
    }
  }

  const getHistoryByModel = (model: string): PredictionHistoryItem[] => {
    return getHistory().filter(item => item.model === model)
  }

  const clearHistory = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    getHistory,
    savePrediction,
    getHistoryByModel,
    clearHistory,
  }
}
