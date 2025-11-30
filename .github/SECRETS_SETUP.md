# GitHub Secrets Setup Guide

## Overview

The deployment workflow requires several secrets to be configured in your GitHub repository settings. The linter warnings you see in `deploy.yml` are expected and will disappear once these secrets are properly configured.

## Required Secrets

### For Docker Deployment (deploy-docker job)

1. **DOCKER_USERNAME** - Your Docker Hub username
2. **DOCKER_PASSWORD** - Your Docker Hub password or access token

### For Server Deployment (deploy-server job)

1. **SERVER_HOST** - Your server's IP address or domain name
2. **SERVER_USER** - SSH username for server access
3. **SERVER_SSH_KEY** - Private SSH key for authentication
4. **SERVER_PORT** - SSH port (default: 22)

## How to Configure Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its name and value
5. Click **Add secret**

## Generating SSH Key

If you don't have an SSH key pair:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

- Copy the **private key** to `SERVER_SSH_KEY` secret
- Add the **public key** to your server's `~/.ssh/authorized_keys`

## Verifying Setup

After adding all secrets:

1. The linter warnings in `deploy.yml` will remain (this is normal)
2. Run a test deployment using **Actions** → **Deploy to Production** → **Run workflow**
3. The validation step will confirm if secrets are properly configured

## Security Notes

- Never commit secrets to your repository
- Use GitHub's encrypted secrets feature
- Rotate SSH keys periodically
- Use Docker access tokens instead of passwords
- Limit SSH key permissions on the server

## Linter Warnings

The warnings about "Context access might be invalid" are **expected** and **not errors**. They indicate that:

- The GitHub Actions linter cannot verify if secrets exist at design time
- Secrets are evaluated at runtime, not during static analysis
- The workflow will fail gracefully if secrets are missing (see validation step)

These warnings are informational only and do not prevent the workflow from running successfully.
