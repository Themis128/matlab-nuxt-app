#!/bin/bash
set -e

echo "Starting frontend wrapper..."
WORKDIR=/workspace
cd $WORKDIR

if [ ! -d "node_modules" ]; then
  echo "node_modules not found. Installing dependencies..."
  if [ -f "package-lock.json" ]; then
    npm ci --no-audit --no-fund || true
  else
    npm install --no-audit --no-fund || true
  fi
fi

export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-3000}

echo "Starting Nuxt dev server on ${HOST}:${PORT}"
npm run dev -- --hostname $HOST --port $PORT
