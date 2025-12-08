#!/usr/bin/env node
/**
 * Discover Sentry Project Name
 * Tests common project name variations
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.sentry') });
dotenv.config();

function getToken() {
  try {
    const content = readFileSync('.sentryclirc', 'utf8');
    const match = content.match(/token=(.+)/);
    if (match) return match[1].trim();
  } catch (_e) {}
  return process.env.SENTRY_AUTH_TOKEN || process.env.SENTRY_ACCESS_TOKEN;
}

const token = getToken();
const org = process.env.SENTRY_ORG || process.env.SENTRY_ORG_SLUG || 'baltzakisthemiscom';

// Common project name variations to try
const projectNames = [
  'matlab-app',
  'matlab',
  'nuxt',
  'nuxt-app',
  'matlab-nuxt-app',
  'matlab-nuxt',
  'app',
  'web',
  'frontend',
];

console.log('🔍 Discovering Sentry Project Name\n');
console.log(`Org: ${org}`);
console.log(`Testing ${projectNames.length} project name variations...\n`);

if (!token) {
  console.error('❌ No token found');
  process.exit(1);
}

let foundProject = null;

for (const project of projectNames) {
  try {
    const url = `https://sentry.io/api/0/projects/${org}/${project}/issues/?limit=1`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      foundProject = project;
      const data = await response.json();
      console.log(`✅ FOUND! Project: ${project}`);
      console.log(`   Status: ${response.status} OK`);
      console.log(`   Issues found: ${data.length}`);
      console.log('');
      console.log('✅ Configuration is correct!');
      console.log(`   Org: ${org}`);
      console.log(`   Project: ${project}`);
      console.log('');
      console.log('Update your .env.sentry:');
      console.log(`   SENTRY_PROJECT=${project}`);
      console.log(`   SENTRY_PROJECT_SLUG=${project}`);
      console.log('');
      console.log('Or update .sentryclirc:');
      console.log(`   project=${project}`);
      console.log('');
      break;
    } else if (response.status === 404) {
      // Project doesn't exist, try next
      process.stdout.write(`   ✗ ${project} (not found)\n`);
    } else {
      process.stdout.write(`   ⚠ ${project} (${response.status})\n`);
    }
  } catch (error) {
    process.stdout.write(`   ❌ ${project} (error: ${error.message})\n`);
  }
}

if (!foundProject) {
  console.log('');
  console.log('❌ Could not find project with any of the tested names');
  console.log('');
  console.log('Next steps:');
  console.log('1. Check your Sentry dashboard: https://sentry.io/');
  console.log('2. Find your project slug in the URL');
  console.log('3. Update .env.sentry with:');
  console.log('   SENTRY_PROJECT=YOUR_PROJECT_SLUG');
  console.log('');
  console.log('Or run: npm run sentry:fix-config');
  console.log('(This will try to discover it automatically)');
  process.exit(1);
}
