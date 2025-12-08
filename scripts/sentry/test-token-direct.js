#!/usr/bin/env node
/**
 * Test Sentry Token Directly
 * Tests the token with known org/project
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
const project = process.env.SENTRY_PROJECT || process.env.SENTRY_PROJECT_SLUG || 'matlab';

console.log('🔍 Testing Sentry Token Directly\n');
console.log('='.repeat(60));
console.log(`Token: ${token ? `${token.substring(0, 20)}...` : 'NOT FOUND'}`);
console.log(`Org: ${org}`);
console.log(`Project: ${project}`);
console.log('='.repeat(60));
console.log('');

if (!token) {
  console.error('❌ No token found');
  process.exit(1);
}

// Test 1: Test project access directly
console.log('📋 Test 1: Testing project access...');
try {
  const url = `https://sentry.io/api/0/projects/${org}/${project}/issues/?limit=1`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log(`   Status: ${response.status} ${response.statusText}`);

  if (response.ok) {
    const data = await response.json();
    console.log(`   ✅ SUCCESS! Project is accessible`);
    console.log(`   Found ${data.length} issues (showing first 1)`);
    if (data.length > 0) {
      console.log(`   Sample issue: ${data[0].title?.substring(0, 50)}...`);
    }
    console.log('');
    console.log('✅ Configuration is working!');
    console.log(`   Org: ${org}`);
    console.log(`   Project: ${project}`);
    console.log('');
    console.log('You can now run:');
    console.log('   npm run sentry:issues');
    process.exit(0);
  } else {
    const errorText = await response.text();
    console.log(`   ❌ Failed: ${response.status}`);
    console.log(`   Error: ${errorText.substring(0, 200)}`);

    if (response.status === 404) {
      console.log('');
      console.log('💡 The project might not exist or the slug is wrong.');
      console.log('   Try running: npm run sentry:fix-config');
      console.log('   This will discover the correct org/project.');
    }
  }
} catch (error) {
  console.error(`   ❌ Error: ${error.message}`);
}

// Test 2: Try organizations endpoint
console.log('');
console.log('📋 Test 2: Testing organizations endpoint...');
try {
  const response = await fetch('https://sentry.io/api/0/organizations/', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log(`   Status: ${response.status} ${response.statusText}`);

  if (response.ok) {
    const data = await response.json();
    console.log(`   ✅ Organizations endpoint accessible`);
    console.log(`   Found ${data.length} organization(s)`);
    if (data.length > 0) {
      data.forEach((org, i) => {
        console.log(`   ${i + 1}. ${org.slug} (${org.name})`);
      });
    } else {
      console.log('   ⚠ Empty response - token might have limited scopes');
    }
  } else {
    const errorText = await response.text();
    console.log(`   ❌ Failed: ${response.status}`);
    console.log(`   Error: ${errorText.substring(0, 200)}`);
  }
} catch (error) {
  console.error(`   ❌ Error: ${error.message}`);
}

console.log('');
