#!/usr/bin/env bash
set -euo pipefail
# Cross-platform 'run tests with dev servers' helper for CI and local usage
# Starts Python API and Nuxt dev server, waits for health, runs Playwright tests, then cleans up.

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

function cleanup() {
  echo "[run-tests-with-dev] Cleaning up: killing $PY_PID $NUXT_PID" || true
  if [ -n "${PY_PID:-}" ] && kill -0 "$PY_PID" 2>/dev/null; then
    kill "$PY_PID" || true
  fi
  if [ -n "${NUXT_PID:-}" ] && kill -0 "$NUXT_PID" 2>/dev/null; then
    kill "$NUXT_PID" || true
  fi
}
trap cleanup EXIT

echo "[run-tests-with-dev] Starting Python API"
if command -v python3 >/dev/null 2>&1; then
  PY="python3"
else
  PY="python"
fi
"$PY" -u python_api/api.py &
PY_PID=$!
echo "[run-tests-with-dev] Started Python API (PID: $PY_PID)"

echo "[run-tests-with-dev] Starting Nuxt dev (port 3000)"
npm run dev -- --port 3000 --hostname localhost &
NUXT_PID=$!
echo "[run-tests-with-dev] Started Nuxt dev (PID: $NUXT_PID)"

echo "[run-tests-with-dev] Waiting for services to be healthy (timeout 60s)"
END=$((SECONDS + 60))
PY_UP=false
NUXT_UP=false
while [ "$SECONDS" -lt "$END" ] && { [ "$PY_UP" = false ] || [ "$NUXT_UP" = false ]; }; do
  if [ "$PY_UP" = false ]; then
    if curl -sSf "http://localhost:8000/health" >/dev/null 2>&1; then
      PY_UP=true
      echo "[run-tests-with-dev] Python API is healthy"
    fi
  fi
  if [ "$NUXT_UP" = false ]; then
    if curl -sSf "http://localhost:3000" >/dev/null 2>&1; then
      NUXT_UP=true
      echo "[run-tests-with-dev] Nuxt dev is healthy"
    fi
  fi
  sleep 0.5
done

echo "[run-tests-with-dev] Health: Python($PY_UP) Nuxt($NUXT_UP)"
if [ "$PY_UP" = false ] || [ "$NUXT_UP" = false ]; then
  echo "[run-tests-with-dev] Warning: Not all services started in time (continuing anyway)"
fi

echo "[run-tests-with-dev] Running Playwright tests with args: $@"
env PLAYWRIGHT_TEST=1 NUXT_TEST=1 npx playwright test "$@"
EXIT_CODE=$?
exit $EXIT_CODE
