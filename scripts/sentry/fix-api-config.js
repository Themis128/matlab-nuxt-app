#!/usr/bin/env node
/**
 * Fix Sentry API Configuration
 *
 * This script discovers the correct org/project configuration
 * and updates the settings to fix 404 errors.
 */

import dotenv from 'dotenv';
import { join, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.sentry') });
dotenv.config();

// Get token from .sentryclirc or env
// SECURITY: Tokens should be stored in environment variables, not in files
// Ensure .sentryclirc has proper file permissions (chmod 600) if used
function getToken() {
  // Prefer environment variables over file-based storage
  const envToken = process.env.SENTRY_AUTH_TOKEN || process.env.SENTRY_ACCESS_TOKEN;
  if (envToken) {
    return envToken;
  }

  // Fallback to .sentryclirc (less secure - ensure file permissions are set)
  try {
    const sentryclirc = readFileSync('.sentryclirc', 'utf8');
    const tokenMatch = sentryclirc.match(/token=(.+)/);
    if (tokenMatch) {
      const token = tokenMatch[1].trim();
      // Warn if token is read from file (less secure)
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          '⚠️  WARNING: Reading token from .sentryclirc file. Use environment variables in production.'
        );
      }
      return token;
    }
  } catch (_e) {
    // File doesn't exist or can't be read
  }

  return null;
}

const SENTRY_AUTH_TOKEN = getToken();

if (!SENTRY_AUTH_TOKEN) {
  console.error('❌ No Sentry auth token found');
  console.error('   Set SENTRY_AUTH_TOKEN in .env.sentry or configure .sentryclirc');
  process.exit(1);
}

/**
 * Fetch organizations
 */
