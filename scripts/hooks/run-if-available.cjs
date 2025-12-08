#!/usr/bin/env node
/**
 * Runs a command only if it's available in PATH
 * Usage: node run-if-available.cjs <command> [args...] [files...]
 *
 * lint-staged will append file paths as additional arguments
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { execFileSync, spawnSync } = require('child_process');

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error('Usage: node run-if-available.cjs <command> [args...]');
  process.exit(1);
}

// Sanitize command name to prevent injection
function sanitizeCommand(cmd) {
  // Only allow alphanumeric, dash, underscore, and dot characters
  if (!/^[a-zA-Z0-9._-]+$/.test(cmd)) {
    throw new Error(`Invalid command name: ${cmd}`);
  }
  return cmd;
}

// Check if command is available
function isCommandAvailable(cmd) {
  try {
    const sanitized = sanitizeCommand(cmd);
    if (process.platform === 'win32') {
      execFileSync('where', [sanitized], { stdio: 'ignore' });
    } else {
      execFileSync('command', ['-v', sanitized], { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}

if (!isCommandAvailable(command)) {
  // Silently skip if command not available (lint-staged will continue)
  process.exit(0);
}

// SECURITY: Sanitize command again before use to prevent injection
const sanitizedCommand = sanitizeCommand(command);

// SECURITY: Sanitize args to prevent injection
// Only allow safe characters in arguments (alphanumeric, spaces, common path chars, quotes)
function sanitizeArgs(argList) {
  return argList.map((arg) => {
    // Allow alphanumeric, spaces, common path characters, and quotes
    // Reject anything that looks like command injection attempts
    if (typeof arg !== 'string') return String(arg);
    // Remove any shell metacharacters that could be used for injection
    const dangerous = /[;&|`$(){}[\]<>]/;
    if (dangerous.test(arg)) {
      console.warn(`Warning: Potentially dangerous argument filtered: ${arg}`);
      return arg.replace(dangerous, '');
    }
    return arg;
  });
}

const sanitizedArgs = sanitizeArgs(args);

// Run the command with provided args and files
// Use spawnSync to properly handle file paths with spaces
const result = spawnSync(sanitizedCommand, sanitizedArgs, {
  stdio: 'inherit',
  shell: false,
  windowsVerbatimArguments: false,
});

// Exit with the command's exit code
process.exit(result.status || 0);
