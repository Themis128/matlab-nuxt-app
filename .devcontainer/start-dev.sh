#!/bin/bash

# Devcontainer helper script that runs health-check and then the start script
set -euo pipefail

echo "Running devcontainer health check..."
./.devcontainer/health-check.sh || true

echo "Starting dev server (frontend + python api)..."
./scripts/shell/start.sh
