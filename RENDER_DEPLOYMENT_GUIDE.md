# Render Deployment Guide - Complete Instructions

## 🎯 Problem You're Experiencing

If you're seeing the **Python API backend** (JSON responses) instead of the **Nuxt frontend** (web interface) when accessing your deployed URL, this guide will help you fix it.

## 📋 Table of Contents

1. [Understanding the Architecture](#understanding-the-architecture)
2. [Deployment Options](#deployment-options)
3. [Option 1: Two-Service Deployment (Recommended)](#option-1-two-service-deployment-recommended)
4. [Option 2: Single-Service Deployment](#option-2-single-service-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Understanding the Architecture

This application has two components:

1. **Nuxt Frontend** (`/`) - The web interface users interact with
   - Built with Nuxt.js 4
   - Serves HTML pages, forms, visualizations
   - Runs on Node.js

2. **Python API** (`/api/*`) - The backend prediction service
   - Built with FastAPI
   - Serves JSON API responses
   - Runs ML models for predictions

**The Nuxt frontend should be the main URL that users access.**

---

## Deployment Options

### Option 1: Two-Service Deployment (Recommended)

**✅ Pros:**
- Better performance (services scaled independently)
- Easier debugging (separate logs for each service)
- Proper separation of concerns
- Automatic CORS configuration

**❌ Cons:**
- Uses two Render services (might cost more on paid plans)
- Requires managing two deployments

### Option 2: Single-Service Deployment

**✅ Pros:**
- Single deployment to manage
- Uses only one Render service

**❌ Cons:**
- All traffic goes through one service
- More complex configuration
- Shared resources between frontend and backend

---

## Option 1: Two-Service Deployment (Recommended)

This uses the existing `render.yaml` blueprint to deploy both services automatically.

### Step 1: Delete Your Current Service (If Incorrectly Configured)

If your current `matlab-nuxt-app-2` service is showing the Python backend:

1. Go to your Render Dashboard
2. Find the service `matlab-nuxt-app-2`
3. Click on it and go to **Settings** → **Delete Service**
4. Confirm deletion

### Step 2: Deploy Using Blueprint

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New" → "Blueprint"**

3. **Connect Your Repository**:
   - Select your GitHub repository: `Themis128/matlab-nuxt-app`
   - Click "Connect"

4. **Render Will Auto-Detect `render.yaml`**:
   - It will create TWO services:
     - `matlab-python-api` - Backend API
     - `matlab-nuxt-frontend` - Frontend Web App ⭐ (This is your main URL)

5. **Click "Apply"** to start deployment

### Step 3: Wait for Deployment

Both services will build and deploy. This can take 5-10 minutes.

**Monitor Build Logs** to ensure:
- ✅ Python service: Dependencies install, models train successfully
- ✅ Nuxt service: `npm run build` completes successfully

### Step 4: Access Your Application

Once deployed, you'll have two URLs:

- **Frontend (Main App)**: `https://matlab-nuxt-frontend.onrender.com` ⭐
  - **This is the URL to share with users**
  - Shows the Nuxt web interface

- **Backend API**: `https://matlab-python-api.onrender.com`
  - Internal API endpoint
  - Returns JSON (not meant for direct user access)

### Step 5: Test Your Deployment

1. **Open Frontend URL**: https://matlab-nuxt-frontend.onrender.com
2. You should see the Nuxt web interface (NOT JSON)
3. Try making a prediction to verify API integration works

---

## Option 2: Single-Service Deployment

If you prefer a single service that runs both Nuxt and Python, use this configuration.

### Step 1: Create `render-single.yaml`

Create a new file in the repository root:

```yaml
# render-single.yaml - Single service deployment
services:
  - type: web
    name: matlab-nuxt-app
    runtime: node
    buildCommand: |
      # Install Node dependencies
      npm ci
      npm run build
      
      # Install Python and dependencies
      pip install --upgrade pip setuptools wheel
      pip install -r requirements.txt
      
      # Train ML models
      cd python_api && python train_models_sklearn.py
      cd .. && python retrain_advanced_models.py
    
    startCommand: bash start.sh
    
    healthCheckPath: /
    
    envVars:
      - key: NODE_ENV
        value: production
      - key: HOST
        value: 0.0.0.0
      - key: NUXT_PORT
        value: '3000'
      - key: API_PORT
        value: '8000'
      - key: PYTHONUNBUFFERED
        value: '1'
      - key: PORT
        value: '3000'  # Render uses this port for health checks
```

### Step 2: Update `start.sh` for Production

The existing `start.sh` should work, but ensure it's configured for production:

```bash
#!/bin/bash
export NODE_ENV=production
export HOST=0.0.0.0
export NUXT_PORT=${PORT:-3000}
export API_PORT=8000

# Start Python API in background
cd python_api
python api.py &
PYTHON_PID=$!
cd ..

# Wait for API to be ready
sleep 10

# Start Nuxt frontend (main process)
npm run preview
```

### Step 3: Deploy to Render

1. **Go to Render Dashboard**
2. **Click "New" → "Web Service"**
3. **Connect Repository**: Select `Themis128/matlab-nuxt-app`
4. **Configure Service**:
   - Name: `matlab-nuxt-app`
   - Runtime: **Node**
   - Build Command: Copy from `render-single.yaml` above
   - Start Command: `bash start.sh`
5. **Click "Create Web Service"**

### Step 4: Access Your Application

Your app will be available at:
- `https://matlab-nuxt-app.onrender.com` (Shows Nuxt frontend)

---

## Troubleshooting

### Issue: Seeing JSON Instead of Web Interface

**Symptom**: When you open your URL, you see:
```json
{"message": "Mobile Phone Prediction API", "status": "running"}
```

**Cause**: You're accessing the Python API service instead of the Nuxt frontend.

**Solution**:
- If using **Two-Service Deployment**: Access the `matlab-nuxt-frontend` URL, not the `matlab-python-api` URL
- If using **Single-Service Deployment**: Check that `start.sh` starts Nuxt as the main process (not Python)

### Issue: "Cannot connect to API" Errors

**Symptom**: Frontend loads but predictions fail with connection errors.

**Cause**: Frontend can't reach the backend API.

**Solution for Two-Service Deployment**:
1. Ensure both services are running
2. Check `NUXT_PUBLIC_API_BASE` environment variable in frontend service
3. Should be set to: `https://matlab-python-api.onrender.com`
4. Ensure `CORS_ORIGINS` in Python service includes: `https://matlab-nuxt-frontend.onrender.com`

**Solution for Single-Service Deployment**:
1. Check that Python API starts before Nuxt
2. Ensure `PYTHON_API_URL` or `NUXT_PUBLIC_API_BASE` is set to `http://localhost:8000`

### Issue: Build Fails

**Symptom**: Deployment fails during build.

**Common Causes**:
1. **Missing dependencies**: Check `requirements.txt` includes all packages
2. **Model training fails**: Check logs for Python errors
3. **Nuxt build fails**: Check `package.json` scripts are correct

**Solution**:
1. Review build logs carefully
2. Test build locally: `npm run build` and `pip install -r requirements.txt`
3. Ensure all required files are committed to git

### Issue: Service Keeps Crashing

**Symptom**: Service starts but crashes after a few minutes.

**Common Causes**:
1. **Port binding issues**: Service not listening on `$PORT` environment variable
2. **Memory issues**: ML models too large for free tier
3. **Python/Node version mismatch**

**Solution**:
1. Check logs for crash reason
2. Ensure `api.py` binds to `0.0.0.0:$PORT`
3. Ensure `nuxt.config.ts` uses correct port configuration
4. Consider upgrading to paid tier for more resources

---

## Summary

**For most users**: Use **Option 1: Two-Service Deployment**

1. Delete any incorrectly configured services
2. Deploy using Render Blueprint with existing `render.yaml`
3. Access the `matlab-nuxt-frontend` URL (not `matlab-python-api`)
4. Share the frontend URL with users

**Main Takeaway**: 
- ✅ `https://matlab-nuxt-frontend.onrender.com` → Web Interface (what users see)
- ❌ `https://matlab-python-api.onrender.com` → JSON API (internal use only)

---

## Need Help?

If you're still experiencing issues:

1. Check the service logs in Render Dashboard
2. Review error messages carefully
3. Ensure environment variables are set correctly
4. Test locally using `npm run dev` and `cd python_api && python api.py`

**Common Environment Variables to Check**:

**Frontend Service**:
- `NODE_ENV=production`
- `NUXT_PUBLIC_API_BASE=https://matlab-python-api.onrender.com`

**Backend Service**:
- `CORS_ORIGINS=https://matlab-nuxt-frontend.onrender.com`
- `PORT=10000` (or whatever Render assigns)
