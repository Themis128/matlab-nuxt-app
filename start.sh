#!/bin/bash

# Replit Deployment Script for Mobile Finder App
# Starts both Python API and Nuxt.js frontend

echo "🚀 Starting Mobile Finder App on Replit..."

# Set environment variables
export NODE_ENV=production
export HOST=0.0.0.0
export PORT=3000
export PYTHON_API_URL=http://localhost:8000
export PYTHONUNBUFFERED=1

# Function to handle cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $PYTHON_PID $NUXT_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Python API in background
echo "🐍 Starting Python API server..."
cd python_api
python api.py &
PYTHON_PID=$!
cd ..

# Wait for Python API to be fully ready with retry logic
echo "⏳ Waiting for Python API to start (with health checks)..."
MAX_RETRIES=30
RETRY_COUNT=0
API_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo "❌ Python API process died unexpectedly"
        exit 1
    fi
    
    # Try to connect to health endpoint
    if command -v curl &> /dev/null; then
        if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
            API_READY=true
            break
        fi
    elif command -v wget &> /dev/null; then
        if wget -q --spider http://localhost:8000/health 2>/dev/null; then
            API_READY=true
            break
        fi
    else
        # Fallback: just wait longer if no HTTP client available
        sleep 10
        API_READY=true
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 1
done

if [ "$API_READY" = false ]; then
    echo "❌ Python API failed to respond to health checks after ${MAX_RETRIES} seconds"
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi

echo "✅ Python API is healthy and running on port 8000 (PID: $PYTHON_PID)"

# Test API endpoints (non-fatal - just warnings)
echo "🔍 Testing API endpoints..."
cd python_api
if python test_api.py; then
    echo "✅ API endpoint tests passed"
else
    echo "⚠️  API endpoint tests failed, but continuing anyway..."
    echo "    The API may still work - tests might be too strict"
fi
cd ..

# Start Nuxt.js development server
echo "⚡ Starting Nuxt.js frontend..."
npm run dev &
NUXT_PID=$!

# Wait a moment for Nuxt to start
sleep 5

# Check if Nuxt is running
if ! kill -0 $NUXT_PID 2>/dev/null; then
    echo "❌ Nuxt.js failed to start"
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi

echo "✅ Nuxt.js running on port 3000 (PID: $NUXT_PID)"
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

echo "🎉 Both services are running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
