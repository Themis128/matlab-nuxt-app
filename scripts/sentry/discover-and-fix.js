#!/usr/bin/env node
/**
 * Discover Sentry Projects and Fix Configuration
 * Uses Sentry CLI output to discover correct org/project
 */

import { execSync, spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

/**
 * Sanitize input to prevent command injection
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
 * Run Sentry CLI command with safe argument passing
 */
function runSentryCLI(command, args = []) {
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
    // Use array format to prevent injection - execSync accepts arrays in Node.js
    const cmdArray = ['npx', '@sentry/cli', sanitizedCommand, ...sanitizedArgs];

    // Use execSync with array format (Node.js 12+) to prevent command injection
    // This is safer than string concatenation
    try {
      return execSync(cmdArray, { encoding: 'utf8', stdio: 'pipe' });
    } catch (_error) {
      // If array format fails, fall back to spawnSync which is always safe
      const result = spawnSync(cmdArray[0], cmdArray.slice(1), { encoding: 'utf8', stdio: 'pipe' });
      if (result.error) {
        throw result.error;
      }
      if (result.status !== 0) {
        const error = new Error(result.stderr || 'Command failed');
        error.stdout = result.stdout;
        error.stderr = result.stderr;
        throw error;
      }
      return result.stdout;
    }
  } catch (error) {
    return error.stdout || error.stderr || error.message;
  }
}

function updateConfig(org, project) {
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
      content = content.replace(/\[defaults\]/, `[defaults]\norg=${sanitizedOrg}`);
    }

    // Update project
    if (content.includes('project=')) {
      content = content.replace(/project=.*/g, `project=${sanitizedProject}`);
    } else {
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
    console.error('Failed to update config:', error.message);
    return false;
  }
}

console.log('🔍 Discovering Sentry projects...\n');

// Try different approaches to list projects
const orgs = ['baltzakisthemiscom'];
const projects = [];

// Try to get projects for known org
for (const org of orgs) {
  console.log(`Trying org: ${org}`);

  // Method 1: Direct CLI command
  const output1 = runSentryCLI('projects', ['list', '--org', org]);
  console.log('CLI output:', output1.substring(0, 200));

  // Method 2: Try issues list (which will show project in error if wrong)
  const output2 = runSentryCLI('issues', [
    'list',
    '--org',
    org,
    '--status',
    'unresolved',
    '--max-rows',
    '1',
  ]);
  console.log('Issues test:', output2.substring(0, 200));

  // Parse output for project hints
  const allOutput = output1 + output2;

  // Look for common project patterns
  const projectPatterns = [
    /project[=:]\s*([a-z0-9-]+)/i,
    /projects?\s+([a-z0-9-]+)/i,
    /([a-z0-9-]+)\s+.*project/i,
  ];

  for (const pattern of projectPatterns) {
    const match = allOutput.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      const proj = match[1].toLowerCase();
      if (!projects.includes(proj) && proj !== 'project' && proj !== 'projects') {
        projects.push(proj);
      }
    }
  }
}

// If no projects found, try common names
if (projects.length === 0) {
  console.log('\n⚠ No projects found in output, trying common names...');
  const commonProjects = ['matlab', 'nuxt', 'app', 'web', 'frontend', 'backend'];

  for (const proj of commonProjects) {
    console.log(`Testing ${orgs[0]}/${proj}...`);
    const test = runSentryCLI('issues', [
      'list',
      '--org',
      orgs[0],
      '--project',
      proj,
      '--status',
      'unresolved',
      '--max-rows',
      '1',
    ]);

    if (test.includes('200') || (!test.includes('404') && !test.includes('not found'))) {
      projects.push(proj);
      console.log(`✓ Found accessible project: ${proj}`);
      break;
    }
  }
}

if (projects.length > 0) {
  const org = orgs[0];
  const project = projects[0];

  console.log(`\n✅ Found project: ${org}/${project}`);
  console.log('Updating configuration...');

  if (updateConfig(org, project)) {
    console.log('✅ Configuration updated!');
    console.log(`\nTest with: npm run sentry:issues`);
  }
} else {
  console.log('\n❌ Could not discover projects');
  console.log('\nManual steps:');
  console.log('1. Go to https://sentry.io/settings/');
  console.log('2. Find your organization slug');
  console.log('3. Go to Projects and find your project slug');
  console.log('4. Update .sentryclirc with:');
  console.log('   [defaults]');
  console.log('   org=YOUR_ORG_SLUG');
  console.log('   project=YOUR_PROJECT_SLUG');
}
