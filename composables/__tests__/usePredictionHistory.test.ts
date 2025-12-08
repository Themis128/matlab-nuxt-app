import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to ensure import.meta.client is set before any imports
const { mockSentryLogger, localStorageMock } = vi.hoisted(() => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock useSentryLogger
  const mockSentryLogger = {
    warn: vi.fn(),
    logError: vi.fn(),
  };

  // Set import.meta.client BEFORE any module evaluation
  Object.defineProperty(import.meta, 'client', {
    value: true,
    writable: true,
    configurable: true,
  });

  return { mockSentryLogger, localStorageMock };
});

vi.mock('~/composables/useSentryLogger', () => ({
  useSentryLogger: () => mockSentryLogger,
}));

// Stub globally for auto-imports
vi.stubGlobal('useSentryLogger', () => mockSentryLogger);

// Import composable AFTER hoisted setup
import { usePredictionHistory } from '../usePredictionHistory';

describe('usePredictionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Ensure import.meta.client is true for all tests
    Object.defineProperty(import.meta, 'client', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty history when no data stored', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const history = usePredictionHistory();

    expect(history.getHistory()).toEqual([]);
  });

  it('should return empty history on server-side', () => {
    Object.defineProperty(import.meta, 'client', {
      value: false,
      writable: true,
      configurable: true,
    });

    const history = usePredictionHistory();
    expect(history.getHistory()).toEqual([]);

    // Restore
    Object.defineProperty(import.meta, 'client', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  it('should load valid history from localStorage', () => {
    const validHistory = [
      {
        id: '1',
        timestamp: Date.now(),
        model: 'price',
        input: { brand: 'Apple' },
        result: 999,
        predictionTime: 100,
        source: 'api',
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(validHistory));

    const history = usePredictionHistory();
    const result = history.getHistory();

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('1');
  });

  it('should filter invalid history items', () => {
    const invalidHistory = [
      {
        id: '1',
        timestamp: Date.now(),
        model: 'price',
        input: {},
        result: 999,
        predictionTime: 100,
        source: 'api',
      },
      { invalid: 'data' },
      null,
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidHistory));

    const history = usePredictionHistory();
    const result = history.getHistory();

    expect(result).toHaveLength(1);
    expect(mockSentryLogger.warn).toHaveBeenCalled();
  });

  it('should save prediction to history', () => {
    const history = usePredictionHistory();
    history.savePrediction({
      model: 'price',
      input: { brand: 'Apple' },
      result: 999,
      predictionTime: 100,
      source: 'api',
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const callArgs = localStorageMock.setItem.mock.calls[0]!;
    const savedData = JSON.parse(callArgs[1]);
    expect(savedData).toHaveLength(1);
    expect(savedData[0].model).toBe('price');
    expect(savedData[0].id).toBeDefined();
    expect(savedData[0].timestamp).toBeDefined();
  });

  it('should limit history to MAX_HISTORY items', () => {
    const existingHistory = Array.from({ length: 60 }, (_, i) => ({
      id: `${i}`,
      timestamp: Date.now() - i * 1000,
      model: 'price',
      input: {},
      result: 999,
      predictionTime: 100,
      source: 'api',
    }));
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));

    const history = usePredictionHistory();
    history.savePrediction({
      model: 'price',
      input: {},
      result: 999,
      predictionTime: 100,
      source: 'api',
    });

    const callArgs = localStorageMock.setItem.mock.calls[0]!;
    const savedData = JSON.parse(callArgs[1]);
    expect(savedData.length).toBeLessThanOrEqual(50);
  });

  it('should get history by model', () => {
    const mixedHistory = [
      {
        id: '1',
        timestamp: Date.now(),
        model: 'price',
        input: {},
        result: 999,
        predictionTime: 100,
        source: 'api',
      },
      {
        id: '2',
        timestamp: Date.now(),
        model: 'ram',
        input: {},
        result: 8,
        predictionTime: 100,
        source: 'api',
      },
      {
        id: '3',
        timestamp: Date.now(),
        model: 'price',
        input: {},
        result: 899,
        predictionTime: 100,
        source: 'api',
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mixedHistory));

    const history = usePredictionHistory();
    const priceHistory = history.getHistoryByModel('price');

    expect(priceHistory).toHaveLength(2);
    expect(priceHistory.every((item) => item.model === 'price')).toBe(true);
  });

  it('should get history by date range', () => {
    const now = Date.now();
    const historyData = [
      {
        id: '1',
        timestamp: now - 2000,
        model: 'price',
        input: {},
        result: 999,
        predictionTime: 100,
        source: 'api',
      },
      {
        id: '2',
        timestamp: now - 1000,
        model: 'price',
        input: {},
        result: 899,
        predictionTime: 100,
        source: 'api',
      },
      {
        id: '3',
        timestamp: now + 1000,
        model: 'price',
        input: {},
        result: 799,
        predictionTime: 100,
        source: 'api',
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(historyData));

    const history = usePredictionHistory();
    const filtered = history.getHistoryByDateRange(now - 1500, now + 500);

    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe('2');
  });

  it('should get history by company', () => {
    const historyData = [
      {
        id: '1',
        timestamp: Date.now(),
        model: 'price',
        input: { company: 'Apple' },
        result: 999,
        predictionTime: 100,
        source: 'api',
      },
      {
        id: '2',
        timestamp: Date.now(),
        model: 'price',
        input: { company: 'Samsung' },
        result: 899,
        predictionTime: 100,
        source: 'api',
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(historyData));

    const history = usePredictionHistory();
    const appleHistory = history.getHistoryByCompany('Apple');

    expect(appleHistory).toHaveLength(1);
    expect(appleHistory[0]!.input.company).toBe('Apple');
  });

  it('should clear history', () => {
    const history = usePredictionHistory();
    history.clearHistory();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('mobile-prediction-history');
  });

  it('should export history as JSON', () => {
    const historyData = [
      {
        id: '1',
        timestamp: Date.now(),
        model: 'price',
        input: {},
        result: 999,
        predictionTime: 100,
        source: 'api',
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(historyData));

    const history = usePredictionHistory();
    const exported = history.exportHistory();

    expect(exported).toBe(JSON.stringify(historyData, null, 2));
  });

  it('should get storage info', () => {
    const historyData = [
      {
        id: '1',
        timestamp: Date.now(),
        model: 'price',
        input: {},
        result: 999,
        predictionTime: 100,
        source: 'api',
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(historyData));

    const history = usePredictionHistory();
    const info = history.getStorageInfo();

    expect(info.count).toBe(1);
    expect(info.size).toBeGreaterThan(0);
    expect(info.lastUpdated).toBeDefined();
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const history = usePredictionHistory();
    const result = history.getHistory();

    expect(result).toEqual([]);
    expect(mockSentryLogger.warn).toHaveBeenCalled();
  });

  it('should handle save errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const history = usePredictionHistory();
    history.savePrediction({
      model: 'price',
      input: {},
      result: 999,
      predictionTime: 100,
      source: 'api',
    });

    expect(mockSentryLogger.logError).toHaveBeenCalled();
  });
});
