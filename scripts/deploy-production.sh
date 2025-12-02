#!/bin/bash

# Replit Production Deployment Script for Mobile Finder App
# Starts both Python API and Nuxt.js production frontend

echo "🚀 Starting Mobile Finder App in Production on Replit..."

# Set environment variables
export NODE_ENV=production
export HOST=0.0.0.0
export PORT=3000
export PYTHON_API_URL=http://localhost:8000
export PYTHONUNBUFFERED=1

# Function to handle cleanup on exit
cleanup() {
    echo "🛑 Shutting down production services..."
    kill $PYTHON_PID $NUXT_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Use minimal packages for Replit to stay under 2GB limit
if [ -n "$REPLIT_ENVIRONMENT" ] || [ -d "/home/runner" ]; then
    echo "📦 Detected Replit environment, using minimal packages for <2GB deployment..."
    echo "⚠️  WARNING: This deployment is optimized for <2GB disk usage!"

    # Use minimal package.json for Replit
    if [ -f "package-replit.json" ]; then
        cp package-replit.json package.json
        echo "✅ Using minimal package.json for Replit"
    fi

    # Install minimal Node.js dependencies
    npm install --production --quiet

    # Install ultra-lightweight Python requirements
    cd python_api
    pip install -r requirements-replit.txt --quiet
    cd ..
else
    echo "📦 Installing full requirements for development..."
    npm install --quiet
    cd python_api
    pip install -r requirements.txt --quiet
    cd ..
fi

python api.py &
PYTHON_PID=$!
cd ..

# Wait a moment for Python API to start
sleep 5

# Check if Python API is running
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo "❌ Python API failed to start"
    exit 1
fi

echo "✅ Python API running on port 8000 (PID: $PYTHON_PID)"

# Build Nuxt app if not already built
if [ ! -d ".output" ]; then
    echo "🔨 Building Nuxt application..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Nuxt build failed"
        kill $PYTHON_PID 2>/dev/null
        exit 1
    fi
    echo "✅ Nuxt build completed"
fi

# Start Nuxt.js production server
echo "⚡ Starting Nuxt.js production server..."
npm run preview &
NUXT_PID=$!

# Wait a moment for Nuxt to start
sleep 5

# Check if Nuxt is running
if ! kill -0 $NUXT_PID 2>/dev/null; then
    echo "❌ Nuxt.js production server failed to start"
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi

echo "✅ Nuxt.js production server running on port 3000 (PID: $NUXT_PID)"
echo ""
# Calculate and display app size
echo ""
echo "📊 App Size Information:"
echo "=========================="

# Calculate total app size
TOTAL_SIZE=$(du -sh . --exclude=.git --exclude=node_modules --exclude=python_api/__pycache__ --exclude=.nuxt 2>/dev/null | cut -f1)
if [ -n "$TOTAL_SIZE" ]; then
    echo "📁 Total App Size (excluding caches): $TOTAL_SIZE"
fi

# Calculate Python API size
if [ -d "python_api" ]; then
    PYTHON_SIZE=$(du -sh python_api --exclude=__pycache__ 2>/dev/null | cut -f1)
    echo "🐍 Python API Size: $PYTHON_SIZE"
fi

# Calculate Node.js/Frontend size
if [ -d "node_modules" ]; then
    NODE_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo "📦 Node Modules Size: $NODE_SIZE"
fi

if [ -d ".output" ]; then
    BUILD_SIZE=$(du -sh .output 2>/dev/null | cut -f1)
    echo "🏗️  Built App Size: $BUILD_SIZE"
fi

# Calculate data directory size
if [ -d "data" ]; then
    DATA_SIZE=$(du -sh data 2>/dev/null | cut -f1)
    echo "📊 Data Directory Size: $DATA_SIZE"
fi

echo "=========================="
echo ""

echo "🎉 Production deployment is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait
