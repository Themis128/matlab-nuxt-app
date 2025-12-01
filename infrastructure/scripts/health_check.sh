#!/bin/bash
# Simple health check script (moved to infrastructure/scripts)
set -e

echo "Running health checks"

if curl -f http://localhost:8000/health >/dev/null 2>&1; then
  echo "Python API healthy: OK"
else
  echo "Python API healthy: FAIL"
fi

if curl -f http://localhost:3000/ >/dev/null 2>&1; then
  echo "Nuxt app healthy: OK"
else
  echo "Nuxt app healthy: FAIL"
fi
