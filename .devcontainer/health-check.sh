#!/bin/bash

set -euo pipefail

function warn() {
  echo "⚠️  $1"
}

function error() {
  echo "❌  $1"
  ERR_COUNT=$((ERR_COUNT+1))
}

echo "Running container health checks..."
ERR_COUNT=0
CI_MODE=${CI:-}

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null || echo "none")
if [ "$NODE_VERSION" == "none" ]; then
  warn "Node.js is not installed in the container. Please ensure the devcontainer image includes Node.js."
else
  echo "Node version: $NODE_VERSION"
fi

# Check npm
if ! command -v npm >/dev/null 2>&1; then
  warn "npm not found. Required for frontend commands."
else
  echo "npm version: $(npm -v)"
fi

# Check Python
if ! command -v python >/dev/null 2>&1 && ! command -v python3 >/dev/null 2>&1; then
  error "Python is not installed in container. Please ensure Python is available in the devcontainer."
else
  PY=$(command -v python || command -v python3)
  PYVER=$($PY -c "import sys; print('.'.join(map(str, sys.version_info[:3])))")
  echo "Python version: $PYVER"
  # Warn or error if Python less than 3.14
  PY_MAJOR=$(echo "$PYVER" | cut -d. -f1)
  PY_MINOR=$(echo "$PYVER" | cut -d. -f2)
  if [ "$PY_MAJOR" -lt 3 ] || ( [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 14 ] ); then
    # In CI treat as error; otherwise warn
    if [ "${CI_MODE}" = "true" ]; then
      error "Python version is less than 3.14. The project expects Python 3.14 for some features (e.g., modern libs)."
    else
      warn "Python version is less than 3.14. The project expects Python 3.14 for some features (e.g., modern libs)."
    fi
  fi
fi

# Check typescript in node_modules
if [ -f "node_modules/typescript/package.json" ]; then
  TS_VERSION=$(node -p "require('./node_modules/typescript/package.json').version")
  echo "Workspace TypeScript version: $TS_VERSION"
else
  if [ "${CI_MODE}" = "true" ]; then
    error "No TypeScript found in node_modules. Run 'npm ci' or 'npm install' to install dependencies first."
  else
    warn "No TypeScript found in node_modules. Run 'npm ci' or 'npm install' to install dependencies first."
  fi
fi

# Check the TypeScript server version (if the nightly extension is installed, we can't query it here, but we can suggest commands)
echo "If you're using the Nightly server, use: Command Palette -> 'TypeScript: Select TypeScript Version' to switch."

# Report running services (check ports)
if command -v ss >/dev/null 2>&1; then
  if ss -ltn | grep -q ':3000'; then
    echo "✔ Frontend port 3000 is listening"
  fi
  if ss -ltn | grep -q ':8000'; then
    echo "✔ Python API port 8000 is listening"
  fi
else
  echo "Note: 'ss' is not available to check ports — skipping runtime port checks."
fi

# Add a final message
echo "Health check complete."
if [ "$ERR_COUNT" -gt 0 ]; then
  echo "Detected $ERR_COUNT issue(s)."
  if [ "${CI_MODE}" = "true" ]; then
    echo "Failing because CI_MODE=true and issues were found."
    exit 1
  else
    echo "Run with CI=true to fail the check in CI or fix warnings above."
  fi
fi

exit 0
