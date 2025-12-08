#!/usr/bin/env node
/**
 * Sentry Configuration Checker
 *
 * Validates Sentry configuration and provides helpful feedback.
 *
 * Usage:
 *   node scripts/sentry/check-config.js
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.sentry') });
dotenv.config();

// Support both naming conventions
const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ORG = process.env.SENTRY_ORG || process.env.SENTRY_ORG_SLUG;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || process.env.SENTRY_PROJECT_SLUG;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || process.env.SENTRY_ACCESS_TOKEN;

function checkDsn() {
  console.log('🔍 Checking SENTRY_DSN...');

  if (!SENTRY_DSN) {
    console.log('   ❌ SENTRY_DSN is not set');
    console.log('   💡 Set it in .env.sentry file');
    return false;
  }

  if (SENTRY_DSN.includes('your-dsn') || SENTRY_DSN.includes('your-project-id')) {
    console.log('   ⚠️  SENTRY_DSN appears to be a placeholder');
    console.log('   💡 Replace with your actual Sentry DSN');
    return false;
  }

  if (!SENTRY_DSN.startsWith('https://')) {
    console.log('   ⚠️  SENTRY_DSN format looks incorrect');
    console.log('   💡 DSN should start with https://');
    return false;
  }

  console.log('   ✅ SENTRY_DSN is configured');
  return true;
}

function checkOrgAndProject() {
  console.log('\n🔍 Checking organization and project...');

  let allGood = true;

  if (!SENTRY_ORG) {
    console.log('   ⚠️  SENTRY_ORG is not set (optional, needed for source maps)');
    allGood = false;
  } else {
    console.log(`   ✅ SENTRY_ORG: ${SENTRY_ORG}`);
  }

  if (!SENTRY_PROJECT) {
    console.log('   ⚠️  SENTRY_PROJECT is not set (optional, needed for source maps)');
    allGood = false;
  } else {
    console.log(`   ✅ SENTRY_PROJECT: ${SENTRY_PROJECT}`);
  }

  return allGood;
}

function checkEnvironment() {
  console.log(`\n🔍 Checking environment...`);
  console.log(`   ✅ Environment: ${SENTRY_ENVIRONMENT}`);
  return true;
}

function checkAuthToken() {
  console.log('\n🔍 Checking auth token...');

  if (!SENTRY_AUTH_TOKEN) {
    console.log('   ⚠️  SENTRY_AUTH_TOKEN is not set (optional, needed for source maps upload)');
    console.log('   💡 You can also use .sentryclirc file');
    return false;
  }

  console.log('   ✅ SENTRY_AUTH_TOKEN is set');
  return true;
}

function checkConfigFiles() {
  console.log('\n🔍 Checking configuration files...');

  const files = {
    'sentry.client.config.ts': path.join(process.cwd(), 'sentry.client.config.ts'),
    'sentry.server.config.ts': path.join(process.cwd(), 'sentry.server.config.ts'),
    '.env.sentry': path.join(process.cwd(), '.env.sentry'),
    '.env.sentry.example': path.join(process.cwd(), '.env.sentry.example'),
  };

  let allGood = true;

  for (const [name, filePath] of Object.entries(files)) {
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${name} exists`);
    } else {
      if (name === '.env.sentry') {
        console.log(`   ⚠️  ${name} not found (create from .env.sentry.example)`);
      } else {
        console.log(`   ❌ ${name} not found`);
        allGood = false;
      }
    }
  }

  return allGood;
}

function checkNuxtConfig() {
  console.log('\n🔍 Checking nuxt.config.ts...');

  const nuxtConfigPath = path.join(process.cwd(), 'nuxt.config.ts');

  if (!fs.existsSync(nuxtConfigPath)) {
    console.log('   ❌ nuxt.config.ts not found');
    return false;
  }

  const content = fs.readFileSync(nuxtConfigPath, 'utf8');

  if (content.includes('@sentry/nuxt')) {
    console.log('   ✅ @sentry/nuxt module is configured');
    return true;
  } else {
    console.log('   ❌ @sentry/nuxt module not found in modules array');
    return false;
  }
}

function provideRecommendations() {
  console.log('\n💡 Recommendations:');

  if (!SENTRY_DSN || SENTRY_DSN.includes('your-dsn')) {
    console.log('   1. Set SENTRY_DSN in .env.sentry file');
    console.log('   2. Get your DSN from: https://sentry.io/settings/');
  }

  if (!SENTRY_ORG || !SENTRY_PROJECT) {
    console.log('   3. Set SENTRY_ORG and SENTRY_PROJECT for source maps upload');
  }

  if (!SENTRY_AUTH_TOKEN) {
    console.log('   4. Set SENTRY_AUTH_TOKEN for source maps upload');
    console.log('      Get token from: https://sentry.io/settings/account/api/auth-tokens/');
  }

  console.log('\n📚 Documentation: docs/SENTRY_NEXT_STEPS.md');
}

// Main execution
console.log('🔍 Sentry Configuration Checker\n');
console.log('='.repeat(50));

const results = {
  dsn: checkDsn(),
  orgProject: checkOrgAndProject(),
  environment: checkEnvironment(),
  authToken: checkAuthToken(),
  configFiles: checkConfigFiles(),
  nuxtConfig: checkNuxtConfig(),
};

console.log(`\n${'='.repeat(50)}`);
console.log('\n📊 Summary:');

const allChecks = Object.values(results);
const passed = allChecks.filter(Boolean).length;
const total = allChecks.length;

console.log(`   ✅ Passed: ${passed}/${total}`);

if (passed === total) {
  console.log('\n🎉 All checks passed! Sentry is properly configured.');
} else {
  console.log('\n⚠️  Some checks failed. See recommendations below.');
  provideRecommendations();
  process.exit(1);
}
