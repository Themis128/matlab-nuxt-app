#!/bin/bash
# Bash script to start Docker containers
# Usage: ./scripts/docker/start-containers.sh

set -e

echo "🐳 Starting Docker containers..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Start containers
echo "📦 Building and starting containers..."
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo "✅ Containers started successfully!"
    echo ""
    echo "📊 Container Status:"
    docker-compose ps
    echo ""
    echo "🌐 Services available at:"
    echo "   Frontend: http://localhost:3000"
    echo "   API:      http://localhost:8000"
    echo ""
    echo "📝 View logs with: docker-compose logs -f"
else
    echo "❌ Failed to start containers. Check logs above."
    exit 1
fi
