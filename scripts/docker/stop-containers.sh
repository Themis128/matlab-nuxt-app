#!/bin/bash
# Bash script to stop Docker containers
# Usage: ./scripts/docker/stop-containers.sh

set -e

echo "🛑 Stopping Docker containers..."

docker-compose down

if [ $? -eq 0 ]; then
    echo "✅ Containers stopped successfully!"
else
    echo "❌ Failed to stop containers."
    exit 1
fi
