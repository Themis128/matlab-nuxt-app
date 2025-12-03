#!/bin/bash

# Render Deployment Script for Mobile Finder App
# Starts both Python API and Nuxt.js frontend

echo "🚀 Starting Mobile Finder App on Render..."

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

# Wait a moment for Python API to start
sleep 3

# Check if Python API is running
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo "❌ Python API failed to start"
    exit 1
fi

echo "✅ Python API running on port 8000 (PID: $PYTHON_PID)"

# Wait a bit more for API to be fully ready
sleep 2

# Test API endpoints
echo "🔍 Testing API endpoints..."
cd python_api
python test_api.py
TEST_EXIT_CODE=$?
cd ..

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "❌ API endpoint tests failed"
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi

echo "✅ API endpoints are responding correctly"

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
