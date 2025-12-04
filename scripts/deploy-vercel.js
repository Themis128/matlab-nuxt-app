#!/usr/bin/env node

/**
 * Vercel Deployment Script using Vercel SDK
 * Deploys the MATLAB Nuxt.js application to Vercel
 */

import { Vercel } from '@vercel/sdk';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants
const DEPLOYMENT_CHECK_INTERVAL = 5000; // 5 seconds

// Vercel token - replace with your actual token
const VERCEL_TOKEN = 'ZjLaVLJq12yqcOGXXGkJQqKp';

const vercel = new Vercel({
  bearerToken: VERCEL_TOKEN,
});

async function createDeploymentAndAlias() {
  try {
    console.log('🚀 Starting Vercel deployment...');

    // Get project information
    const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    const projectName = packageJson.name;

    console.log(`📦 Deploying project: ${projectName}`);

    // Create a new deployment
    const createResponse = await vercel.deployments.createDeployment({
      requestBody: {
        name: projectName,
        target: 'production',
        gitSource: {
          type: 'github',
          repo: 'matlab-nuxt-app',
          ref: 'feature/cline-integration', // Current branch
          org: 'Themis128',
        },
        // Project settings for Nuxt.js
        projectSettings: {
          framework: 'nuxtjs',
          buildCommand: 'npm run build',
          installCommand: 'npm install',
          outputDirectory: '.output/public',
          devCommand: 'npm run dev',
          nodeVersion: '22.x', // Match local Node version
          // Additional settings for better compatibility
          skipLinting: true, // Skip linting during build
          installCommandForFunctions: 'npm install --production=false',
        },
        // Additional deployment configuration
        functions: {
          'server/**/*.js': {
            runtime: 'nodejs18.x',
          },
          'server/**/*.ts': {
            runtime: 'nodejs18.x',
          },
        },
      },
    });

    const deploymentId = createResponse.id;

    console.log(`✅ Deployment created: ID ${deploymentId} and status ${createResponse.status}`);

    // Check deployment status
    let deploymentStatus;
    let deploymentURL;
    let attempts = 0;
    const maxAttempts = 60; // Maximum 5 minutes of checking

    do {
      attempts++;
      console.log(
        `📊 Deployment status check ${attempts}/${maxAttempts}: ${deploymentStatus || 'Checking...'}`
      );

      try {
        const statusResponse = await vercel.deployments.getDeployment({
          idOrUrl: deploymentId,
          withGitRepoInfo: 'true',
        });

        deploymentStatus = statusResponse.status;
        deploymentURL = statusResponse.url;

        if (deploymentStatus === 'ERROR') {
          console.log('❌ Deployment failed. Attempting to get error details...');
          // Try to get more error information
          console.log('Deployment details:', JSON.stringify(statusResponse, null, 2));
          break;
        }
      } catch (statusError) {
        console.warn(`⚠️  Could not get deployment status: ${statusError.message}`);
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to get deployment status after ${maxAttempts} attempts`);
        }
      }

      if (deploymentStatus !== 'READY' && deploymentStatus !== 'ERROR' && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, DEPLOYMENT_CHECK_INTERVAL));
      }
    } while (
      (deploymentStatus === 'BUILDING' ||
        deploymentStatus === 'INITIALIZING' ||
        deploymentStatus === 'QUEUED') &&
      attempts < maxAttempts
    );

    if (deploymentStatus === 'READY') {
      console.log(`🎉 Deployment successful. URL: ${deploymentURL}`);

      // Create an alias for the deployment
      const aliasName = `${projectName}-prod.vercel.app`;

      try {
        const aliasResponse = await vercel.aliases.assignAlias({
          id: deploymentId,
          requestBody: {
            alias: aliasName,
            redirect: null,
          },
        });

        console.log(`🔗 Alias created: ${aliasResponse.alias}`);
        console.log(`🌐 Production URL: https://${aliasName}`);
      } catch (aliasError) {
        console.warn(`⚠️  Could not create alias: ${aliasError.message}`);
        console.log(`🌐 Deployment URL: ${deploymentURL}`);
      }
    } else {
      console.log('❌ Deployment failed or was canceled');
      console.log(`📊 Final status: ${deploymentStatus}`);
    }

    return { deploymentId, status: deploymentStatus, url: deploymentURL };
  } catch (error) {
    console.error(
      '❌ Deployment failed:',
      error instanceof Error ? `Error: ${error.message}` : String(error)
    );
    throw error;
  }
}

// Run deployment
createDeploymentAndAlias().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
