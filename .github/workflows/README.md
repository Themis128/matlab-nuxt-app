# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated building, testing, and deployment.

## 📋 Available Workflows

### 1. Build and Test (`build-and-test.yml`) ✨ NEW

- **Triggers**: Push/PR to master/main branches, manual trigger
- **Purpose**: Comprehensive testing of frontend, backend, Docker builds, and E2E tests
- **Jobs**:
  - `test-frontend`: Node.js 22, Nuxt build, type checking
  - `test-backend`: Python 3.14, API validation
  - `test-docker`: Docker image builds (Python API + Nuxt App)
  - `e2e-tests`: Playwright E2E tests with both services running
- **Runs on**: Ubuntu latest
- **Note**: Includes npm cleanup to fix oxc-parser optional dependencies issue

### 2. Deploy to Production (`deploy.yml`) ✨ NEW

- **Triggers**: Version tags (`v*`), manual trigger
- **Purpose**: Deploy to Docker Hub or server via SSH
- **Jobs**:
  - `deploy-docker`: Builds and pushes Docker images (on tags only)
  - `deploy-server`: Deploys to server via SSH (manual only)
- **Runs on**: Ubuntu latest
- **Required Secrets**: `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`

### 3. MATLAB Code Validation (`matlab-tests.yml`)

- **Triggers**: Push/PR to master/main branches, manual trigger
- **Purpose**: Validates MATLAB code structure and basic syntax
- **Runs on**: Ubuntu latest

### 4. Documentation Check (`documentation.yml`)

- **Triggers**: Push/PR to master/main branches (only when .md files change)
- **Purpose**: Validates documentation files and structure
- **Runs on**: Ubuntu latest

## 🐛 NPM Optional Dependencies Fix

All workflows that use npm now include cleanup steps to fix the oxc-parser native binding error:

```yaml
- name: Clean up npm modules and lock file
  run: rm -rf node_modules package-lock.json

- name: Install dependencies
  run: npm install
```

**Why?** This resolves an npm bug with optional dependencies ([npm#4828](https://github.com/npm/cli/issues/4828)) that causes the error:

```
Error: Cannot find module '@oxc-parser/binding-...'
```

**Affected workflows:**

- ✅ `build-and-test.yml` - All npm install steps
- ✅ `deploy.yml` - Server deployment

## 🚀 Deployment Guide

### Docker Hub Deployment

**Trigger:** Push a version tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

**Images pushed:**

- `your-username/matlab-python-api:latest`
- `your-username/matlab-python-api:1.0.0`
- `your-username/matlab-nuxt-app:latest`
- `your-username/matlab-nuxt-app:1.0.0`

### Server Deployment

**Trigger:** Manual (GitHub Actions UI)

1. Go to **Actions** → **Deploy to Production**
2. Click **Run workflow**
3. Select branch
4. Click **Run workflow** button

**What it does:**

- Pulls latest code on server
- Installs dependencies (with npm cleanup)
- Builds Nuxt app
- Restarts systemd services
- Runs health checks
