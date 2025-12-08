/**
 * Unified API Composable
 *
 * Consolidates API-related functionality.
 * Integrates with API Gateway for all API calls.
 */

import { useApiStore } from '~/application/features/api/store/api.store';
import { useApiGateway } from '~/composables/useApiGateway';

export const useApi = () => {
  const store = useApiStore();
  const gateway = useApiGateway();

  // ==========================================================================
  // Health Check
  // ==========================================================================

  /**
   * Check API health
   */
  const checkApiHealth = async () => {
    await store.checkApiHealth();
  };

  /**
   * Refresh API status
   */
  const refreshStatus = async () => {
    await store.refreshStatus();
  };

  /**
   * Reset and retry
   */
  const resetAndRetry = async () => {
    await store.resetAndRetry();
  };

  /**
   * Start periodic health checks
   */
  const startPeriodicHealthCheck = () => {
    return store.startPeriodicHealthCheck();
  };

  /**
   * Stop periodic health checks
   */
  const stopPeriodicHealthCheck = (interval?: ReturnType<typeof setInterval>) => {
    store.stopPeriodicHealthCheck(interval);
  };

  // ==========================================================================
  // API Gateway Methods
  // ==========================================================================

  /**
   * Predict price (via gateway)
   */
  const predictPrice = async (
    data: Record<string, unknown>,
    options?: { useCache?: boolean; cacheTTL?: number }
  ) => {
    return await gateway.predictPrice(data, options);
  };

  /**
   * Predict RAM (via gateway)
   */
  const predictRAM = async (
    data: Record<string, unknown>,
    options?: { useCache?: boolean; cacheTTL?: number }
  ) => {
    return await gateway.predictRAM(data, options);
  };

  /**
   * Predict battery (via gateway)
   */
  const predictBattery = async (
    data: Record<string, unknown>,
    options?: { useCache?: boolean; cacheTTL?: number }
  ) => {
    return await gateway.predictBattery(data, options);
  };

  /**
   * Predict brand (via gateway)
   */
  const predictBrand = async (
    data: Record<string, unknown>,
    options?: { useCache?: boolean; cacheTTL?: number }
  ) => {
    return await gateway.predictBrand(data, options);
  };

  /**
   * Search phones (via gateway)
   */
  const searchPhones = async (
    query: string,
    options?: { useCache?: boolean; cacheTTL?: number }
  ) => {
    return await gateway.searchPhones(query, options);
  };

  /**
   * Health check (via gateway)
   */
  const health = async (options?: { skipCircuitBreaker?: boolean }) => {
    return await gateway.health(options);
  };

  // ==========================================================================
  // Error Management
  // ==========================================================================

  /**
   * Clear errors
   */
  const clearErrors = () => {
    store.clearErrors();
  };

  /**
   * Force offline (for testing)
   */
  const forceOffline = () => {
    store.forceOffline();
  };

  /**
   * Cleanup
   */
  const cleanup = () => {
    store.cleanup();
  };

  // ==========================================================================
  // Computed Properties
  // ==========================================================================

  const isOnline = computed(() => store.isOnline);
  const isChecking = computed(() => store.isChecking);
  const error = computed(() => store.error);
  const errorType = computed(() => store.errorType);
  const responseTime = computed(() => store.responseTime);
  const connectionQuality = computed(() => store.connectionQuality);
  const statusSummary = computed(() => store.statusSummary);
  const isInFailureState = computed(() => store.isInFailureState);
  const lastChecked = computed(() => store.lastChecked);
  const lastCheckedFormatted = computed(() => store.lastCheckedFormatted);
  const timeSinceLastSuccess = computed(() => store.timeSinceLastSuccess);

  return {
    // Health Check
    checkApiHealth,
    refreshStatus,
    resetAndRetry,
    startPeriodicHealthCheck,
    stopPeriodicHealthCheck,

    // API Gateway Methods
    predictPrice,
    predictRAM,
    predictBattery,
    predictBrand,
    searchPhones,
    health,

    // Error Management
    clearErrors,
    forceOffline,
    cleanup,

    // Computed
    isOnline,
    isChecking,
    error,
    errorType,
    responseTime,
    connectionQuality,
    statusSummary,
    isInFailureState,
    lastChecked,
    lastCheckedFormatted,
    timeSinceLastSuccess,
  };
};
