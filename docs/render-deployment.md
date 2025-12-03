# Render Deployment Guide

This guide covers deploying the MATLAB Deep Learning & Mobile Dataset Analysis application to [Render](https://render.com/), a modern cloud platform for web applications.

## 🚀 Quick Deploy to Render

### Prerequisites

1. **Render Account** - Sign up at [render.com](https://render.com/)
2. **GitHub Repository** - Your code must be in a GitHub repository
3. **Environment Variables** - Configure your secrets

### Step 1: Connect Repository

1. Go to [dashboard.render.com](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your MATLAB app

### Step 2: Configure Build Settings

#### Frontend Service (Nuxt.js)

```yaml
# render.yaml (optional - can also configure in UI)
services:
  - type: web
    name: matlab-nuxt-frontend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run preview
    envVars:
      - key: NODE_ENV
        value: production
      - key: NUXT_PUBLIC_API_BASE
        value: https://your-api-service.onrender.com
```

**Manual Configuration:**

- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`
- **Node Version**: `22` (matches `.nvmrc`)

#### Backend Service (Python FastAPI)

```yaml
- type: web
  name: matlab-python-api
  env: python
  buildCommand: pip install -r python_api/requirements.txt
  startCommand: python python_api/api.py
  envVars:
    - key: PYTHON_VERSION
      value: '3.14'
    - key: PORT
      value: '10000'
```

**Manual Configuration:**

- **Environment**: `Python`
- **Build Command**: `pip install -r python_api/requirements.txt`
- **Start Command**: `python python_api/api.py`
- **Python Version**: `3.14`

### Step 3: Environment Variables

#### Required Environment Variables

**Frontend Service:**

```env
NODE_ENV=production
NUXT_PUBLIC_API_BASE=https://your-api-service.onrender.com
```

**Backend Service:**

```env
PYTHONUNBUFFERED=1
PORT=10000
CORS_ORIGINS=https://your-frontend-service.onrender.com
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

### Step 4: Database (Optional)

If you need a database for user sessions or analytics:

```yaml
databases:
  - name: matlab-db
    databaseName: matlab_app
    user: matlab_user
    plan: free # PostgreSQL free tier
```

### Step 5: Custom Domain (Optional)

1. Go to service settings
2. Add custom domain
3. Configure DNS records as instructed

## 📋 Production Checklist

Before going live, ensure:

- [ ] ✅ **Environment variables configured**
- [ ] ✅ **CORS origins set correctly** (no wildcards!)
- [ ] ✅ **Rate limiting configured** (100 req/60s recommended)
- [ ] ✅ **Health checks working** (`/health` endpoint)
- [ ] ✅ **API documentation accessible** (`/docs`)
- [ ] ✅ **Security headers applied**
