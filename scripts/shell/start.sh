#!/bin/bash

# Replit Startup Script
# Starts both Python API and Nuxt app

echo "🚀 Starting Mobile Phone Prediction App on Replit..."
echo ""

# Function to activate venv (works on both Unix and Windows Git Bash)
activate_venv() {
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    elif [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
    else
        return 1
    fi
}

# Check if Python API is already running
if ! pgrep -f "python.*api.py" > /dev/null 2>&1; then
    echo "📦 Starting Python API..."
    cd python_api || exit 1

    # Install Python dependencies if needed
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv || python -m venv venv
    fi

    # Activate venv and install dependencies
    if activate_venv; then
        echo "Installing Python dependencies..."
        pip install -r requirements.txt --quiet --upgrade

        # Start API in background
        python api.py &
        API_PID=$!
        echo "✓ Python API started (PID: $API_PID)"
        echo "  API running on: http://0.0.0.0:8000"
    else
        echo "⚠️  Could not activate virtual environment, using system Python"
        pip install -r requirements.txt --quiet --user
        python api.py &
        API_PID=$!
        echo "✓ Python API started (PID: $API_PID)"
    fi
    cd ..
else
    echo "✓ Python API already running"
fi

# Wait for Python API to be ready
echo "⏳ Waiting for Python API to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0
API_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        API_READY=true
        echo "✓ Python API is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 1
done

if [ "$API_READY" = false ]; then
    echo "⚠️  Python API health check failed, but continuing anyway..."
    echo "   The API might still be starting. Nuxt will retry connections."
fi

# Check if models are trained
if [ ! -f "python_api/trained_models/price_predictor_sklearn.pkl" ]; then
    echo ""
    echo "⚠️  Models not trained yet. Training models..."
    echo "   This may take 5-10 minutes on first run..."
    cd python_api || exit 1
    if activate_venv; then
        python train_models_sklearn.py
    else
        python train_models_sklearn.py
    fi
    cd ..
    echo "✓ Models trained!"
else
    echo "✓ Models already trained"
fi

# Set environment variables (important for API communication)
export PYTHON_API_URL=${PYTHON_API_URL:-http://localhost:8000}
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}
export HOST=${HOST:-0.0.0.0}

echo ""
echo "📋 Environment Configuration:"
echo "  PYTHON_API_URL: $PYTHON_API_URL"
echo "  PORT: $PORT"
echo "  HOST: $HOST"
echo ""

echo ""
echo "🌐 Starting Nuxt app..."
echo "  Frontend will run on: http://0.0.0.0:$PORT"
echo ""

# Install Node dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start Nuxt
npm run dev
