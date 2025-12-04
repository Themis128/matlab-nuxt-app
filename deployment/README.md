# 🚀 Deployment Guide (Archived)

> ⚠️ This documentation has been moved to `docs/deployment/README.md` and deployment artifacts have been relocated to the `infrastructure/` folder. The files under this `deployment/` directory are retained for archival purposes. Please refer to the new documentation for the authoritative setup.

See: [docs/deployment/README.md](../docs/deployment/README.md)

This guide covers deploying the MATLAB Mobile Dataset application to production using Docker, traditional servers, or cloud platforms.

## 📋 Prerequisites

- **Server Requirements:**
  - Ubuntu 22.04 LTS or newer
  - 4GB+ RAM
  - 20GB+ disk space
  - Root/sudo access

-- **Software Dependencies:**

- Python 3.14+
- Node.js 22+
- (Optional) Docker & Docker Compose (for containerized deployment — not required)
- Nginx (for reverse proxy)
- Redis (for caching)

## 🖥️ Traditional Server Deployment

## ☑️ Recommended: Traditional Server Deployment (SSH & systemd)

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

### Manual Deployment

If you prefer manual control:

```bash
# 1. System dependencies
sudo apt-get update
sudo apt-get install -y python3.14 python3.14-venv nodejs npm nginx redis-server

# 2. Python environment
cd /var/www/matlab-mobile-dataset
python3.14 -m venv venv
source venv/bin/activate
pip install -r python_api/requirements.txt

# 3. Node.js environment
npm ci
npm run build

# 4. Configure environment
cp .env.production.template .env.production
# Edit .env.production

# 5. Setup systemd services
sudo cp infrastructure/systemd/python-api.service /etc/systemd/system/
sudo cp infrastructure/systemd/nuxt-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable python-api nuxt-app
sudo systemctl start python-api nuxt-app

sudo cp infrastructure/nginx/nginx.conf /etc/nginx/sites-available/matlab-mobile-dataset
sudo ln -s /etc/nginx/sites-available/matlab-mobile-dataset /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Service Management

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

## ☁️ Option 3: Cloud Platform Deployment

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
NUXT_PUBLIC_API_BASE=https://your-python-api.com
```

**Note:** Deploy Python API separately (e.g., Railway, Fly.io, DigitalOcean App Platform)

### Railway (Full Stack)

