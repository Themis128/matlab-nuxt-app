#!/usr/bin/env node
/**
 * Sentry Release Creator
 *
 * Creates a new release in Sentry and optionally associates commits.
 *
 * Usage:
 *   node scripts/sentry/create-release.js [version]
 *
 * Environment variables:
 *   SENTRY_ORG - Your Sentry organization slug
 *   SENTRY_PROJECT - Your Sentry project name
 *   SENTRY_AUTH_TOKEN - Your Sentry auth token
 *   SENTRY_RELEASE - Release version (or pass as argument)
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.sentry') });
dotenv.config();

// Support both naming conventions
const SENTRY_ORG = process.env.SENTRY_ORG || process.env.SENTRY_ORG_SLUG || 'baltzakisthemiscom';
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || process.env.SENTRY_PROJECT_SLUG || 'matlab';
const SENTRY_RELEASE = process.argv[2] || process.env.SENTRY_RELEASE || getPackageVersion();

function getPackageVersion() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );
    return packageJson.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

/**
 * Sanitize input to prevent command injection
 * Only allows alphanumeric, dash, underscore, dot, and slash characters
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  // Remove any characters that could be used for command injection
  return input.replace(/[^a-zA-Z0-9._/-]/g, '');
}

function getGitCommit() {
  try {
    // SECURITY: Use execFileSync with array arguments instead of string command
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function createRelease() {
  console.log('🚀 Creating Sentry release...');
  console.log(`📦 Organization: ${SENTRY_ORG}`);
  console.log(`📁 Project: ${SENTRY_PROJECT}`);
  console.log(`🏷️  Release: ${SENTRY_RELEASE}`);
  console.log('');

  try {
    // Sanitize inputs to prevent command injection
    const sanitizedOrg = sanitizeInput(SENTRY_ORG);
    const sanitizedProject = sanitizeInput(SENTRY_PROJECT);
    const sanitizedRelease = sanitizeInput(SENTRY_RELEASE);

    if (!sanitizedOrg || !sanitizedProject || !sanitizedRelease) {
      throw new Error(
        'Invalid input: organization, project, or release contains unsafe characters'
      );
    }

    // Create release
    console.log('📋 Creating release...');
    // SECURITY: Use execFileSync with array arguments instead of string interpolation
    execFileSync(
      'npx',
      [
        'sentry-cli',
        'releases',
        'new',
        '--org',
        sanitizedOrg,
        '--project',
        sanitizedProject,
        sanitizedRelease,
      ],
      { stdio: 'inherit' }
    );
    console.log('✅ Release created');

    // Associate commits (if in git repo)
    const commit = getGitCommit();
    if (commit) {
      console.log(`\n📝 Associating commit ${commit.substring(0, 7)}...`);
      try {
        // SECURITY: Use execFileSync with array arguments instead of string interpolation
        execFileSync(
          'npx',
          [
            'sentry-cli',
            'releases',
            'set-commits',
            '--org',
            sanitizedOrg,
            '--project',
            sanitizedProject,
            sanitizedRelease,
            '--auto',
          ],
          { stdio: 'inherit' }
        );
        console.log('✅ Commits associated');
      } catch (error) {
        console.warn('⚠️  Failed to associate commits:', error.message);
      }
    }

    // Set release in environment
    console.log(
      `\n🔗 Release URL: https://sentry.io/organizations/${sanitizedOrg}/releases/${sanitizedRelease}/`
    );
    console.log(`\n💡 To upload source maps, run: npm run sentry:sourcemaps`);
    console.log(`\n✅ Release ${sanitizedRelease} created successfully!`);
  } catch (error) {
    const sanitizedOrg = sanitizeInput(SENTRY_ORG);
    const sanitizedRelease = sanitizeInput(SENTRY_RELEASE);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Release already exists');
      console.log(
        `🔗 View release: https://sentry.io/organizations/${sanitizedOrg}/releases/${sanitizedRelease}/`
      );
    } else {
      console.error('❌ Failed to create release:', error.message);
      process.exit(1);
    }
  }
}

// Check requirements
if (!SENTRY_ORG || !SENTRY_PROJECT) {
  console.error('❌ SENTRY_ORG and SENTRY_PROJECT must be set');
  console.error('💡 Set them in .env.sentry file');
  process.exit(1);
}

createRelease();
