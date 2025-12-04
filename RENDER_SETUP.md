# Render Deployment Setup Guide

## Important: Do NOT use `start.sh` for Render Deployment

The `start.sh` script is designed for **local development** and **Replit** only. For Render deployment, you should configure the service using the **Render Dashboard** or use the `render.yaml` blueprint file.

## Issues Fixed

### 1. Python API - Pandas Series Ambiguity Errors ✅

**Problem**: The predictions were failing with errors like:

```
The truth value of a Series is ambiguous. Use a.empty, a.bool(), a.item(), a.any() or a.all().
```

**Root Cause**: The code was using `pd.read_json(f)` to load metadata JSON files, which returns a pandas DataFrame/Series instead of a regular Python dictionary.

**Solution**: Changed to use `json.load(f)` which properly loads the JSON as a Python dictionary.

**Files Changed**:

- `python_api/predictions_sklearn.py`:
  - Added `import json` to imports
  - Changed all `pd.read_json(f)` calls to `json.load(f)` in:
    - `predict_price()` function
    - `predict_ram()` function
    - `predict_battery()` function
    - `predict_brand()` function

### 2. Nuxt.js - Command Not Found Error ✅

**Problem**: When using `start.sh`, the script failed with:

```
sh: 1: nuxt: not found
❌ Nuxt.js failed to start
```

**Root Cause**: The script was running `npm run dev` without first installing Node.js dependencies (node_modules).

**Solution**: Added dependency installation checks to `start.sh`:

- Checks if `node_modules` directory exists, and runs `PUPPETEER_SKIP_DOWNLOAD=true npm install` if missing
- Checks if Python dependencies are installed, and runs `pip install -r python_api/requirements.txt` if missing

**Files Changed**:

- `start.sh`:
  - Added Node.js dependency installation before starting Nuxt
  - Added Python dependency installation before starting API
  - Made the script executable (`chmod +x`)

## Recommended Render Configuration

### Option 1: Use render.yaml (Recommended)

The repository includes a `render.yaml` file with proper configuration for two services:

1. **Python API Service**:

   - Runtime: Python
   - Build Command: Installs dependencies and trains models
   - Start Command: `cd python_api && python api.py`
   - Health Check: `/health`

2. **Nuxt.js Frontend Service**:
   - Runtime: Node
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run preview`
   - Health Check: `/`

To use this configuration:

1. Go to Render Dashboard
2. Click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and use `render.yaml`

### Option 2: Manual Dashboard Configuration

If you prefer manual configuration:

#### Python API Service

- **Environment**: Docker or Python
- **Build Command**:
  ```bash
  pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  cd python_api && python api.py
  ```
- **Environment Variables**:
  - `PYTHON_VERSION=3.13`
  - `PORT=10000`
  - `PYTHONUNBUFFERED=1`

#### Nuxt.js Frontend Service

- **Environment**: Node
- **Build Command**:
  ```bash
  npm ci && npm run build
  ```
- **Start Command**:
  ```bash
  npm run preview
  ```
- **Environment Variables**:
  - `NODE_ENV=production`
  - `NUXT_PUBLIC_API_BASE=https://your-python-api.onrender.com`
  - `HOST=0.0.0.0`
  - `PORT=3000`

## Testing the Fixes Locally

To test the fixes locally:

```bash
# Option 1: Use start.sh (will auto-install dependencies)
chmod +x start.sh
./start.sh

# Option 2: Manual testing
# Terminal 1: Start Python API
pip install -r python_api/requirements.txt
cd python_api && python api.py

# Terminal 2: Start Nuxt
npm install
npm run dev
```

## Verification

After deployment, verify:

1. **Python API Health**: Visit `https://your-api.onrender.com/health`

   - Should return: `{"status": "healthy", "timestamp": "...", "version": "1.0.0"}`

2. **No More Errors in Logs**:

   - ✅ No "Series is ambiguous" errors
   - ✅ No "nuxt: not found" errors
   - ✅ All prediction endpoints working

3. **Test Predictions**:
   ```bash
   curl -X POST https://your-api.onrender.com/api/predict/price \
     -H "Content-Type: application/json" \
     -d '{"ram":8,"battery":4500,"screen":6.5,"weight":180,"year":2024,"company":"Apple"}'
   ```

## Troubleshooting

### If you still see "nuxt: not found"

- Make sure you're NOT using `start.sh` as the start command in Render
- Use the proper build and start commands from render.yaml

### If you still see "Series is ambiguous"

- Verify that `python_api/predictions_sklearn.py` has the latest changes
- Check that the deployment is pulling the latest code from the repository

### If predictions are returning fallback values

- This is expected if the model files are missing or have feature count mismatches
- The fallback functions ensure the API continues to work even with model issues
- Check logs for "ERROR - [Model] prediction failed: ..." messages

## Notes

- The `start.sh` script is primarily for **Replit** and **local development**
- For **production Render deployment**, always use `render.yaml` or manual dashboard configuration
- The script now includes automatic dependency installation as a safety measure