1. Create new project on [Railway](https://railway.app)
2. Add two services:
   - **Python API**: `python_api/` directory, port 8000
   - **Nuxt App**: Root directory, port 3000
3. Set environment variables from `.env.production.template`
4. Deploy

### DigitalOcean App Platform

1. Create App from GitHub repository
2. Configure components:
   - **API Service**: Python 3.14, `cd python_api && uvicorn api:app --host 0.0.0.0 --port 8000`
   - **Web Service**: Node.js 22, `npm run build && node .output/server/index.mjs`
3. Add Redis database component
4. Set environment variables

## 🤖 CI/CD Workflows

The project includes automated GitHub Actions workflows for building, testing, and deploying.

### Available Workflows

1. **Build and Test** (`.github/workflows/build-and-test.yml`)

   - Runs on every push and PR
   - Tests frontend build, backend validation, Docker builds, E2E tests
   - **Note:** Includes npm cleanup to fix oxc-parser optional dependencies issue

2. **Deploy to Production** (`.github/workflows/deploy.yml`)

- Builds Nuxt and Python artifacts and deploys to server via SSH on tag pushes
- Runs health checks after deployment

### Required Secrets

Configure these in GitHub Settings → Secrets:

**For Docker Hub deployment:**

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/access token

**For SSH server deployment:**

- `SERVER_HOST` - Server IP or hostname
- `SERVER_USER` - SSH username
- `SERVER_SSH_KEY` - SSH private key
- `SERVER_PORT` - SSH port (optional, defaults to 22)

### Triggering Deployments

**Docker Hub deployment:**

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

**Server deployment:**

```bash
# Manual trigger via GitHub Actions UI
# Go to Actions → Deploy to Production → Run workflow
```

### NPM Optional Dependencies Fix

All workflows include cleanup steps to fix the oxc-parser native binding error:

```yaml
- name: Clean up npm modules and lock file
  run: rm -rf node_modules package-lock.json

- name: Install dependencies
  run: npm install
```

This resolves the npm bug with optional dependencies ([npm#4828](https://github.com/npm/cli/issues/4828)).

## 🔒 SSL/TLS Configuration

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured by Certbot)
sudo certbot renew --dry-run
```

### Manual SSL Certificate

1. Place certificate files in `infrastructure/ssl/`:
   - `cert.pem` - SSL certificate
   - `key.pem` - Private key
2. Update `nginx.conf` SSL paths
3. Restart Nginx: `sudo systemctl restart nginx`

## 📊 Monitoring & Maintenance

### Health Checks

Run automated health checks:

```bash
cd deployment
./health_check.sh
```

Checks:

- ✅ Python API endpoints (predictions, analytics, dataset)
- ✅ Nuxt app pages
- ✅ Service availability

### Automated Backups

Schedule daily backups with cron:

```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/matlab-mobile-dataset/infrastructure/scripts/backup.sh --full

# Add incremental backup every 6 hours
0 */6 * * * /var/www/matlab-mobile-dataset/infrastructure/scripts/backup.sh
```

Manual backup:

```bash
cd deployment
./backup.sh --full  # Full backup
./backup.sh         # Incremental backup
```

Backups include:

- 📦 Trained models (`.pkl`, `.h5`)
- 📊 Dataset CSV
- 🔧 MATLAB preprocessed data
- ⚙️ Configuration files
- 📈 Analytics results

### Performance Monitoring

**Application Logs:**

```bash
# Python API
sudo journalctl -u python-api -f --since "1 hour ago"

# Nuxt app
sudo journalctl -u nuxt-app -f --since "1 hour ago"

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

**Resource Usage:**

```bash
# CPU/Memory
htop

# Resource usage monitoring for local processes
ps aux --sort=-%mem | head -n 20

# Disk usage
df -h
```

## 🔧 Troubleshooting

### Python API Issues

**API not responding:**

```bash
# Check service status
sudo systemctl status python-api

# View logs
sudo journalctl -u python-api -n 100

# Restart service
sudo systemctl restart python-api
```

**Missing trained models:**

```bash
# Verify models exist
ls -lh python_api/trained_models/

# Check permissions
sudo chown -R www-data:www-data python_api/trained_models/
```

### Nuxt App Issues

**Build failures (oxc-parser native binding error):**

This error occurs due to an npm bug with optional dependencies. To fix:

```bash
# Clean npm artifacts and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**In CI/CD workflows**, ensure cleanup before install:

```yaml
- name: Clean up npm modules and lock file
  run: rm -rf node_modules package-lock.json

- name: Install dependencies
  run: npm install
```

Reference: [npm bug report](https://github.com/npm/cli/issues/4828)

**Port conflicts:**

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Nginx Issues

**Configuration test:**

```bash
sudo nginx -t
```

**SSL certificate errors:**

```bash
# Renew Let's Encrypt
sudo certbot renew --force-renewal

# Reload Nginx
sudo systemctl reload nginx
```

### Database/Cache Issues

**Redis connection errors:**

```bash
# Check Redis status
sudo systemctl status redis-server

# Test connection
redis-cli ping  # Should return "PONG"

# Restart Redis
sudo systemctl restart redis-server
```

## 🔄 Updates & Rollbacks

### Deploy Updates

```bash
# Pull latest code
cd /var/www/matlab-mobile-dataset
git pull origin main

# Update Python dependencies
source venv/bin/activate
pip install -r python_api/requirements.txt

# Rebuild Nuxt app
npm ci
npm run build

# Restart services
sudo systemctl restart python-api nuxt-app
```

### Rollback

```bash
# Revert to previous commit
git log --oneline  # Find commit hash
git checkout <commit-hash>

# Rebuild and restart
npm run build
sudo systemctl restart python-api nuxt-app
```

## 📈 Performance Optimization

### Caching

Redis caching is enabled for analytics endpoints. Configure TTL in `.env.production`:

```bash
REDIS_CACHE_TTL=3600  # 1 hour
```

### Load Balancing / Scaling

Scale Python API workers using systemd templates (recommended):

```bash
sudo cp infrastructure/systemd/python-api.service /etc/systemd/system/python-api@.service
sudo systemctl daemon-reload
sudo systemctl start python-api@{1..4}
```

### CDN Integration

For static assets, use a CDN like Cloudflare:

1. Point DNS to Cloudflare
2. Enable caching for `/_nuxt/*` and `/images/*`
3. Configure edge caching rules

## 🆘 Support

- **Documentation:** See project README and guides in `docs/`
- **Logs Location:** `/var/log/nginx/`, `journalctl -u <service>`
- **Backup Location:** `/var/backups/matlab-mobile-dataset/`

## 🔐 Security Checklist

- [ ] Change default `NUXT_API_SECRET` in `.env.production`
- [ ] Configure proper CORS origins (not `*`)
- [ ] Enable SSL/TLS with Let's Encrypt
- [ ] Set up firewall (ufw): Allow 80, 443, block 8000/3000 externally
- [ ] Regular system updates: `sudo apt-get update && sudo apt-get upgrade`
- [ ] Monitor logs for suspicious activity
- [ ] Enable fail2ban for brute-force protection
- [ ] Regular backups (automated via cron)

## 📝 Production Checklist

Before going live:

- [ ] Environment variables configured (`.env.production`)
- [ ] SSL certificate installed and tested
- [ ] Health checks passing (`./health_check.sh`)
- [ ] Backups scheduled (cron)
- [ ] Monitoring set up (logs, resource usage)
- [ ] CORS origins restricted
- [ ] Firewall configured
- [ ] DNS configured
- [ ] Load testing completed
- [ ] Documentation updated

---

**Ready to deploy?** Use the Traditional Server Deployment (SSH & systemd) for robust production deployments. Containerized options are legacy/optional and not required.
