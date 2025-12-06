# Setup & Installation Guide

> **Complete step-by-step guide to get the application running**

## Prerequisites

### Required Software

1. **Node.js** (v18+ recommended)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Python** (3.14+ recommended)
   - Download: https://www.python.org/downloads/
   - Verify: `python --version` or `python3 --version`

3. **npm** (comes with Node.js)
   - Verify: `npm --version`

4. **Git** (for cloning repository)
   - Download: https://git-scm.com/
   - Verify: `git --version`

### Optional Software

- **MATLAB** (for model training only, not required for running the app)
- **Docker** (for containerized deployment)

---

## Quick Start (Development)

### 1. Clone Repository

```bash
git clone <repository-url>
cd matlab-nuxt-app
```

### 2. Install Node.js Dependencies

```bash
npm install
```

This installs all frontend dependencies including:

- Nuxt 4.2.1
- Vue 3.5.25
- TypeScript
- All UI libraries and tools

### 3. Set Up Python Environment

#### Windows

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install Python dependencies
cd python_api
pip install -r requirements.txt
cd ..
```

#### Linux/macOS

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
cd python_api
pip install -r requirements.txt
cd ..
```

### 4. Initialize Database (Optional but Recommended)

```bash
# Create SQLite price database
cd python_api
python create_price_db.py
cd ..
```

This creates `python_api/price_database.db` from the CSV dataset.

### 5. Start the Application

#### Option A: Start Both Services Together (Recommended)

```bash
npm run dev:all
```

This starts:

- Python API on `http://localhost:8000`
- Nuxt dev server on `http://localhost:3000`

#### Option B: Start Services Separately

**Terminal 1 - Python API:**

```bash
npm run dev:python
# Or manually:
cd python_api
python api.py
```

**Terminal 2 - Nuxt Frontend:**

```bash
npm run dev
```

### 6. Verify Installation

1. **Check Python API:**
   - Open: http://localhost:8000/health
   - Should return: `{"status": "healthy"}`

2. **Check Nuxt App:**
   - Open: http://localhost:3000
   - Should show the application homepage

3. **Check API Connection:**
   - Open: http://localhost:3000/api/health
   - Should return API status

---

## Detailed Setup Instructions

### Python Environment Setup

#### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv

# Linux/macOS
python3 -m venv venv
```

#### 2. Activate Virtual Environment

```bash
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (CMD)
venv\Scripts\activate.bat

# Linux/macOS
source venv/bin/activate
```

#### 3. Install Python Dependencies

```bash
cd python_api
pip install --upgrade pip
pip install -r requirements.txt
```

**Required Dependencies:**

- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `scikit-learn` - ML models (primary)
- `pandas` - Data processing
- `numpy` - Numerical computing

**Optional Dependencies:**

- `lancedb` - Vector database (for advanced features)
- `tensorflow` - Alternative ML backend
- `python-multipart` - File upload support

#### 4. Verify Python Setup

```bash
python -c "import fastapi, sklearn, pandas; print('✓ All dependencies installed')"
```

### Node.js Environment Setup

#### 1. Install Dependencies

```bash
npm install
```

This will:

- Install all npm packages
- Run `nuxt prepare` (postinstall script)
- Set up TypeScript configuration

#### 2. Verify Node.js Setup

```bash
npm run typecheck
```

Should complete without errors (warnings are OK).

### Database Setup

#### SQLite Database (Price Database)

The SQLite database is automatically created when you run:

```bash
cd python_api
python create_price_db.py
```

**What it does:**

- Reads `data/Mobiles Dataset (2025).csv`
- Creates `price_database.db`
- Populates with mobile phone data

**Location:** `python_api/price_database.db`

#### LanceDB (Optional - Vector Database)

LanceDB is optional and only needed for:

- Semantic search
- Image storage with embeddings
- Advanced vector search features

**To enable LanceDB:**

1. Install LanceDB:

```bash
pip install lancedb
```

2. (Optional) Set up Ollama for embeddings:

```bash
# Install Ollama from https://ollama.ai
# Then pull embedding model:
ollama pull nomic-embed-text
```

3. Configure environment variables (optional):

```bash
# For cloud deployment
export LANCEDB_CLOUD_URI="your-cloud-uri"
export LANCEDB_API_KEY="your-api-key"

# For local with Ollama
export OLLAMA_BASE_URL="http://localhost:11434"
export OLLAMA_EMBEDDING_MODEL="nomic-embed-text"
```

**Note:** The app works without LanceDB - it will use fallback methods.

---

## Environment Variables

### Required (None)

The app works with defaults, but you can customize:

### Optional Environment Variables

Create a `.env` file in the project root:

```bash
# Python API URL (default: http://localhost:8000)
NUXT_PUBLIC_API_BASE=http://localhost:8000

# Disable Python API (for frontend-only development)
NUXT_PUBLIC_PY_API_DISABLED=0

# Sentry Error Tracking (optional)
SENTRY_DSN=your-sentry-dsn

# CORS Origins (Python API)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# LanceDB Cloud (optional)
LANCEDB_CLOUD_URI=your-cloud-uri
LANCEDB_API_KEY=your-api-key
LANCEDB_REGION=us-east-1

