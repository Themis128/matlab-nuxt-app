# Environment Setup Guide

Complete guide for setting up MATLAB, Python, and Node.js development environments.

## Quick Setup (Windows)

```powershell
# 1. Python virtual environment
.\scripts\setup_python_env.bat
.\scripts\activate_python_env.bat
pip install -r requirements.txt

# 2. Node.js dependencies
npm install

# 3. MATLAB environment (in MATLAB console)
cd('matlab')
run('setup_matlab_env.m')
```

## Detailed Setup

### Prerequisites

#### Required Software

| Software    | Version | Purpose                                  |
| ----------- | ------- | ---------------------------------------- |
| **MATLAB**  | R2026a  | Deep Learning Toolbox, model training    |
| **Python**  | 3.14+   | FastAPI server, scikit-learn predictions |
| **Node.js** | 18+     | Nuxt 4 development                       |
| **Git**     | Latest  | Version control                          |

#### Optional Hardware

- **GPU**: NVIDIA RTX 3070 (7.46GB VRAM) or equivalent
  - Enables GPU-accelerated training in MATLAB
  - Auto-detected by `setup_matlab_env.m`
  - CPU fallback available

### Python Environment

#### 1. Create Virtual Environment

```powershell
# Windows
.\scripts\setup_python_env.bat

# Linux/Mac
chmod +x scripts/setup_python_env.sh
./scripts/setup_python_env.sh
```

#### 2. Activate Environment

```powershell
# Windows
.\scripts\activate_python_env.bat

# Linux/Mac
source venv/bin/activate
```

#### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

**Key Dependencies:**

- `fastapi` - API server framework
- `uvicorn` - ASGI server
- `scikit-learn` - Primary ML models
- `pandas` - Data manipulation
- `numpy` - Numerical computing
- `joblib` - Model serialization
- `pydantic` - Data validation

#### 4. Verify Installation

```powershell
python -c "import sklearn, pandas, fastapi; print('✓ All packages installed')"
```

### MATLAB Environment

#### 1. Required Toolboxes

Check toolbox availability in MATLAB:

```matlab
cd('matlab')
run('setup_matlab_env.m')
```

**Required Toolboxes:**

- Deep Learning Toolbox
- Statistics and Machine Learning Toolbox
- Parallel Computing Toolbox (for GPU)

**Optional:**

- Computer Vision Toolbox
- Image Processing Toolbox

#### 2. GPU Configuration

```matlab
% Check GPU availability
gpuDevice
```

**Expected Output:**

```
CUDADevice with properties:
                      Name: 'NVIDIA GeForce RTX 3070'
         ComputeCapability: '8.6'
            SupportsDouble: 1
  GraphicsDriverVersion: '536.23'
              TotalMemory: 8.0000e+09 bytes
          AvailableMemory: 7.4600e+09 bytes
```

If no GPU detected, training will automatically fall back to CPU.

#### 3. Path Configuration

The `setup_matlab_env.m` script automatically:

- Adds `examples/` to path
- Adds `mobiles-dataset-docs/` to path
- Verifies toolbox licenses
- Checks GPU availability
- Reports system configuration

### Node.js Environment

#### 1. Install Dependencies

```powershell
npm install
```

**Key Dependencies:**

- `nuxt` (4.2.1) - Framework
- `vue` (3.5.x) - UI library
- `@nuxt/ui` - Component library
- `pinia` - State management
- `@playwright/test` - E2E testing
- `eslint`, `prettier` - Code quality

#### 2. Development Server

```powershell
# Nuxt only
npm run dev

# Nuxt + Python API (recommended)
npm run dev:all
```

#### 3. VS Code Extensions

Install recommended extensions when prompted, or manually:

```
code --install-extension mechatroner.rainbow-csv
code --install-extension esbenp.prettier-vscode
code --install-extension vue.volar
code --install-extension ms-python.python
```

## Configuration Files

### Python Configuration

**`.env`** (create if not exists):

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
PYTHON_API_URL=http://localhost:8000
PYTHONIOENCODING=utf-8
```

### MATLAB Configuration

**`config/matlab.config.json`**:

```json
{
  "installPath": "C:\\Program Files\\MATLAB\\R2026a",
  "indexWorkspace": true,
  "connectionTiming": "onStart"
}
```

### VS Code Configuration

**`.vscode/settings.json`** (already configured):

- MATLAB syntax highlighting
- Python environment selection
- Prettier as default formatter
- ESLint validation
- Rainbow CSV for datasets
- Iconify IntelliSense

## Verification

### Check All Capabilities

```powershell
npm run check
```

**Expected Output:**

```
✓ MATLAB R2026a detected
✓ Deep Learning Toolbox available
✓ GPU: NVIDIA GeForce RTX 3070 (7.46GB)
✓ Python 3.14.0 (venv active)
✓ Node.js 18.x.x
✓ All dependencies installed
```

### Test Python API

```powershell
# Terminal 1: Start API
cd python_api
python api.py

# Terminal 2: Test endpoint
curl http://localhost:8000/api/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "python_version": "3.14.0",
  "models_loaded": ["price", "ram", "battery", "brand"]
}
```

### Test Nuxt Development Server

```powershell
npm run dev
```

Visit: `http://localhost:3000`

## Troubleshooting

### Python Issues

**Problem**: `ModuleNotFoundError: No module named 'sklearn'`

```powershell
# Ensure venv is activated
.\scripts\activate_python_env.bat

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

**Problem**: Port 8000 already in use

```powershell
# Find process using port
netstat -ano | findstr :8000

# Kill process (replace <PID>)
taskkill /PID <PID> /F
```

### MATLAB Issues

**Problem**: `Undefined function or variable`

```matlab
% Re-run setup to add paths
run('matlab/setup_matlab_env.m')

% Manually add paths
addpath('examples')
addpath('mobiles-dataset-docs')
```

**Problem**: GPU not detected

```matlab
% Check CUDA drivers
!nvidia-smi

% Verify Parallel Computing Toolbox
license('test', 'Distrib_Computing_Toolbox')
```

### Node.js Issues

**Problem**: `Port 3000 already in use`

```powershell
# Change port in terminal
PORT=3001 npm run dev
```

**Problem**: ESLint errors after update

```powershell
# Clear cache
rm -rf node_modules/.cache
npm run lint:fix
```

## Platform-Specific Notes

### Windows

- Use PowerShell (not CMD) for scripts
- Python venv activation: `.\venv\Scripts\Activate.ps1`
- Line endings: Automatically handled by EditorConfig (LF)

### Linux/macOS

- Make scripts executable: `chmod +x scripts/*.sh`
- Python venv activation: `source venv/bin/activate`
- MATLAB path may differ: update `config/matlab.config.json`

## Production Deployment

### Python API

```powershell
# Install production dependencies only
pip install fastapi uvicorn[standard] scikit-learn pandas numpy joblib

# Start with multiple workers
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

### Nuxt Application

```powershell
# Build for production
npm run build

# Preview locally
npm run preview

# Deploy .output/ directory to hosting service
```

### Docker (Optional)

Create `Dockerfile`:

```dockerfile
FROM python:3.14-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY python_api/ ./python_api/
COPY data/ ./data/

CMD ["uvicorn", "python_api.api:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```powershell
docker build -t matlab-nuxt-api .
docker run -p 8000:8000 matlab-nuxt-api
```

## Next Steps

1. ✅ Environment setup complete
2. 📊 [Train models](../mobiles-dataset-docs/README.md)
3. 🧪 [Run tests](../tests/README.md)
4. 🚀 [Deploy application](README.md#deployment)

---

**Last Updated**: November 29, 2025