async function fetchOrganizations() {
  try {
    const response = await fetch('https://sentry.io/api/0/organizations/', {
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed - token is invalid');
      }
      if (response.status === 403) {
        throw new Error('Permission denied - token lacks required scopes');
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch organizations:', error.message);
    return [];
  }
}

/**
 * Fetch projects for an organization
 */
async function fetchProjects(orgSlug) {
  try {
    const response = await fetch(`https://sentry.io/api/0/organizations/${orgSlug}/projects/`, {
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Organization '${orgSlug}' not found`);
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch projects for ${orgSlug}:`, error.message);
    return [];
  }
}

/**
 * Test project access
 */
async function testProject(orgSlug, projectSlug) {
  try {
    const response = await fetch(
      `https://sentry.io/api/0/projects/${orgSlug}/${projectSlug}/issues/?limit=1`,
      {
        headers: {
          Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    return {
      accessible: false,
      error: error.message,
    };
  }
}

/**
 * Validate and sanitize org/project slugs to prevent arbitrary file write
 */
function validateSlug(slug, fieldName) {
  if (typeof slug !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  // Only allow alphanumeric, hyphens, underscores, and dots
  if (!/^[a-zA-Z0-9._-]+$/.test(slug)) {
    throw new Error(
      `Invalid ${fieldName}: ${slug} (only alphanumeric, dots, hyphens, underscores allowed)`
    );
  }
  // Prevent path traversal attempts
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    throw new Error(`Invalid ${fieldName}: ${slug} (path traversal detected)`);
  }
  // Length limits
  if (slug.length < 1 || slug.length > 100) {
    throw new Error(`${fieldName} must be between 1 and 100 characters`);
  }
  return slug;
}

/**
 * Update .sentryclirc file with validation
 */
function updateSentryclirc(orgSlug, projectSlug) {
  try {
    // Validate inputs to prevent arbitrary file write
    const validatedOrg = validateSlug(orgSlug, 'orgSlug');
    const validatedProject = validateSlug(projectSlug, 'projectSlug');

    // Ensure we're only writing to .sentryclirc in the current directory
    const sentryclircPath = resolve('.sentryclirc');
    const cwd = process.cwd();

    // Prevent writing outside current directory
    if (!sentryclircPath.startsWith(cwd)) {
      throw new Error('Cannot write .sentryclirc outside current directory');
    }

    let content = '';
    try {
      content = readFileSync('.sentryclirc', 'utf8');
    } catch (_e) {
      // File doesn't exist, start with empty content
      content = '';
    }

    // Update or add org
    if (content.includes('[defaults]')) {
      // Update existing defaults section
      content = content.replace(/org=.*/g, `org=${validatedOrg}`);
      if (!content.includes(`org=${validatedOrg}`)) {
        content = content.replace(/\[defaults\]/, `[defaults]\norg=${validatedOrg}`);
      }

      // Update or add project
      if (content.includes('project=')) {
        content = content.replace(/project=.*/g, `project=${validatedProject}`);
      } else {
        content = content.replace(
          /\[defaults\]/,
          `[defaults]\norg=${validatedOrg}\nproject=${validatedProject}`
        );
      }
    } else {
      // Add defaults section
      content += `\n\n[defaults]\norg=${validatedOrg}\nproject=${validatedProject}\n`;
    }

    writeFileSync('.sentryclirc', content);
    console.log('✓ Updated .sentryclirc');
    return true;
  } catch (error) {
    console.error('Failed to update .sentryclirc:', error.message);
    return false;
  }
}

/**
 * Update environment variables in .env.sentry with validation
 */
function updateEnvFile(orgSlug, projectSlug) {
  const envPath = '.env.sentry';
  try {
    // Validate inputs to prevent arbitrary file write
    const validatedOrg = validateSlug(orgSlug, 'orgSlug');
    const validatedProject = validateSlug(projectSlug, 'projectSlug');

    // Ensure we're only writing to .env.sentry in the current directory
    const envFilePath = resolve(envPath);
    const cwd = process.cwd();

    // Prevent writing outside current directory
    if (!envFilePath.startsWith(cwd)) {
      throw new Error('Cannot write .env.sentry outside current directory');
    }

    let content = '';
    try {
      content = readFileSync(envPath, 'utf8');
    } catch (_e) {
      // File doesn't exist, create it
    }

    // Update or add SENTRY_ORG
    if (content.includes('SENTRY_ORG=')) {
      content = content.replace(/SENTRY_ORG=.*/g, `SENTRY_ORG=${validatedOrg}`);
    } else {
      content += `\nSENTRY_ORG=${validatedOrg}\n`;
    }

    // Update or add SENTRY_PROJECT
    if (content.includes('SENTRY_PROJECT=')) {
      content = content.replace(/SENTRY_PROJECT=.*/g, `SENTRY_PROJECT=${validatedProject}`);
    } else {
      content += `SENTRY_PROJECT=${validatedProject}\n`;
    }

    writeFileSync(envPath, content);
    console.log('✓ Updated .env.sentry');
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
  console.log('🔧 Fixing Sentry API Configuration...\n');
  console.log('='.repeat(60));

  // Step 1: Fetch organizations
  console.log('\n📋 Step 1: Discovering organizations...');
  const orgs = await fetchOrganizations();

  if (orgs.length === 0) {
    console.error('❌ No organizations found or access denied');
    console.error('   Check your token has the required scopes:');
    console.error('   - org:read');
    console.error('   - project:read');
    process.exit(1);
  }

  console.log(`✓ Found ${orgs.length} organization(s):`);
  orgs.forEach((org, index) => {
    console.log(`   ${index + 1}. ${org.slug} (${org.name})`);
  });

  // Step 2: For each org, fetch projects
  console.log('\n📋 Step 2: Discovering projects...');
  const orgProjects = [];

  for (const org of orgs) {
    const projects = await fetchProjects(org.slug);
    if (projects.length > 0) {
      orgProjects.push({ org, projects });
      console.log(`✓ Found ${projects.length} project(s) in ${org.slug}:`);
      projects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.slug} (${project.name})`);
      });
    }
  }

  if (orgProjects.length === 0) {
    console.error('❌ No projects found');
    process.exit(1);
  }

  // Step 3: Test access to projects
  console.log('\n📋 Step 3: Testing project access...');
  const accessibleProjects = [];

  for (const { org, projects } of orgProjects) {
    for (const project of projects) {
      console.log(`   Testing ${org.slug}/${project.slug}...`);
      const test = await testProject(org.slug, project.slug);

      if (test.accessible) {
        console.log(`   ✓ Accessible`);
        accessibleProjects.push({ org: org.slug, project: project.slug });
      } else {
        console.log(`   ✗ Not accessible (${test.status || test.error})`);
      }
    }
  }

  if (accessibleProjects.length === 0) {
    console.error('\n❌ No accessible projects found');
    console.error('   Check your token permissions');
    process.exit(1);
  }

  // Step 4: Use first accessible project or preferred one
  const currentOrg = process.env.SENTRY_ORG || 'baltzakisthemiscom';
  const currentProject = process.env.SENTRY_PROJECT || 'matlab';

  let selected = accessibleProjects.find(
    (p) => p.org === currentOrg && p.project === currentProject
  );

  if (!selected) {
    selected = accessibleProjects[0];
    console.log(`\n⚠ Using first accessible project: ${selected.org}/${selected.project}`);
    console.log(`   (Preferred ${currentOrg}/${currentProject} is not accessible)`);
  } else {
    console.log(`\n✓ Using preferred project: ${selected.org}/${selected.project}`);
  }

  // Step 5: Update configuration
  console.log('\n📋 Step 4: Updating configuration...');
  const updated1 = updateSentryclirc(selected.org, selected.project);
  const updated2 = updateEnvFile(selected.org, selected.project);

  if (updated1 || updated2) {
    console.log('\n✅ Configuration updated successfully!');
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
      console.log(`⚠ Verification failed: ${verify.status || verify.error}`);
      console.log('   But configuration has been updated');
    }
  } else {
    console.error('\n❌ Failed to update configuration');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
