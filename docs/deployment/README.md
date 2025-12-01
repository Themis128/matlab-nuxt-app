<!-- Deployment docs originally in `deployment/README.md` moved to docs/deployment/ -->

# 🚀 Deployment Guide

This guide covers deploying the MATLAB Mobile Dataset application to production using SSH-based artifact deploys (recommended), or cloud platforms. Containerization is supported for legacy purposes only.

## 📋 Prerequisites

- **Server Requirements:**
  - Ubuntu 22.04 LTS or newer
  - 4GB+ RAM
  - 20GB+ disk space
  - Root/sudo access

-- **Software Dependencies:**

- Python 3.14+
- Node.js 22+
- Nginx (for reverse proxy)
- Redis (for caching)

## 🖥️ Traditional Server Deployment (Recommended)

All operational scripts and systemd unit files are now located under `infrastructure/` and have been retained as a minimal set for the recommended SSH-based server deploy.

### Step-by-Step Setup

```bash
# 1. Run automated deployment script
sudo chmod +x infrastructure/scripts/deploy_production.sh
sudo ./infrastructure/scripts/deploy_production.sh
```

The script automatically:

- ✅ Updates system packages
- ✅ Installs Python 3.14, Node.js 22, Nginx, Redis
- ✅ Creates Python virtual environment
- ✅ Installs Python dependencies
- ✅ Builds Nuxt app
- ✅ Sets up systemd services
- ✅ Configures Nginx reverse proxy
- ✅ Runs health checks

### Service Management & Health

```bash
# Check status
sudo systemctl status python-api
sudo systemctl status nuxt-app

# View logs
sudo journalctl -u python-api -f
sudo journalctl -u nuxt-app -f

# Restart services
sudo systemctl restart python-api
sudo systemctl restart nuxt-app
```

See `infrastructure/` for scripts and service definitions (systemd units, nginx configuration, and helper scripts).
