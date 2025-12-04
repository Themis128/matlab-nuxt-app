/**
 * Create GitHub Project for MATLAB Deep Learning
 *
 * This script creates a GitHub Project with the basic structure.
 * Note: Custom fields and views need to be added manually through the UI
 * as the GraphQL API for Projects v2 has limitations.
 *
 * Usage: node create-github-project.js [--org ORGANIZATION] [--user]
 */

/* eslint-disable no-console */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

// Project configuration
const PROJECT_CONFIG = {
  name: 'MATLAB Model Development Roadmap',
  description:
    'Track and manage development of deep learning models for mobile phone dataset analysis. Includes price prediction, RAM prediction, battery prediction, and brand classification models.',
  body: `# MATLAB Model Development Roadmap

This project tracks the development and improvement of deep learning models for the Mobile Phones Dataset analysis.

## Current Models
- **Price Prediction:** R² = 0.9824 (Enhanced)
- **RAM Prediction:** R² = 0.9516 (Enhanced)
- **Battery Prediction:** R² = 0.9477 (Enhanced)
- **Brand Classification:** 65.22% accuracy (Enhanced)

## Quick Links
- [Model Documentation](../mobiles-dataset-docs/README.md)
- [Training Scripts](../mobiles-dataset-docs/train_all_models_enhanced.m)
- [Prediction Functions](../mobiles-dataset-docs/predict_price_enhanced.m)

## Status
- 🟢 On track - All enhanced models deployed
- Next: Improve brand classification to 70%+ accuracy
`,
};

// GraphQL mutation to create a project
const CREATE_PROJECT_MUTATION = `
  mutation CreateProject($input: CreateProjectV2Input!) {
    createProjectV2(input: $input) {
      projectV2 {
        id
        number
        title
        url
      }
    }
  }
`;

function getOwnerAndType() {
  const args = process.argv.slice(2);
  const orgIndex = args.indexOf('--org');
  const userIndex = args.indexOf('--user');

  if (orgIndex !== -1 && args[orgIndex + 1]) {
    const owner = args[orgIndex + 1];
    // Validate owner name to prevent command injection
    if (!/^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(owner)) {
      console.error(
        'Error: Invalid owner name. Owner must be a valid GitHub username or organization name.'
      );
      process.exit(1);
    }
    return { owner, type: 'ORGANIZATION' };
  }
  if (userIndex !== -1) {
    return { owner: null, type: 'USER' };
  }

  // Try to detect from git remote
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();

    // Validate the remote URL looks safe (GitHub URL pattern)
    if (
      !/^https?:\/\/github\.com\/[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+\.git$/.test(remoteUrl) &&
      !/^git@github\.com:[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+\.git$/.test(remoteUrl)
    ) {
      console.log(
        'Warning: Git remote URL does not match expected GitHub pattern, skipping auto-detection.'
      );
    } else {
      const match = remoteUrl.match(/github\.com[\/:]([^\/]+)\/([^\/]+)/);
      if (match) {
        const owner = match[1];
        // Validate extracted owner name
        if (!/^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(owner)) {
          console.log('Warning: Extracted owner name is invalid, skipping auto-detection.');
        } else {
          console.log(`Detected owner: ${owner}`);
          console.log('Assuming user project. Use --org ORGANIZATION for org project.');
          return { owner: null, type: 'USER' };
        }
      }
    }
  } catch (e) {
    // Ignore git errors
  }

  return { owner: null, type: 'USER' };
}

function createProjectGraphQL(owner, ownerType) {
  const input = {
    ownerId: owner ? `ORG_${owner}` : null, // This is a placeholder - actual ID needed
    title: PROJECT_CONFIG.name,
    public: false,
  };

  // Note: We need the actual owner ID, not the login
  // This is complex with GraphQL, so we'll use a simpler approach
  console.log('Creating project using GitHub CLI...');

  // Use gh CLI to create project (simpler but limited)
  try {
    // Build command safely - owner is already validated with regex
    const ownerArg = owner || '@me';
    const titleArg = PROJECT_CONFIG.name.replace(/"/g, '\\"'); // Escape quotes in title

    const command = `gh project create --owner "${ownerArg}" --title "${titleArg}"`;

    console.log(`Executing: ${command}`);
    const result = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ Project created successfully!');
    console.log(result);

    // Get project URL
    const projectUrl = result.match(/https:\/\/github\.com\/[^\s]+/)?.[0];
    if (projectUrl) {
      console.log(`\n🔗 Project URL: ${projectUrl}`);
      console.log('\n📝 Next Steps:');
      console.log('1. Open the project in GitHub');
      console.log('2. Go to Settings (⋯ menu) to add description and README');
      console.log('3. Add custom fields (Priority, Model Type, R² Target, etc.)');
      console.log('4. Create views (Team Backlog, Current Sprint, Roadmap)');
      console.log('5. Add initial items');
      console.log('\n📚 See CREATE_PROJECT_MANUAL.md for detailed setup instructions.');
      console.log('📚 Or follow GITHUB_PROJECTS_QUICKSTART.md for step-by-step guide.');
    }

    return result;
  } catch (error) {
    if (error.message.includes('missing required scopes')) {
      console.error('❌ Authentication token missing required scopes.');
      console.log('\n🔐 To fix this, run:');
      console.log('   gh auth refresh -s project,read:project');
      console.log('\nThen run this script again:');
      console.log('   node create-github-project.js');
      console.log('\n📝 Alternatively, use the manual guide:');
      console.log('   See CREATE_PROJECT_MANUAL.md for step-by-step instructions');
    } else {
      console.error('❌ Error creating project:', error.message);
      console.log('\n📝 Please use the manual guide:');
      console.log('   See CREATE_PROJECT_MANUAL.md for step-by-step instructions');
      console.log('   Or follow: GITHUB_PROJECTS_QUICKSTART.md');
    }
    return null;
  }
}

function main() {
  console.log('🚀 Creating GitHub Project for MATLAB Deep Learning\n');

  const { owner, type } = getOwnerAndType();

  console.log(`Project Type: ${type}`);
  if (owner) {
    console.log(`Organization: ${owner}`);
  }
  console.log(`Project Name: ${PROJECT_CONFIG.name}\n`);

  // Check if gh CLI supports project creation
  try {
    execSync('gh project --help', { encoding: 'utf-8', stdio: 'ignore' });
  } catch (e) {
    console.log('⚠️  GitHub CLI project commands may not be available in your version.');
    console.log('📝 Please use the manual guide: CREATE_PROJECT_MANUAL.md\n');
    return;
  }

  const result = createProjectGraphQL(owner, type);

  if (result) {
    console.log('\n✅ Next Steps:');
    console.log('1. Open the project in GitHub');
    console.log('2. Add custom fields (Priority, Model Type, R² Target, etc.)');
    console.log('3. Create views (Team Backlog, Current Sprint, Roadmap)');
    console.log('4. Add initial items');
    console.log('\n📚 See GITHUB_PROJECTS_QUICKSTART.md for detailed setup instructions.');
  }
}

main();
