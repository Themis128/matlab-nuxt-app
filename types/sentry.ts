/**
 * Shared Sentry Type Definitions
 * Centralized types for Sentry integration across the application
 */

/**
 * Sentry issue interface
 * Represents an error/issue tracked in Sentry
 */
export interface SentryIssue {
  id: string;
  title: string;
  culprit?: string;
  level: 'error' | 'warning' | 'info' | 'fatal' | 'debug';
  status: 'unresolved' | 'resolved' | 'ignored';
  count: number;
  userCount?: number;
  firstSeen: string;
  lastSeen: string;
  permalink?: string;
  url?: string;
}

/**
 * Sentry error interface
 * Represents a single error event
 */
export interface SentryError {
  id: string;
  message: string;
  type: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  timestamp: number;
  context?: Record<string, any>;
  resolved?: boolean;
}

/**
 * Sentry release interface
 */
export interface SentryRelease {
  version: string;
  dateCreated: string;
  dateReleased: string | null;
  url: string;
  newIssues: number;
  resolvedIssues: number;
}

/**
 * Sentry statistics interface
 */
export interface SentryStats {
  totalIssues: number;
  unresolvedIssues: number;
  resolvedIssues: number;
  ignoredIssues?: number;
  totalEvents?: number;
  uniqueUsers?: number;
  errors24h?: number;
  errors7d?: number;
}
