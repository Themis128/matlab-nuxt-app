#!/usr/bin/env node
/**
 * Sentry Source Maps Upload Script
 *
 * Uploads source maps to Sentry for better error tracking in production.
 *
 * Usage:
 *   node scripts/sentry/upload-sourcemaps.js
 *
 * Environment variables:
 *   SENTRY_ORG - Your Sentry organization slug
 *   SENTRY_PROJECT - Your Sentry project name
 *   SENTRY_AUTH_TOKEN - Your Sentry auth token (optional, can use .sentryclirc)
 *   SENTRY_RELEASE - Release version (defaults to package.json version)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.sentry') });
dotenv.config();

// Support both naming conventions
const SENTRY_ORG = process.env.SENTRY_ORG || process.env.SENTRY_ORG_SLUG || 'baltzakisthemiscom';
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || process.env.SENTRY_PROJECT_SLUG || 'matlab';
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || getPackageVersion();

// Paths
const OUTPUT_DIR = path.join(process.cwd(), '.output', 'public');
const SOURCEMAP_DIR = OUTPUT_DIR;

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

function checkRequirements() {
  const errors = [];

  if (!SENTRY_ORG) {
    errors.push('SENTRY_ORG is not set');
  }

  if (!SENTRY_PROJECT) {
    errors.push('SENTRY_PROJECT is not set');
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    errors.push(`Output directory not found: ${OUTPUT_DIR}`);
    errors.push('Please run "npm run build" first');
  }

  return errors;
}

/**
 * Sanitize input to prevent command injection
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Allow only alphanumeric, hyphens, underscores, dots, and forward slashes
  const sanitized = input.replace(/[^a-zA-Z0-9\-_.\/]/g, '');

  if (sanitized !== input) {
    throw new Error(`Invalid characters in input: ${input}`);
  }

  return sanitized;
}

/**
 * Validate and sanitize environment variables
 */
function validateEnvironment() {
  try {
    const sanitizedOrg = sanitizeInput(SENTRY_ORG);
    const sanitizedProject = sanitizeInput(SENTRY_PROJECT);
    const sanitizedRelease = sanitizeInput(SENTRY_RELEASE);

    return {
      org: sanitizedOrg,
      project: sanitizedProject,
      release: sanitizedRelease,
    };
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    console.error(
      '   Ensure SENTRY_ORG, SENTRY_PROJECT, and SENTRY_RELEASE contain only safe characters'
    );
    process.exit(1);
  }
}

function uploadSourceMaps() {
  console.log('🚀 Starting Sentry source maps upload...');

  // Validate and sanitize environment variables
  const env = validateEnvironment();

  console.log(`📦 Organization: ${env.org}`);
  console.log(`📁 Project: ${env.project}`);
  console.log(`🏷️  Release: ${env.release}`);
  console.log(`📂 Source directory: ${SOURCEMAP_DIR}`);
  console.log('');

  try {
    // Step 1: Inject source maps (if needed)
    console.log('📝 Injecting source maps...');
    try {
      execSync('npx sentry-cli sourcemaps inject', {
        stdio: 'inherit',
        env: {
          ...process.env,
          SENTRY_ORG: env.org,
          SENTRY_PROJECT: env.project,
        },
        cwd: SOURCEMAP_DIR,
      });
      console.log('✅ Source maps injected\n');
    } catch (error) {
      console.warn('⚠️  Source maps injection failed (may already be injected):', error.message);
    }

    // Step 2: Upload source maps
    console.log('📤 Uploading source maps to Sentry...');
    execSync('npx sentry-cli sourcemaps upload .', {
      stdio: 'inherit',
      env: {
        ...process.env,
        SENTRY_ORG: env.org,
        SENTRY_PROJECT: env.project,
        SENTRY_RELEASE: env.release,
      },
      cwd: SOURCEMAP_DIR,
    });
    console.log('✅ Source maps uploaded successfully!');
    console.log(
      `\n🔗 View release: https://sentry.io/organizations/${env.org}/releases/${env.release}/`
    );

    // Step 3: Create release (if it doesn't exist)
    console.log(`\n📋 Creating release ${env.release}...`);
    try {
      execSync('npx sentry-cli releases new', {
        stdio: 'inherit',
        env: {
          ...process.env,
          SENTRY_ORG: env.org,
          SENTRY_PROJECT: env.project,
          SENTRY_RELEASE: env.release,
        },
      });
      console.log('✅ Release created');
    } catch (_error) {
      // Release might already exist, that's okay
      console.log('ℹ️  Release already exists or creation skipped');
    }

    // Step 4: Finalize release
    console.log(`\n✅ Finalizing release ${env.release}...`);
    try {
      execSync('npx sentry-cli releases finalize', {
        stdio: 'inherit',
        env: {
          ...process.env,
          SENTRY_ORG: env.org,
          SENTRY_PROJECT: env.project,
          SENTRY_RELEASE: env.release,
        },
      });
      console.log('✅ Release finalized');
    } catch (error) {
      console.warn('⚠️  Release finalization failed:', error.message);
    }

    console.log('\n🎉 Source maps upload complete!');
  } catch (error) {
    console.error('\n❌ Failed to upload source maps:', error.message);
    process.exit(1);
  }
}

// Main execution
const errors = checkRequirements();
if (errors.length > 0) {
  console.error('❌ Missing requirements:');
  errors.forEach((error) => console.error(`   - ${error}`));
  console.error('\n💡 Set environment variables in .env.sentry or .env file');
  process.exit(1);
}

uploadSourceMaps();
