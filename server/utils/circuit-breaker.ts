/**
 * Circuit Breaker pattern implementation for external API calls
 * Prevents cascading failures when external services are down
 */

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening circuit
  resetTimeout: number; // Time in ms before attempting to close circuit
  monitoringPeriod: number; // Time window for failure counting
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;
  private readonly options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      resetTimeout: options.resetTimeout ?? 60000, // 1 minute
      monitoringPeriod: options.monitoringPeriod ?? 60000, // 1 minute
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.updateState();

    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN - service unavailable');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    this.updateState();
    return this.state;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats() {
    return {
      state: this.state,
      failures: this.failures,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
    };
  }

  /**
   * Reset circuit breaker manually
   */
  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }

  private updateState() {
    const now = Date.now();

    if (this.state === 'OPEN') {
      // Check if we should attempt to close (half-open state)
      if (now - this.lastFailureTime >= this.options.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.failures = 0;
      }
    } else if (this.state === 'HALF_OPEN') {
      // If we've had some successes in half-open, close the circuit
      if (this.successCount >= 2) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
    } else if (this.state === 'CLOSED') {
      // Reset failure count on success (sliding window)
      this.failures = Math.max(0, this.failures - 1);
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.failureThreshold) {
      this.state = 'OPEN';
    } else if (this.state === 'HALF_OPEN') {
      // If we fail in half-open, go back to open
      this.state = 'OPEN';
      this.successCount = 0;
    }
  }
}

/**
 * Global circuit breaker instances for different services
 */
export const circuitBreakers = {
  pythonAPI: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
  }),
  algolia: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
  }),
};
