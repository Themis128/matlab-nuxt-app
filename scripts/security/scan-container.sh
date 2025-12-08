#!/bin/bash
# Container Security Scanning Script
# Builds Docker image and scans it with Snyk

set -e

IMAGE_NAME="matlab-app"
IMAGE_TAG="${1:-latest}"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🔒 Starting Container Security Scan"
echo "===================================="
echo ""

# Check if Snyk is installed
if ! command -v snyk &> /dev/null; then
    echo "❌ Snyk CLI is not installed"
    echo "Install it with: npm install -g snyk"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    exit 1
fi

# Build Docker image
echo "📦 Building Docker image: ${FULL_IMAGE_NAME}"
docker build -t "${FULL_IMAGE_NAME}" .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo ""
echo "✅ Docker image built successfully"
echo ""

# Scan with Snyk
echo "🔍 Scanning container with Snyk..."
echo ""

snyk container test "${FULL_IMAGE_NAME}" \
    --severity-threshold=high \
    --fail-on=upgradable \
    --json > snyk-container-results.json 2>&1 || true

# Display results
if [ -f snyk-container-results.json ]; then
    echo ""
    echo "📊 Scan Results:"
    echo "================"
    snyk container test "${FULL_IMAGE_NAME}" --severity-threshold=high || true
fi

echo ""
echo "✅ Container scan completed"
echo ""
echo "📄 Full results saved to: snyk-container-results.json"
