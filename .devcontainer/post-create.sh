#!/bin/bash
set -e

echo "Running post-create steps for devcontainer..."

# Set up Python virtual environment and install requirements for the API
# The API service installs its dependencies during build (Dockerfile.api). The frontend will install node deps below.

# Install frontend dependencies
if [ -f "package.json" ]; then
  echo "Installing Node dependencies (root workspace / workspace)"
  # npm ci is faster and more deterministic if package-lock exists
  if [ -f "package-lock.json" ]; then
    npm ci --no-audit --no-fund || true
  else
    npm install --no-audit --no-fund || true
  fi
fi

# Install Python dev/test deps if present
if [ -f "requirements.txt" ]; then
  python -m pip install -r requirements.txt || true
fi

echo "Note: The API service is built from Dockerfile.api and has its Python dependencies pre-installed during image build."

echo "Devcontainer post-create completed."
