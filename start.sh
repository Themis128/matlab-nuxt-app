#!/bin/bash
# Replit startup script for Mobile Finder App
# Optimized to prevent disk quota exceeded errors

echo "🚀 Starting Mobile Finder App on Replit..."

# Clean up temporary files and caches to free disk space
echo "🧹 Cleaning up temporary files..."
rm -rf /tmp/npm-cache/* 2>/dev/null || true
rm -rf .nuxt/cache 2>/dev/null || true
rm -rf .output/cache 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Clean npm cache to free up space
echo "🗑️  Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install --prefer-offline --no-audit --no-fund
else
    echo "✅ Node.js dependencies already installed"
fi

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "🐍 Installing Python dependencies..."
    python3 -m pip install --user --no-cache-dir -r requirements.txt 2>/dev/null || echo "⚠️  Python dependencies installation failed (continuing anyway)"
fi

# Start Python API in background
echo "🐍 Starting Python API..."
cd python_api
python3 api.py &
PYTHON_PID=$!
cd ..

# Wait for Python API to start
echo "⏳ Waiting for Python API to be ready..."
sleep 5

# Start Nuxt dev server
echo "🌐 Starting Nuxt development server..."
npm run dev

# Cleanup on exit
trap "echo '🛑 Stopping servers...'; kill $PYTHON_PID 2>/dev/null; exit" INT TERM EXIT
