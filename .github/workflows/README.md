# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing and deployment.

## Available Workflows

### 1. MATLAB Code Validation (`matlab-tests.yml`)
- **Triggers**: Push/PR to master/main branches
- **Purpose**: Validates MATLAB code structure and basic syntax
- **Runs on**: Ubuntu latest

### 2. Documentation Check (`documentation.yml`)
- **Triggers**: Push/PR to master/main branches (only when .md files change)
- **Purpose**: Validates documentation files and structure
- **Runs on**: Ubuntu latest

### 3. Deploy to Replit (`replit-deploy.yml`)
- **Triggers**: Push to master/main branches (excluding docs/tests), manual trigger
- **Purpose**: Automatically deploy the application to Replit
- **Runs on**: Ubuntu latest

## Replit Deployment Setup

To set up automatic deployment to Replit, follow these steps:

### 1. Get Replit API Token
1. Go to [Replit Account Settings](https://replit.com/account)
2. Navigate to "API Tokens" section
3. Create a new API token
4. Copy the token (keep it secure!)

### 2. Get Replit App ID
1. Open your Replit app
2. The app ID is in the URL: `https://replit.com/@username/app-name`
3. Or check the `.replit` file in your project root

### 3. Set up GitHub Secrets
In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `REPLIT_API_TOKEN`: Your Replit API token
   - `REPLIT_APP_ID`: Your Replit app ID

### 4. Alternative: Use .replit file
If you don't want to set secrets, you can create a `.replit` file in your project root:

```json
{
  "id": "your-replit-app-id-here"
}
```

The workflow will automatically extract the app ID from this file.

## Workflow Triggers

### Automatic Deployment
The Replit deployment workflow runs automatically when:
- Code is pushed to `master` or `main` branch
- Changes affect application code (not docs/tests)
- You manually trigger it via GitHub Actions UI

### Excluded Paths
The deployment workflow ignores changes to:
- `*.md` files (documentation)
- `docs/` directory
- `mobiles-dataset-docs/` directory
- `tests/` directory
- `screenshots/` directory

## Troubleshooting

### Deployment Fails
1. Check that `REPLIT_API_TOKEN` and `REPLIT_APP_ID` secrets are set
2. Verify the Replit app exists and is accessible
3. Check the workflow logs for specific error messages

### Token Issues
1. Regenerate your Replit API token if expired
2. Ensure the token has deployment permissions
3. Update the GitHub secret with the new token

### App ID Issues
1. Verify the app ID in your `.replit` file or GitHub secret
2. Make sure the Replit app is not private (or token has access)
3. Check that the app name matches exactly

## Manual Deployment

You can also deploy manually by:
1. Going to the **Actions** tab in GitHub
2. Selecting "Deploy to Replit" workflow
3. Clicking "Run workflow"

This is useful for testing deployments or deploying from branches other than main.
