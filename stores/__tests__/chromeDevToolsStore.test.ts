import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useChromeDevToolsStore } from '../chromeDevToolsStore';

// Mock fetch globally
global.fetch = vi.fn();

describe('chromeDevToolsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('state', () => {
    it('should initialize with default state', () => {
      const store = useChromeDevToolsStore();

      expect(store.isConnected).toBe(false);
      expect(store.isConnecting).toBe(false);
      expect(store.connectionError).toBeNull();
      expect(store.browserUrl).toBeNull();
      expect(store.debugPort).toBe(9222);
      expect(store.performanceData).toEqual([]);
      expect(store.isMonitoring).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return connection status when connected', () => {
      const store = useChromeDevToolsStore();
      store.isConnected = true;
      store.debugPort = 9222;

      const status = store.connectionStatus;

      expect(status.status).toBe('connected');
      expect(status.color).toBe('green');
      expect(status.message).toContain('Connected to Chrome');
    });

    it('should return connection status when connecting', () => {
      const store = useChromeDevToolsStore();
      store.isConnecting = true;

      const status = store.connectionStatus;

      expect(status.status).toBe('connecting');
      expect(status.color).toBe('blue');
    });

    it('should return connection status when error', () => {
      const store = useChromeDevToolsStore();
      store.connectionError = 'Connection failed';

      const status = store.connectionStatus;

      expect(status.status).toBe('error');
      expect(status.color).toBe('red');
      expect(status.message).toBe('Connection failed');
    });

    it('should return disconnected status by default', () => {
      const store = useChromeDevToolsStore();

      const status = store.connectionStatus;

      expect(status.status).toBe('disconnected');
      expect(status.color).toBe('gray');
    });

    it('should get latest performance data', () => {
      const store = useChromeDevToolsStore();
      const data = {
        networkRequests: 10,
        consoleErrors: 0,
        consoleWarnings: 2,
        pageLoadTime: 1500,
        timestamp: Date.now(),
      };
      store.performanceData = [data];

      const latest = store.latestPerformanceData;

      expect(latest).toEqual(data);
    });

    it('should return null when no performance data', () => {
      const store = useChromeDevToolsStore();

      expect(store.latestPerformanceData).toBeNull();
    });

    it('should get recent performance data', () => {
      const store = useChromeDevToolsStore();
      store.performanceData = [
        {
          networkRequests: 5,
          consoleErrors: 0,
          consoleWarnings: 0,
          pageLoadTime: 1000,
          timestamp: Date.now(),
        },
        {
          networkRequests: 10,
          consoleErrors: 0,
          consoleWarnings: 2,
          pageLoadTime: 1500,
          timestamp: Date.now(),
        },
        {
          networkRequests: 15,
          consoleErrors: 1,
          consoleWarnings: 3,
          pageLoadTime: 2000,
          timestamp: Date.now(),
        },
      ];

      const recent = store.recentPerformanceData(2);

      expect(recent).toHaveLength(2);
    });

    it('should check if can connect', () => {
      const store = useChromeDevToolsStore();

      expect(store.canConnect).toBe(true);

      store.isConnecting = true;
      expect(store.canConnect).toBe(false);

      store.isConnecting = false;
      store.isConnected = true;
      expect(store.canConnect).toBe(false);
    });
  });

  describe('actions', () => {
    it('should initialize store', async () => {
      const store = useChromeDevToolsStore();
      (global.fetch as any).mockResolvedValue({ ok: true });

      await store.initialize('http://127.0.0.1:9222', 9222);

      expect(store.browserUrl).toBe('http://127.0.0.1:9222');
      expect(store.debugPort).toBe(9222);
    });

    it('should check connection successfully', async () => {
      const store = useChromeDevToolsStore();
      (global.fetch as any).mockResolvedValue({ ok: true });

      await store.checkConnection();

      expect(store.isConnected).toBe(true);
      expect(store.connectionError).toBeNull();
      expect(store.lastConnectedAt).toBeTruthy();
    });

    it('should handle connection failure', async () => {
      const store = useChromeDevToolsStore();
      (global.fetch as any).mockRejectedValue(new Error('Connection failed'));

      await store.checkConnection();

      expect(store.isConnected).toBe(false);
      expect(store.reconnectAttempts).toBeGreaterThan(0);
    });

    it('should handle timeout errors gracefully', async () => {
      const store = useChromeDevToolsStore();
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'AbortError';
      (global.fetch as any).mockRejectedValue(timeoutError);

      await store.checkConnection();

      expect(store.isConnected).toBe(false);
      // CSP/CORS/timeout errors should not set connectionError
      expect(store.connectionError).toBeNull();
    });

    it('should connect to Chrome DevTools', async () => {
      const store = useChromeDevToolsStore();
      (global.fetch as any).mockResolvedValue({ ok: true });

      await store.connect('http://127.0.0.1:9222', 9222);

      expect(store.browserUrl).toBe('http://127.0.0.1:9222');
      expect(store.debugPort).toBe(9222);
    });

    it('should disconnect', () => {
      const store = useChromeDevToolsStore();
      store.isConnected = true;
      store.isMonitoring = true;

      store.disconnect();

      expect(store.isConnected).toBe(false);
      expect(store.isConnecting).toBe(false);
      expect(store.isMonitoring).toBe(false);
    });

    it('should start monitoring when connected', () => {
      const store = useChromeDevToolsStore();
      store.isConnected = true;

      store.startMonitoring();

      expect(store.isMonitoring).toBe(true);
    });

    it('should not start monitoring when not connected', () => {
      const store = useChromeDevToolsStore();
      store.isConnected = false;

      store.startMonitoring();

      expect(store.isMonitoring).toBe(false);
      expect(store.connectionError).toContain('not connected');
    });

    it('should stop monitoring', () => {
      const store = useChromeDevToolsStore();
      store.isMonitoring = true;

      store.stopMonitoring();

      expect(store.isMonitoring).toBe(false);
    });

    it('should add performance data', () => {
      const store = useChromeDevToolsStore();

      store.addPerformanceData({
        networkRequests: 10,
        consoleErrors: 0,
        consoleWarnings: 2,
        pageLoadTime: 1500,
      });

      expect(store.performanceData).toHaveLength(1);
      expect(store.performanceData[0]?.networkRequests).toBe(10);
      expect(store.performanceData[0]?.timestamp).toBeDefined();
    });

    it('should limit performance data to 100 entries', () => {
      const store = useChromeDevToolsStore();

      for (let i = 0; i < 105; i++) {
        store.addPerformanceData({
          networkRequests: i,
          consoleErrors: 0,
          consoleWarnings: 0,
          pageLoadTime: 1000,
        });
      }

      expect(store.performanceData.length).toBeLessThanOrEqual(100);
    });

    it('should clear performance data', () => {
      const store = useChromeDevToolsStore();
      store.addPerformanceData({
        networkRequests: 10,
        consoleErrors: 0,
        consoleWarnings: 0,
        pageLoadTime: 1000,
      });

      store.clearPerformanceData();

      expect(store.performanceData).toEqual([]);
    });

    it('should reset connection state', () => {
      const store = useChromeDevToolsStore();
      store.isConnected = true;
      store.isConnecting = true;
      store.connectionError = 'Error';
      store.lastConnectedAt = Date.now();
      store.reconnectAttempts = 5;

      store.resetConnection();

      expect(store.isConnected).toBe(false);
      expect(store.isConnecting).toBe(false);
      expect(store.connectionError).toBeNull();
      expect(store.lastConnectedAt).toBeNull();
      expect(store.reconnectAttempts).toBe(0);
    });

    it('should reset store', () => {
      const store = useChromeDevToolsStore();
      store.isConnected = true;
      store.browserUrl = 'http://127.0.0.1:9222';
      store.debugPort = 9999;
      store.addPerformanceData({
        networkRequests: 10,
        consoleErrors: 0,
        consoleWarnings: 0,
        pageLoadTime: 1000,
      });

      store.reset();

      expect(store.isConnected).toBe(false);
      expect(store.browserUrl).toBeNull();
      expect(store.debugPort).toBe(9222);
      expect(store.performanceData).toEqual([]);
      expect(store.isMonitoring).toBe(false);
    });
  });
});
