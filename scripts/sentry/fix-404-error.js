#!/usr/bin/env node
/**
 * Fix Sentry API 404 Error
 *
 * This script programmatically fixes the 404 error by:
 * 1. Discovering available organizations and projects
 * 2. Testing access to each project
 * 3. Updating configuration with working org/project
 */

import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.sentry') });
dotenv.config();

/**
 * Get token from various sources
 */
function getToken() {
  // Try .sentryclirc first
  if (existsSync('.sentryclirc')) {
    try {
      const content = readFileSync('.sentryclirc', 'utf8');
      const match = content.match(/token=(.+)/);
      if (match) {
        return match[1].trim();
      }
    } catch (_e) {
      // Ignore
    }
  }

  // Try environment variables
  return process.env.SENTRY_AUTH_TOKEN || process.env.SENTRY_ACCESS_TOKEN;
}

const token = getToken();

if (!token) {
  console.error('❌ No Sentry auth token found');
  console.error('\nPlease provide a token:');
  console.error('1. Set SENTRY_AUTH_TOKEN in .env.sentry');
  console.error('2. Or add token to .sentryclirc:');
  console.error('   [auth]');
  console.error('   token=YOUR_TOKEN');
  process.exit(1);
}

/**
 * Make API request with error handling
 */
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: response.ok ? await response.json() : null,
      error: !response.ok ? await response.text() : null,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

/**
 * Discover organizations
 */
async function discoverOrganizations() {
  console.log('📋 Step 1: Discovering organizations...');

  const result = await apiRequest('https://sentry.io/api/0/organizations/');

  if (!result.ok) {
    if (result.status === 401) {
      console.error('❌ Authentication failed - token is invalid or expired');
      console.error('   Please generate a new Personal Access Token:');
      console.error('   https://sentry.io/settings/account/api/auth-tokens/');
      if (result.error) {
        console.error(`   Error details: ${result.error.substring(0, 200)}`);
      }
      process.exit(1);
    }
    if (result.status === 403) {
      console.error('❌ Permission denied - token lacks required scopes');
      console.error('   Required scopes: org:read, project:read');
      if (result.error) {
        console.error(`   Error details: ${result.error.substring(0, 200)}`);
      }
      process.exit(1);
    }
    console.error(`❌ Failed to fetch organizations: ${result.status} ${result.statusText}`);
    if (result.error) {
      console.error(`   Error details: ${result.error.substring(0, 200)}`);
    }
    return [];
  }

  const orgs = result.data || [];

  if (orgs.length === 0 && result.data !== null) {
    console.warn('⚠ No organizations returned, but request was successful');
    console.warn('   This might mean the token has limited access');
  }
  console.log(`✓ Found ${orgs.length} organization(s)`);
  orgs.forEach((org, i) => {
    console.log(`   ${i + 1}. ${org.slug} (${org.name})`);
  });

  return orgs;
}

/**
 * Discover projects for an organization
 */
async function discoverProjects(orgSlug) {
  console.log(`\n📋 Step 2: Discovering projects in ${orgSlug}...`);

  const result = await apiRequest(`https://sentry.io/api/0/organizations/${orgSlug}/projects/`);

  if (!result.ok) {
    if (result.status === 404) {
      console.error(`❌ Organization '${orgSlug}' not found`);
      return [];
    }
    console.error(`❌ Failed to fetch projects: ${result.status} ${result.statusText}`);
    return [];
  }

  const projects = result.data || [];
  console.log(`✓ Found ${projects.length} project(s)`);
  projects.forEach((project, i) => {
    console.log(`   ${i + 1}. ${project.slug} (${project.name})`);
  });

  return projects;
}

/**
 * Test project access
 */
async function testProject(orgSlug, projectSlug) {
  const url = `https://sentry.io/api/0/projects/${orgSlug}/${projectSlug}/issues/?limit=1`;
  const result = await apiRequest(url);

  return {
    accessible: result.ok,
    status: result.status,
    error: result.error,
  };
}

/**
 * Update .sentryclirc with input validation
 */
function updateSentryclirc(org, project) {
  try {
    // Validate and sanitize inputs
    const sanitizedOrg = sanitizeInput(org);
    const sanitizedProject = sanitizeInput(project);

    let content = '';
    if (existsSync('.sentryclirc')) {
      content = readFileSync('.sentryclirc', 'utf8');
    }

    // Ensure [defaults] section exists
    if (!content.includes('[defaults]')) {
      if (content.trim()) {
        content += '\n\n';
      }
      content += '[defaults]\n';
    }

    // Update org
    if (content.includes('org=')) {
      content = content.replace(/org=.*/g, `org=${sanitizedOrg}`);
    } else {
      // Add after [defaults]
      content = content.replace(/\[defaults\]/, `[defaults]\norg=${sanitizedOrg}`);
    }

    // Update project
    if (content.includes('project=')) {
      content = content.replace(/project=.*/g, `project=${sanitizedProject}`);
    } else {
      // Add after org
      if (content.includes(`org=${sanitizedOrg}`)) {
        content = content.replace(
          `org=${sanitizedOrg}`,
          `org=${sanitizedOrg}\nproject=${sanitizedProject}`
        );
      } else {
        content += `project=${sanitizedProject}\n`;
      }
    }

    writeFileSync('.sentryclirc', content);
    return true;
  } catch (error) {
    console.error('Failed to update .sentryclirc:', error.message);
    return false;
  }
}

