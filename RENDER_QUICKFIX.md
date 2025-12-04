# 🚀 Quick Fix: Render Shows Python API Instead of Web Interface

## Problem

When you access your Render deployment URL (e.g., `https://matlab-nuxt-app-2.onrender.com`), you see:

```json
{ "message": "Mobile Phone Prediction API", "status": "running" }
```

**Instead of** the Nuxt web interface with forms and visualizations.

## Solution: You need to access the FRONTEND service, not the API service

### Option A: If You Used render.yaml Blueprint (Recommended)

You have **two services** deployed:

1. **Backend API** (matlab-python-api.onrender.com) - Returns JSON ❌ Not for users
2. **Frontend Web** (matlab-nuxt-frontend.onrender.com) - Web interface ✅ **Use this URL**

**Action**: Access `https://matlab-nuxt-frontend.onrender.com` instead

---

### Option B: If You Manually Created a Service

Your service is running Python API instead of Nuxt frontend.

**Quick Fix - Update Your Service**:

1. Go to Render Dashboard → Your Service → Settings
2. Update **Start Command** to:
   ```bash
   bash start_nuxt_only.sh
   ```
3. Save and redeploy

Or **Delete and Redeploy Correctly**:

1. **Delete** the incorrectly configured service
2. Deploy using **Blueprint** method (see below)

---

## How to Deploy Correctly (Blueprint Method)

### Step 1: Go to Render Dashboard

Visit: https://dashboard.render.com

### Step 2: Create Blueprint Deployment

1. Click **"New"** → **"Blueprint"**
2. Select your repository: `Themis128/matlab-nuxt-app`
3. Render auto-detects `render.yaml`
4. Click **"Apply"**

### Step 3: Wait for Deployment (5-10 minutes)

Two services will be created:

- `matlab-python-api` - Backend
- `matlab-nuxt-frontend` - Frontend ⭐

### Step 4: Access the Correct URL

✅ **Main App (for users)**: `https://matlab-nuxt-frontend.onrender.com`

❌ **Don't use**: `https://matlab-python-api.onrender.com` (this is internal API)

---

## Alternative: Single-Service Deployment

If you want just ONE service that runs both:

### Step 1: Create Service with These Settings

**Dashboard → New → Web Service**

- **Name**: `matlab-nuxt-app`
- **Runtime**: **Node**
- **Build Command**:
  ```bash
  npm ci && npm run build && pip install -r requirements.txt && cd python_api && python train_models_sklearn.py
  ```
- **Start Command**:
  ```bash
  bash start.sh
  ```

### Step 2: Set Environment Variables

- `NODE_ENV` = `production`
- `HOST` = `0.0.0.0`
- `PORT` = `3000`
- `NUXT_PUBLIC_API_BASE` = `http://localhost:8000`

---

## Verification

### ✅ Correct (Frontend Working)

When you visit your URL, you should see:

- Navigation menu
- "Price Prediction", "Explore Dataset" pages
- Forms to input phone specs
- Charts and visualizations

### ❌ Wrong (API Instead of Frontend)

If you see JSON like this, you're on the API service:

```json
{ "message": "Mobile Phone Prediction API", "status": "running" }
```

**Fix**: Use the frontend service URL instead (see above)

---

## Still Need Help?

Read the comprehensive guide: [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)

Or check:

- Render Dashboard logs for errors
- Ensure service names match render.yaml
- Verify you're accessing the frontend URL
