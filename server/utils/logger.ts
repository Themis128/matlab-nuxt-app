/**
 * Request logging and monitoring utility
 */

export interface LogContext {
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  error?: Error;
  [key: string]: unknown;
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  log(level: LogLevel, message: string, context?: LogContext) {
    if (this.isTest && level === LogLevel.DEBUG) {
      return; // Skip debug logs in tests
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // In development, use console with colors
    if (this.isDevelopment) {
      const colors = {
        DEBUG: '\x1b[36m', // Cyan
        INFO: '\x1b[32m', // Green
        WARN: '\x1b[33m', // Yellow
        ERROR: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      console.log(`${colors[level]}[${level}]${reset} ${message}`, context || '');
      return;
    }

    // In production, use structured logging
    switch (level) {
      case LogLevel.ERROR:
        console.error(JSON.stringify(logEntry));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(logEntry));
        break;
      default:
        console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext) {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log API request
   */
  logRequest(event: any, duration: number, statusCode?: number) {
    const method = event.node?.req?.method || 'UNKNOWN';
    const path = event.node?.req?.url || 'UNKNOWN';
    const ip =
      event.node?.req?.headers?.['x-forwarded-for'] ||
      event.node?.req?.socket?.remoteAddress ||
      'UNKNOWN';
    const userAgent = event.node?.req?.headers?.['user-agent'] || 'UNKNOWN';

    this.info('API Request', {
      method,
      path,
      statusCode: statusCode || 200,
      duration,
      ip,
      userAgent,
    });
  }

  /**
   * Log API error
   */
  logError(message: string, error: Error, context?: LogContext) {
    this.error(message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      },
    });
  }
}

export const logger = new Logger();
