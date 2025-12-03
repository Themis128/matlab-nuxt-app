#!/usr/bin/env bash
set -euo pipefail

# Remote deploy script executed on the server by SSH
DEPLOY_PATH="/var/www/matlab-mobile-dataset"
mkdir -p "$DEPLOY_PATH"
cd "$DEPLOY_PATH"

# Extract Python API
if [ -f python_api.tar.gz ]; then
  tar -xzf python_api.tar.gz -C ./ || true
fi

# Create and activate venv, install requirements
if [ ! -d ./venv ]; then
  python3 -m venv ./venv || true
fi
if [ -f ./python_api/requirements.txt ]; then
  . ./venv/bin/activate || true
  ./venv/bin/pip install --upgrade pip || true
  ./venv/bin/pip install -r ./python_api/requirements.txt || true
  deactivate || true
fi

# Extract Nuxt output
if [ -f nuxt_output.tar.gz ]; then
  tar -xzf nuxt_output.tar.gz -C ./ || true
fi

# Install node modules (production) if package.json exists in root
if [ -f ./package.json ]; then
  if command -v npm >/dev/null 2>&1; then
    npm ci --omit=dev || true
  fi
fi

# Ensure ownership
if id -u www-data >/dev/null 2>&1; then
  chown -R www-data:www-data "$DEPLOY_PATH" || true
fi

# Restart systemd services
if command -v systemctl >/dev/null 2>&1; then
  systemctl --no-block daemon-reload || true
  systemctl --no-block restart python-api.service || true
  systemctl --no-block restart nuxt-app.service || true
fi

exit 0
