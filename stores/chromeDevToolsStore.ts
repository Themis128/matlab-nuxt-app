import { defineStore } from 'pinia';

/**
 * Chrome DevTools MCP connection state
 */
export interface ChromeDevToolsState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  browserUrl: string | null;
  debugPort: number;
  lastConnectedAt: number | null;
  reconnectAttempts: number;
}

/**
 * Browser performance data
 */
export interface BrowserPerformanceData {
  networkRequests: number;
  consoleErrors: number;
  consoleWarnings: number;
  pageLoadTime: number | null;
  timestamp: number;
}

/**
 * Chrome DevTools MCP store for managing browser debugging connection
 */
export const useChromeDevToolsStore = defineStore('chromeDevTools', {
  state: (): ChromeDevToolsState & {
    performanceData: BrowserPerformanceData[];
    isMonitoring: boolean;
  } => ({
    // Connection state
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    browserUrl: null,
    debugPort: 9222,
    lastConnectedAt: null,
    reconnectAttempts: 0,

    // Performance monitoring
    performanceData: [],
    isMonitoring: false,
  }),

  getters: {
    /**
     * Get connection status summary
     */
    connectionStatus: (state) => {
      if (state.isConnected) {
        return {
          status: 'connected',
          message: `Connected to Chrome on port ${state.debugPort}`,
          color: 'green',
          icon: 'i-heroicons-check-circle',
        };
      }

      if (state.isConnecting) {
        return {
          status: 'connecting',
          message: 'Connecting to Chrome DevTools...',
          color: 'blue',
          icon: 'i-heroicons-arrow-path',
        };
      }

      if (state.connectionError) {
        return {
          status: 'error',
          message: state.connectionError,
          color: 'red',
          icon: 'i-heroicons-exclamation-triangle',
        };
      }

      return {
        status: 'disconnected',
        message: 'Not connected to Chrome DevTools',
        color: 'gray',
        icon: 'i-heroicons-x-circle',
      };
    },

    /**
     * Get latest performance data
     */
    latestPerformanceData: (state) => {
      return state.performanceData.length > 0
        ? state.performanceData[state.performanceData.length - 1]
        : null;
    },

    /**
     * Get recent performance data
     */
    recentPerformanceData:
      (state) =>
      (count: number = 10) => {
        return state.performanceData.slice(-count);
      },

    /**
     * Check if can connect
     */
    canConnect: (state) => {
      return !state.isConnecting && !state.isConnected;
    },
  },

  actions: {
    /**
     * Initialize store
     */
    async initialize(browserUrl?: string, debugPort?: number) {
      if (browserUrl) {
        this.browserUrl = browserUrl;
      }

      if (debugPort) {
        this.debugPort = debugPort;
      }

      // Try to detect existing connection (non-blocking)
      return this.checkConnection();
    },

    /**
     * Check if Chrome DevTools is accessible
     */
    async checkConnection() {
      // Only attempt connection in development/browser environment
      if (import.meta.server) {
        return;
      }

      if (!this.browserUrl) {
        this.browserUrl = `http://127.0.0.1:${this.debugPort}`;
      }

      this.isConnecting = true;
      this.connectionError = null;

      try {
        const response = await fetch(`${this.browserUrl}/json/version`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000),
          // Suppress CSP errors by catching them gracefully
        }).catch((fetchError) => {
          // Handle CSP or network errors gracefully
          if (fetchError.name === 'AbortError') {
            throw new Error('Connection timeout');
          }
          // Check if it's a CSP violation
          if (
            fetchError.message?.includes('CSP') ||
            fetchError.message?.includes('Content Security Policy')
          ) {
            throw new Error('CSP blocked connection - check security headers');
          }
          throw fetchError;
        });

        if (response.ok) {
          this.isConnected = true;
          this.lastConnectedAt = Date.now();
          this.reconnectAttempts = 0;
          this.connectionError = null;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        this.isConnected = false;
        // Only set error message if it's not a CSP or CORS violation (which are expected)
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to connect to Chrome DevTools';
        const isExpectedError =
          errorMessage.includes('CSP') ||
          errorMessage.includes('Content Security Policy') ||
          errorMessage.includes('CORS') ||
          errorMessage.includes('Access-Control-Allow-Origin') ||
          errorMessage.includes('Connection timeout') ||
          errorMessage.includes('Failed to fetch');

        if (!isExpectedError) {
          this.connectionError = errorMessage;
        } else {
          // CSP/CORS errors are expected - Chrome DevTools doesn't support CORS
          // The MCP server connects from outside the browser, so this is normal
          this.connectionError = null;
        }
        this.reconnectAttempts++;
      } finally {
        this.isConnecting = false;
      }
    },

    /**
     * Connect to Chrome DevTools
     */
    async connect(browserUrl?: string, debugPort?: number) {
      if (browserUrl) {
        this.browserUrl = browserUrl;
      }

      if (debugPort) {
        this.debugPort = debugPort;
      }

      await this.checkConnection();
    },

    /**
     * Disconnect from Chrome DevTools
     */
    disconnect() {
      this.isConnected = false;
      this.isConnecting = false;
      this.connectionError = null;
      this.lastConnectedAt = null;
      this.isMonitoring = false;
    },

    /**
     * Start performance monitoring
     */
    startMonitoring() {
      if (!this.isConnected) {
        this.connectionError = 'Cannot start monitoring: not connected to Chrome DevTools';
        return;
      }

      this.isMonitoring = true;
    },

    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
      this.isMonitoring = false;
    },

    /**
     * Add performance data
     */
    addPerformanceData(data: Omit<BrowserPerformanceData, 'timestamp'>) {
      this.performanceData.push({
        ...data,
        timestamp: Date.now(),
      });

      // Keep only last 100 entries
      if (this.performanceData.length > 100) {
        this.performanceData.shift();
      }
    },

    /**
     * Clear performance data
     */
    clearPerformanceData() {
      this.performanceData = [];
    },

    /**
     * Reset connection state
     */
    resetConnection() {
      this.isConnected = false;
      this.isConnecting = false;
      this.connectionError = null;
      this.lastConnectedAt = null;
      this.reconnectAttempts = 0;
    },

    /**
     * Reset store
     */
    reset() {
      this.isConnected = false;
      this.isConnecting = false;
      this.connectionError = null;
      this.browserUrl = null;
      this.debugPort = 9222;
      this.lastConnectedAt = null;
      this.reconnectAttempts = 0;
      this.performanceData = [];
      this.isMonitoring = false;
    },
  },

  persist: {
    key: 'chrome-devtools-store',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    paths: ['browserUrl', 'debugPort', 'lastConnectedAt'],
  },
});
