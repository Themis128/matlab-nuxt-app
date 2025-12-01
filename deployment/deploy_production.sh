#!/bin/bash
set -e

# MATLAB Mobile Dataset Production Deployment Script
# Usage: ./deploy_production.sh

echo "====================================="
echo "MATLAB Mobile Dataset - Production Deployment"
echo "====================================="

# Configuration
PROJECT_DIR="/var/www/matlab-mobile-dataset"
VENV_DIR="$PROJECT_DIR/venv"
BACKUP_DIR="/var/backups/matlab-mobile-dataset"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo"
    exit 1
fi

# 1. System update
log_info "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# 2. Install dependencies
log_info "Installing system dependencies..."
apt-get install -y \
    python3.14 python3.14-venv python3-pip \
    nodejs npm \
    nginx \
    git \
    curl \
    redis-server

# 3. Backup current deployment
log_info "Creating backup..."
mkdir -p "$BACKUP_DIR"
if [ -d "$PROJECT_DIR" ]; then
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" \
        -C "$PROJECT_DIR" \
        python_api/trained_models \
        data \
        .env.production 2>/dev/null || log_warn "Some files may not exist yet"
fi

# 4. Clone/update repository
if [ ! -d "$PROJECT_DIR" ]; then
    log_info "Cloning repository..."
    git clone <YOUR_REPO_URL> "$PROJECT_DIR"
else
    log_info "Updating repository..."
    cd "$PROJECT_DIR"
    git pull origin main
fi

cd "$PROJECT_DIR"

# 5. Setup Python environment
log_info "Setting up Python virtual environment..."
if [ ! -d "$VENV_DIR" ]; then
    python3.14 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r python_api/requirements.txt

# 6. Setup Node.js environment
log_info "Installing Node.js dependencies..."
npm ci

# 7. Build Nuxt app
log_info "Building Nuxt app..."
npm run build

# 8. Setup environment variables
if [ ! -f ".env.production" ]; then
    log_warn "Creating .env.production from template..."
    cp .env.production.template .env.production
    log_warn "Please update .env.production with actual values!"
fi

# 9. Setup systemd services
log_info "Installing systemd services..."
cp infrastructure/systemd/python-api.service /etc/systemd/system/
cp infrastructure/systemd/nuxt-app.service /etc/systemd/system/
systemctl daemon-reload

# 10. Setup Nginx
log_info "Configuring Nginx..."
cp infrastructure/nginx/nginx.conf /etc/nginx/sites-available/matlab-mobile-dataset
ln -sf /etc/nginx/sites-available/matlab-mobile-dataset /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

# 11. Set permissions
log_info "Setting permissions..."
chown -R www-data:www-data "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"

# 12. Start services
log_info "Starting services..."
systemctl enable redis-server
systemctl start redis-server

systemctl enable python-api
systemctl restart python-api

systemctl enable nuxt-app
systemctl restart nuxt-app

systemctl restart nginx

# 13. Health check
log_info "Running health checks..."
sleep 10

if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    log_info "✓ Python API is healthy"
else
    log_error "✗ Python API health check failed"
fi

if curl -f http://localhost:3000/ >/dev/null 2>&1; then
    log_info "✓ Nuxt app is healthy"
else
    log_error "✗ Nuxt app health check failed"
fi

# 14. Show status
log_info "Service status:"
systemctl status python-api --no-pager -l
systemctl status nuxt-app --no-pager -l

echo ""
echo "====================================="
log_info "Deployment complete!"
echo "====================================="
echo "Python API: http://localhost:8000"
echo "Nuxt App: http://localhost:3000"
echo "Logs: journalctl -u python-api -u nuxt-app -f"
echo "====================================="
