#!/bin/bash
# Start script for Nuxt frontend only
# Use this if you want to run ONLY the frontend service on Render
# (with the API running as a separate service)

echo "🚀 Starting Nuxt Frontend Service..."

# Set environment variables
export NODE_ENV=production
export HOST=0.0.0.0
export PORT=${PORT:-3000}

# Display configuration
echo "📋 Configuration:"
echo "  - Environment: $NODE_ENV"
echo "  - Host: $HOST"
echo "  - Port: $PORT"
echo "  - API Base: ${NUXT_PUBLIC_API_BASE:-https://matlab-python-api.onrender.com}"

# Start Nuxt in preview mode (production)
echo ""
echo "⚡ Starting Nuxt.js in production mode..."
npm run preview