/**
 * Sanitize input to prevent injection attacks
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Allow only alphanumeric, hyphens, underscores, and dots
  const sanitized = input.replace(/[^a-zA-Z0-9\-_.]/g, '');

  if (sanitized !== input) {
    throw new Error(`Invalid characters in input: ${input}`);
  }

  if (sanitized.length === 0) {
    throw new Error('Input cannot be empty after sanitization');
  }

  return sanitized;
}

/**
 * Update .env.sentry with input validation
 */
function updateEnvFile(org, project) {
  try {
    // Validate and sanitize inputs
    const sanitizedOrg = sanitizeInput(org);
    const sanitizedProject = sanitizeInput(project);

    const envPath = '.env.sentry';
    let content = '';

    if (existsSync(envPath)) {
      content = readFileSync(envPath, 'utf8');
    }

    // Update or add SENTRY_ORG
    if (content.includes('SENTRY_ORG=')) {
      content = content.replace(/SENTRY_ORG=.*/g, `SENTRY_ORG=${sanitizedOrg}`);
    } else {
      content += `\nSENTRY_ORG=${sanitizedOrg}\n`;
    }

    // Update or add SENTRY_PROJECT
    if (content.includes('SENTRY_PROJECT=')) {
      content = content.replace(/SENTRY_PROJECT=.*/g, `SENTRY_PROJECT=${sanitizedProject}`);
    } else {
      content += `SENTRY_PROJECT=${sanitizedProject}\n`;
    }

    writeFileSync(envPath, content);
    return true;
  } catch (error) {
    console.error('Failed to update .env.sentry:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 Fixing Sentry API 404 Error\n');
  console.log('='.repeat(60));

  // Step 1: Discover organizations
  const orgs = await discoverOrganizations();

  if (orgs.length === 0) {
    console.error('\n❌ No organizations found');
    process.exit(1);
  }

  // Step 2: For each org, discover projects
  const allProjects = [];
  for (const org of orgs) {
    const projects = await discoverProjects(org.slug);
    for (const project of projects) {
      allProjects.push({ org: org.slug, project: project.slug });
    }
  }

  if (allProjects.length === 0) {
    console.error('\n❌ No projects found');
    process.exit(1);
  }

  // Step 3: Test access to each project
  console.log('\n📋 Step 3: Testing project access...');
  const accessibleProjects = [];

  for (const { org, project } of allProjects) {
    console.log(`   Testing ${org}/${project}...`);
    const test = await testProject(org, project);

    if (test.accessible) {
      console.log(`   ✓ Accessible`);
      accessibleProjects.push({ org, project });
    } else {
      console.log(`   ✗ Not accessible (${test.status})`);
    }
  }

  if (accessibleProjects.length === 0) {
    console.error('\n❌ No accessible projects found');
    console.error('   Check your token has project:read scope');
    process.exit(1);
  }

  // Step 4: Select project (prefer current or first)
  const currentOrg = process.env.SENTRY_ORG || 'baltzakisthemiscom';
  const currentProject = process.env.SENTRY_PROJECT || 'matlab';

  let selected = accessibleProjects.find(
    (p) => p.org === currentOrg && p.project === currentProject
  );

  if (!selected) {
    selected = accessibleProjects[0];
    console.log(`\n⚠ Using first accessible project: ${selected.org}/${selected.project}`);
    if (currentOrg !== 'baltzakisthemiscom' || currentProject !== 'matlab') {
      console.log(`   (Preferred ${currentOrg}/${currentProject} is not accessible)`);
    }
  } else {
    console.log(`\n✓ Using preferred project: ${selected.org}/${selected.project}`);
  }

  // Step 5: Update configuration
  console.log('\n📋 Step 4: Updating configuration...');
  const updated1 = updateSentryclirc(selected.org, selected.project);
  const updated2 = updateEnvFile(selected.org, selected.project);

  if (updated1 || updated2) {
    console.log('✅ Configuration updated!');
    console.log(`   Organization: ${selected.org}`);
    console.log(`   Project: ${selected.project}`);

    // Step 6: Verify
    console.log('\n📋 Step 5: Verifying configuration...');
    const verify = await testProject(selected.org, selected.project);

    if (verify.accessible) {
      console.log('✅ Configuration verified - API access working!');
      console.log('\n📝 Next steps:');
      console.log('   1. Restart your terminal/IDE to load new env vars');
      console.log('   2. Run: npm run sentry:issues');
      console.log('   3. Or: node scripts/sentry/analyze-issues.js');
    } else {
      console.log(`⚠ Verification failed: ${verify.status}`);
      console.log('   But configuration has been updated');
    }
  } else {
    console.error('\n❌ Failed to update configuration');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
