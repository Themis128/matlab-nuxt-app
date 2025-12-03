#!/bin/bash

set -euo pipefail

# This script starts the API and frontend in a tmux session so logs are visible in separate panes.
SESSION_NAME="dev"
API_CMD="cd /workspace/python_api && python api.py"
FRONTEND_CMD="cd /workspace && npm run dev"

# Create tmux session if not exists
if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux not installed. Install tmux in the devcontainer to automatically start servers in separate panes."
  exit 0
fi

if tmux has-session -t "${SESSION_NAME}" 2>/dev/null; then
  echo "Tmux session '${SESSION_NAME}' already running. Skipping start."
  exit 0
fi

# Start new tmux session with API and frontend in side-by-side panes
# Left pane: API, Right pane: Frontend

echo "Starting tmux session '${SESSION_NAME}' (API + Frontend)..."

# Avoid attaching: create session and split
# API pane
tmux new-session -d -s "${SESSION_NAME}" -n api "bash -lc '${API_CMD}'"
# Split and run frontend
tmux split-window -h -t "${SESSION_NAME}" "bash -lc '${FRONTEND_CMD}'"

# Optional: set layout to even-horizontal
tmux select-layout -t "${SESSION_NAME}" even-horizontal || true

echo "Tmux session '${SESSION_NAME}' started: tmux attach -t ${SESSION_NAME} to view logs in panes."

exit 0
