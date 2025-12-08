import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock useSentryUtils
const mockAddBreadcrumb = vi.fn();
const mockCaptureException = vi.fn();
const mockCaptureMessage = vi.fn();
const mockIsSentryAvailable = vi.fn(() => true);
const mockGetSentryInstance = vi.fn(() => ({
  setTag: vi.fn(),
  setExtras: vi.fn(),
}));

vi.mock('../useSentryUtils', () => ({
  addBreadcrumb: (...args: any[]) => mockAddBreadcrumb(...args),
  captureException: (...args: any[]) => mockCaptureException(...args),
  captureMessage: (...args: any[]) => mockCaptureMessage(...args),
  isSentryAvailable: () => mockIsSentryAvailable(),
  getSentryInstance: () => mockGetSentryInstance(),
}));

// Mock console
const mockConsole = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

global.console = mockConsole as any;

// Import after mocks
import { useSentryLogger } from '../useSentryLogger';

describe('useSentryLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all logger methods', () => {
    const logger = useSentryLogger();

    expect(logger).toHaveProperty('trace');
    expect(logger).toHaveProperty('debug');
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('logError');
    expect(logger).toHaveProperty('fatal');
    expect(logger).toHaveProperty('fmt');
    expect(logger).toHaveProperty('printf');
    expect(logger).toHaveProperty('logApiRequest');
    expect(logger).toHaveProperty('logUserAction');
    expect(logger).toHaveProperty('logPerformance');
    expect(logger).toHaveProperty('logBusinessEvent');
    expect(logger).toHaveProperty('startSession');
    expect(logger).toHaveProperty('endSession');
  });

  describe('core logging methods', () => {
    it('should log debug message', () => {
      const logger = useSentryLogger();
      logger.debug('Debug message', { component: 'test' });

      expect(mockCaptureMessage).toHaveBeenCalledWith('Debug message', 'debug', {
        component: 'test',
      });
      expect(mockAddBreadcrumb).toHaveBeenCalled();
    });

    it('should log info message', () => {
      const logger = useSentryLogger();
      logger.info('Info message', { component: 'test' });

      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockCaptureMessage).toHaveBeenCalledWith('Info message', 'info', {
        component: 'test',
      });
    });

    it('should log warning message', () => {
      const logger = useSentryLogger();
      logger.warn('Warning message', { component: 'test' });

      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockCaptureMessage).toHaveBeenCalledWith('Warning message', 'warning', {
        component: 'test',
      });
    });

    it('should log error with Error object', () => {
      const logger = useSentryLogger();
      const error = new Error('Test error');
      logger.logError('Error message', error, { component: 'test' });

      expect(mockConsole.error).toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalled();
    });

    it('should log error without Error object', () => {
      const logger = useSentryLogger();
      logger.logError('Error message', undefined, { component: 'test' });

      expect(mockCaptureMessage).toHaveBeenCalledWith('Error message', 'error', {
        component: 'test',
      });
    });

    it('should log fatal error', () => {
      const logger = useSentryLogger();
      const error = new Error('Fatal error');
      logger.fatal('Fatal message', error, { component: 'test' });

      expect(mockConsole.error).toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalled();
    });

    it('should trace message (calls debug)', () => {
      const logger = useSentryLogger();
      logger.trace('Trace message');

      expect(mockCaptureMessage).toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    it('should format message with template', () => {
      const logger = useSentryLogger();
      const result = logger.fmt('Hello ${0}, you have ${1} messages', 'John', 5);

      expect(result).toBe('Hello John, you have 5 messages');
    });

    it('should format printf-style message', () => {
      const logger = useSentryLogger();
      const result = logger.printf('Hello %s, count: %d', 'World', 42);

      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
  });

  describe('specialized loggers', () => {
    it('should log API request', () => {
      const logger = useSentryLogger();
      logger.logApiRequest('GET', '/api/test', 200, 100, { component: 'api' });

      expect(mockConsole.info).toHaveBeenCalled();
    });

    it('should log API error (status >= 400)', () => {
      const logger = useSentryLogger();
      logger.logApiRequest('GET', '/api/test', 404, 50);

      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should log slow API request (duration > 5000)', () => {
      const logger = useSentryLogger();
      logger.logApiRequest('GET', '/api/test', 200, 6000);

      expect(mockConsole.warn).toHaveBeenCalled();
    });

    it('should log user action', () => {
      const logger = useSentryLogger();
      logger.logUserAction('click', { button: 'submit' }, { userId: '123' });

      expect(mockConsole.info).toHaveBeenCalled();
    });

    it('should log performance metric', () => {
      const logger = useSentryLogger();
      logger.logPerformance('load_time', 100, 'ms', { page: '/test' });

      expect(mockConsole.info).toHaveBeenCalled();
    });

    it('should log business event', () => {
      const logger = useSentryLogger();
      logger.logBusinessEvent('purchase', { amount: 100 }, { userId: '123' });

      expect(mockConsole.info).toHaveBeenCalled();
    });
  });

  describe('session management', () => {
    it('should start session', () => {
      const logger = useSentryLogger();
      logger.startSession('session-123', { userId: 'user-1' });

      expect(mockConsole.info).toHaveBeenCalled();
      const sentry = mockGetSentryInstance();
      expect(sentry.setTag).toHaveBeenCalledWith('session_id', 'session-123');
    });

    it('should end session', () => {
      const logger = useSentryLogger();
      logger.endSession('session-123', { userId: 'user-1' });

      expect(mockConsole.info).toHaveBeenCalled();
      const sentry = mockGetSentryInstance();
      expect(sentry.setTag).toHaveBeenCalledWith('session_id', undefined);
    });

    it('should handle Sentry unavailable gracefully', () => {
      mockIsSentryAvailable.mockReturnValue(false);
      const logger = useSentryLogger();

      expect(() => logger.startSession('session-123')).not.toThrow();
    });
  });
});