# Ollama Configuration (optional)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

---

## Troubleshooting

### Python API Issues

#### Problem: `ModuleNotFoundError`

**Solution:**

```bash
# Ensure virtual environment is activated
source venv/bin/activate  # Linux/macOS
.\venv\Scripts\activate  # Windows

# Reinstall dependencies
cd python_api
pip install -r requirements.txt
```

#### Problem: Port 8000 already in use

**Solution:**

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8000 | xargs kill -9
```

Or change port in `python_api/api.py`:

```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Change port
```

#### Problem: Database file not found

**Solution:**

```bash
cd python_api
python create_price_db.py
```

### Node.js Issues

#### Problem: `npm install` fails

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Problem: Port 3000 already in use

**Solution:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

Or change port:

```bash
npm run dev -- --port 3001
```

#### Problem: TypeScript errors

**Solution:**

```bash
# Type checking is disabled in dev mode by default
# To check types:
npm run typecheck

# If errors persist, check tsconfig.json
```

### Database Issues

#### Problem: SQLite database locked

**Solution:**

- Ensure all database connections are closed
- Restart the Python API
- Check for long-running transactions

#### Problem: LanceDB not working

**Solution:**

- Check if `lancedb` is installed: `pip list | grep lancedb`
- If not installed, the app will use fallback methods
- For full functionality: `pip install lancedb`

### API Connection Issues

#### Problem: Frontend can't connect to Python API

**Solution:**

1. Verify Python API is running: http://localhost:8000/health
2. Check `NUXT_PUBLIC_API_BASE` environment variable
3. Check CORS settings in `python_api/api.py`
4. Check firewall settings

#### Problem: CORS errors in browser

**Solution:**
Add your frontend URL to CORS origins in `python_api/api.py`:

```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://your-frontend-url:3000"
]
```

---

## Production Setup

### Build for Production

#### 1. Build Nuxt App

```bash
npm run build
```

This creates optimized production build in `.output/` directory.

#### 2. Start Production Server

```bash
npm run preview
```

Or use PM2/systemd (see deployment infrastructure).

### Production Deployment

See `infrastructure/scripts/deploy_production.sh` for complete deployment script.

**Key Steps:**

1. Install system dependencies (Node.js, Python, Nginx)
2. Set up Python virtual environment
3. Install npm dependencies
4. Build Nuxt app
5. Configure systemd services
6. Configure Nginx reverse proxy
7. Set up SSL certificates
8. Start services

---

## Verification Checklist

After setup, verify:

### Prerequisites

- [ ] Node.js installed (`node --version`)
- [ ] Python installed (`python --version`)
- [ ] npm dependencies installed (`npm list --depth=0`)
- [ ] Python dependencies installed (`pip list`)

### File Structure

- [ ] All required files exist (see [FILE_STRUCTURE.md](./FILE_STRUCTURE.md))
- [ ] `pages/index.vue` exists
- [ ] `layouts/default.vue` exists
- [ ] `python_api/api.py` exists
- [ ] `data/Mobiles Dataset (2025).csv` exists

### Database

- [ ] SQLite database created (`python_api/price_database.db` exists)

### Services

- [ ] Python API starts (`npm run dev:python`)
- [ ] Nuxt dev server starts (`npm run dev`)
- [ ] Python API health check passes (http://localhost:8000/health)
- [ ] Nuxt app loads (http://localhost:3000)
- [ ] API connection works (http://localhost:3000/api/health)

---

## Next Steps

After successful setup:

1. **Verify File Structure:**
   - [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) - Required files and directories

2. **Read Documentation:**
   - [README.md](./README.md) - Application overview
   - [API_REFERENCE.md](./API_REFERENCE.md) - API endpoints
   - [DATABASE_REFERENCE.md](./DATABASE_REFERENCE.md) - Database details

3. **Explore the App:**
   - Visit http://localhost:3000
   - Try price predictions
   - Explore dataset search
   - Test model comparisons

4. **Development:**
   - Check [PAGES_ANALYSIS.md](./PAGES_ANALYSIS.md) for page structure
   - Review [COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md) for components
   - See [STORES_REFERENCE.md](./STORES_REFERENCE.md) for state management

---

## Getting Help

If you encounter issues:

1. **Check Logs:**
   - Python API: Console output or `python_api/api_output.log`
   - Nuxt: Browser console and terminal output

2. **Verify Prerequisites:**
   - Node.js version (v18+)
   - Python version (3.14+)
   - All dependencies installed

3. **Check Documentation:**
   - [Troubleshooting](#troubleshooting) section above
   - [DATABASE_REFERENCE.md](./DATABASE_REFERENCE.md) for database issues
   - [API_REFERENCE.md](./API_REFERENCE.md) for API issues

4. **Common Solutions:**
   - Restart both services
   - Clear caches (`npm cache clean`, `pip cache purge`)
   - Reinstall dependencies
   - Check port availability

---

## Quick Reference

### Start Commands

```bash
# Start both services
npm run dev:all

# Start only Nuxt
npm run dev

# Start only Python API
npm run dev:python
```

### Build Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Utility Commands

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# Health check
npm run dev:health
```

---

**Last Updated:** December 2025
**Version:** 1.0.0
