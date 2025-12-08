#!/usr/bin/env node
// tools/run-eslint-mcp-fallback.js
// Run local ESLint matching the requested MCP configuration if MCP tool is not available.
// - timeoutMs (per attempt)
// - retryAttempts
// - retryDelayMs
// - cacheEnabled
// - cacheTTLms
// - logLevel

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const config = {
  timeoutMs: parseInt(process.env.ESLINT_TIMEOUT_MS || '30000', 10),
  retryAttempts: parseInt(process.env.ESLINT_RETRY_ATTEMPTS || '3', 10),
  retryDelayMs: parseInt(process.env.ESLINT_RETRY_DELAY_MS || '1000', 10),
  cacheEnabled: (process.env.ESLINT_CACHE_ENABLED || 'true') === 'true',
  cacheTTLms: parseInt(process.env.ESLINT_CACHE_TTL_MS || '300000', 10),
  logLevel: process.env.ESLINT_LOG_LEVEL || 'info',
  pattern: process.env.ESLINT_PATTERN || '"**/*.{js,ts,jsx,tsx}"',
  cwd: process.cwd(),
  cacheLocation: process.env.ESLINT_CACHE_LOCATION || '.eslintcache',
};

const CACHE_FILE = path.resolve(config.cwd, config.cacheLocation);

function log(level, msg) {
  const levels = ['error', 'warn', 'info', 'debug'];
  if (levels.indexOf(level) <= levels.indexOf(config.logLevel)) {
    console.log(`[${level}] ${msg}`);
  }
}

function isCacheExpired() {
  try {
    const stat = fs.statSync(CACHE_FILE);
    const age = Date.now() - stat.mtimeMs;
    return age > config.cacheTTLms;
  } catch (_err) {
    return true; // no cache means treat it as expired
  }
}

function cleanupCacheIfExpired() {
  if (!config.cacheEnabled) return;
  if (fs.existsSync(CACHE_FILE) && isCacheExpired()) {
    try {
      fs.unlinkSync(CACHE_FILE);
      log('info', `Deleted expired ESLint cache ${CACHE_FILE}`);
    } catch (e) {
      log('warn', `Could not delete cache: ${e.message}`);
    }
  }
}

function sanitizePath(path) {
  // Remove any characters that could be used for command injection
  // Only allow alphanumeric, dots, hyphens, underscores, and forward slashes
  if (typeof path !== 'string') {
    throw new Error('Path must be a string');
  }
  const sanitized = path.replace(/[^a-zA-Z0-9.\-_/]/g, '');
  if (sanitized !== path) {
    throw new Error(`Invalid characters in cache location: ${path}`);
  }
  // Prevent path traversal
  if (sanitized.includes('..')) {
    throw new Error(`Path traversal detected in cache location: ${path}`);
  }
  return sanitized;
}

function runAttempt(attemptNumber) {
  return new Promise((resolve) => {
    cleanupCacheIfExpired();

    // Build command safely using array format to prevent injection
    const cmdArgs = ['npx', 'eslint', '.', '--ext', '.js,.ts,.jsx,.tsx', '--format', 'json'];

    if (config.cacheEnabled) {
      // Sanitize cache location to prevent command injection
      try {
        const safeCacheLocation = sanitizePath(config.cacheLocation);
        cmdArgs.push('--cache', '--cache-location', safeCacheLocation);
      } catch (error) {
        log('warn', `Invalid cache location, disabling cache: ${error.message}`);
        // Continue without cache if location is invalid
      }
    }

    const cmd = cmdArgs.join(' ');
    log('info', `Running ESLint (attempt ${attemptNumber}): ${cmd}`);

    const proc = exec(
      cmd,
      { cwd: config.cwd, timeout: config.timeoutMs, maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        // eslint-cli returns non-zero when errors exist, but it still writes JSON to stdout.
        if (stdout) {
          try {
            const json = JSON.parse(stdout);
            resolve({ success: true, stdout, stderr, json });
            return;
          } catch (parseError) {
            // parse error - fall through to failing
            resolve({
              success: false,
              error: 'JSON_PARSE_ERROR',
              stderr: `${stderr}\n${parseError.message || ''}`,
              stdout,
            });
            return;
          }
        }

        // No stdout (maybe an error), return failure, but include stderr
        resolve({ success: false, error: 'NO_STDOUT', stderr, stdout });
      }
    );

    // If the process times out, 'exec' will kill it and report error
    proc.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

async function runWithRetries() {
  log('info', `ESLint MCP fallback runner starting with config: ${JSON.stringify(config)}`);

  let lastResult;
  for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
    lastResult = await runAttempt(attempt);
    if (lastResult && lastResult.success) {
      log('info', `ESLint run successful on attempt ${attempt}`);
      break;
    }

    log(
      'warn',
      `ESLint attempt ${attempt} failed: ${lastResult && (lastResult.error || lastResult.stderr || 'unknown')}`
    );
    if (attempt < config.retryAttempts) {
      log('info', `Retrying in ${config.retryDelayMs}ms...`);
      await new Promise((r) => setTimeout(r, config.retryDelayMs));
    }
  }

  if (!lastResult || !lastResult.success) {
    console.error(
      JSON.stringify(
        { success: false, error: 'ESLINT_FAILED_ALL_ATTEMPTS', details: lastResult },
        null,
        2
      )
    );
    process.exit(2);
    return;
  }

  const json = lastResult.json;
  // Build summary
  const filesScanned = json.length;
  let errors = 0;
  let warnings = 0;
  const topIssues = [];

  json.forEach((file) => {
    file.messages.forEach((msg) => {
      if (msg.severity === 2) errors++;
      if (msg.severity === 1) warnings++;
      topIssues.push({
        file: file.filePath,
        line: msg.line,
        column: msg.column,
        ruleId: msg.ruleId,
        severity: msg.severity === 2 ? 'error' : 'warning',
        message: msg.message,
      });
    });
  });

  const sortedIssues = topIssues.sort((a, b) => {
    // errors first, then warnings; then sort by file then line
    if (a.severity !== b.severity) return a.severity === 'error' ? -1 : 1;
    if (a.file !== b.file) return a.file < b.file ? -1 : 1;
    if (a.line !== b.line) return a.line - b.line;
    return a.column - b.column;
  });

  const topN = sortedIssues.slice(0, 50);

  const result = {
    success: true,
    rawResults: lastResult.stdout,
    summary: { errors, warnings, filesScanned },
    topIssues: topN,
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

// Execute when invoked as script
if (process.argv[1] && process.argv[1].endsWith('run-eslint-mcp-fallback.js')) {
  // Node will exit in the function; handle top-level rejection
  runWithRetries().catch((err) => {
    console.error(
      JSON.stringify(
        { success: false, error: err && err.message ? err.message : String(err) },
        null,
        2
      )
    );
    process.exit(3);
  });
}
