#!/usr/bin/env node
/**
 * Fix Sentry API Configuration using Sentry CLI
 *
 * Uses Sentry CLI to discover correct org/project and update configuration
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
// No unused imports needed

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
 * Run Sentry CLI command with safe argument passing
 */
function runSentryCLI(command, args = [], options = {}) {
  try {
    // Sanitize command
    const sanitizedCommand = sanitizeInput(command);

    // Sanitize arguments
    const sanitizedArgs = args.map((arg) => {
      if (typeof arg === 'string') {
        return sanitizeInput(arg);
      }
      throw new Error('All arguments must be strings');
    });

    // Build command array for safe execution
    const cmdArray = ['npx', '@sentry/cli', sanitizedCommand, ...sanitizedArgs];

    const result = execSync(cmdArray.join(' '), {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: process.cwd(),
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
}

/**
 * Get current configuration from .sentryclirc
 */
function getCurrentConfig() {
  try {
    const content = readFileSync('.sentryclirc', 'utf8');
    const orgMatch = content.match(/org=(.+)/);
    const projectMatch = content.match(/project=(.+)/);
    const tokenMatch = content.match(/token=(.+)/);

    return {
      org: orgMatch ? orgMatch[1].trim() : null,
      project: projectMatch ? projectMatch[1].trim() : null,
      token: tokenMatch ? tokenMatch[1].trim() : null,
    };
  } catch (_error) {
    return { org: null, project: null, token: null };
  }
}

/**
 * Update .sentryclirc file with input validation
 */
function updateSentryclirc(org, project) {
  try {
    // Validate and sanitize inputs
    const sanitizedOrg = sanitizeInput(org);
    const sanitizedProject = sanitizeInput(project);

    let content = '';
    try {
      content = readFileSync('.sentryclirc', 'utf8');
    } catch (_error) {
      // File doesn't exist, start with empty content
      content = '';
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
 * Try to get org from CLI
 */
function discoverOrg() {
  console.log('📋 Attempting to discover organization...');

  // Try to get org from various CLI commands
  const commands = [
    { cmd: 'projects', args: ['list'] },
    { cmd: 'releases', args: ['list'] },
    { cmd: 'info', args: [] },
  ];

  for (const { cmd, args } of commands) {
    const result = runSentryCLI(cmd, args, { silent: true });
    if (result.success) {
      // Try to extract org from output or error messages
      const output = result.output || '';
      console.log(`   Trying: sentry-cli ${cmd} ${args.join(' ')}`);

      // Check if it gives us any hints
      if (output.includes('org=') || output.includes('organization')) {
        const orgMatch = output.match(/org[=:]\s*([^\s,]+)/i);
        if (orgMatch) {
          return orgMatch[1];
        }
      }
    }
  }

  return null;
}

/**
 * Try to list projects
 */
function discoverProjects(org) {
  console.log(`📋 Attempting to discover projects for org: ${org}...`);

  // Try with org flag
  const result = runSentryCLI('projects', ['list', '--org', org], { silent: true });

  if (result.success) {
    // Parse project list from output
    const output = result.output || '';
    const projects = [];

    // Try to parse project slugs from output
    const lines = output.split('\n');
    for (const line of lines) {
      // Look for project patterns
      const match = line.match(/([a-z0-9-]+)\s+.*/i);
      if (match && match[1] !== 'slug' && match[1] !== 'name') {
        projects.push(match[1]);
      }
    }

    return projects.length > 0 ? projects : null;
  }

  return null;
}

/**
 * Test project access
 */
function testProjectAccess(org, project) {
  console.log(`   Testing access to ${org}/${project}...`);

  const result = runSentryCLI(
    'issues',
    ['list', '--org', org, '--project', project, '--status', 'unresolved', '--max-rows', '1'],
    { silent: true }
  );

  return result.success;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 Fixing Sentry API Configuration via CLI...\n');
  console.log('='.repeat(60));

  // Get current config
  const current = getCurrentConfig();
  console.log('\n📋 Current Configuration:');
  console.log(`   Org: ${current.org || 'not set'}`);
  console.log(`   Project: ${current.project || 'not set'}`);
  console.log(`   Token: ${current.token ? `***${current.token.slice(-4)}` : 'not set'}`);

  // Step 1: Verify authentication
  console.log('\n📋 Step 1: Verifying authentication...');
  const authResult = runSentryCLI('login', [], { silent: true });

  if (!authResult.success && authResult.output && authResult.output.includes('Valid org token')) {
    console.log('✓ Authentication valid');
  } else {
    console.log('⚠ Authentication check inconclusive');
    console.log('   Continuing with discovery...');
  }

  // Step 2: Try to discover org
  let org = current.org;
  if (!org) {
    org = discoverOrg();
    if (!org) {
      console.log('\n❌ Could not discover organization');
      console.log('   Please set SENTRY_ORG in .env.sentry or .sentryclirc');
      console.log('   Or run: npx @sentry/cli --org YOUR_ORG projects list');
      process.exit(1);
    }
    console.log(`✓ Discovered org: ${org}`);
  } else {
    console.log(`✓ Using configured org: ${org}`);
  }

  // Step 3: Try to discover projects
  let project = current.project;
  if (!project) {
    const projects = discoverProjects(org);
    if (projects && projects.length > 0) {
      console.log(`✓ Found ${projects.length} project(s): ${projects.join(', ')}`);
      project = projects[0]; // Use first project
      console.log(`✓ Using project: ${project}`);
    } else {
      console.log('\n❌ Could not discover projects');
      console.log(`   Try: npx @sentry/cli --org ${org} projects list`);
      process.exit(1);
    }
  } else {
    console.log(`✓ Using configured project: ${project}`);
  }

  // Step 4: Test access
  console.log('\n📋 Step 2: Testing project access...');
  const accessible = testProjectAccess(org, project);

  if (accessible) {
    console.log(`✅ Access confirmed for ${org}/${project}`);
  } else {
    console.log(`⚠ Could not confirm access to ${org}/${project}`);
    console.log('   But updating configuration anyway...');
  }

  // Step 5: Update configuration
  console.log('\n📋 Step 3: Updating configuration...');
  const updated = updateSentryclirc(org, project);

  if (updated) {
    console.log('✅ Configuration updated!');
    console.log(`   Organization: ${org}`);
    console.log(`   Project: ${project}`);

    // Step 6: Verify with API
    console.log('\n📋 Step 4: Verifying with API...');
    const verifyResult = runSentryCLI(
      'issues',
      ['list', '--org', org, '--project', project, '--status', 'unresolved', '--max-rows', '1'],
      { silent: true }
    );

    if (verifyResult.success) {
      console.log('✅ API access verified!');
    } else {
      console.log('⚠ API verification had issues, but config is updated');
      console.log('   Try: npm run sentry:issues');
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Restart your terminal/IDE');
    console.log('   2. Run: npm run sentry:issues');
    console.log('   3. Or: node scripts/sentry/analyze-issues.js');
  } else {
    console.error('\n❌ Failed to update configuration');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
