# Python Prediction API

FastAPI server providing Python alternatives to MATLAB prediction functions.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python api.py

# API will be available at http://localhost:8000
```

## API Endpoints

**Core Endpoints:**

- `GET /` - API info
- `GET /health` - Health check
- `POST /api/predict/price` - Predict price (sklearn models)
- `POST /api/predict/ram` - Predict RAM
- `POST /api/predict/battery` - Predict battery
- `POST /api/predict/brand` - Predict brand

**Production Distilled Model (NEW - 12× Faster!):**

- `POST /api/distilled/predict/price` - Fast price prediction (distilled tree, <1ms)
- `GET /api/distilled/info` - Model metadata (features, performance benchmarks)
- `GET /api/distilled/health` - Distilled model health check

**Performance Comparison:**
| Endpoint | Model | Latency | Accuracy |
|----------|-------|---------|----------|
| `/api/predict/price` | GradientBoosting | 0.69ms | RMSE $25,108 |
| **`/api/distilled/predict/price`** | **Distilled Tree** | **0.058ms** ⚡ | **RMSE $32,366** |

_Distilled model: 12× faster, 97.6% smaller (14.5 KB), 71% accuracy retention_

## Example Request

```bash
curl -X POST http://localhost:8000/api/predict/price \
  -H "Content-Type: application/json" \
  -d '{
    "ram": 8,
    "battery": 4000,
    "screen": 6.1,
    "weight": 174,
    "year": 2024,
    "company": "Apple"
  }'
```

## Integration with Nuxt

Set environment variable:

```bash
export PYTHON_API_URL=http://localhost:8000
```

Nuxt endpoints will automatically use Python API if available.

## Optional Dependencies: LanceDB & Upload Support ⚠️

This project includes optional features for storing and searching multimodal data using LanceDB
and for accepting multipart/form-data uploads in the FastAPI server. These features are not
required for basic prediction endpoints and are intentionally optional so the API can run
in minimal environments (e.g., test or CI).

What these enable:
- `lancedb`: Persistent, search-friendly dataset and image storage with vector search/indexing
  features (used by `lancedb_utils.py` and `lancedb_endpoints.py`).
- `python-multipart`: Required by FastAPI to parse `multipart/form-data` requests for file uploads
  (enables `/api/lancedb/upload/*` endpoints).

## LanceDB Cloud Deployment

LanceDB supports both local OSS deployment and cloud deployment for production use:

### Cloud Deployment (Recommended for Production)

1. **Sign up for LanceDB Cloud** at [https://lancedb.com/cloud](https://lancedb.com/cloud)

2. **Set environment variables** for cloud connection:

```bash
# Required for cloud deployment
export LANCEDB_CLOUD_URI="your-cloud-database-uri"
export LANCEDB_API_KEY="your-api-key"
export LANCEDB_REGION="us-east-1"  # or your preferred region

# Optional: Ollama configuration for embeddings
export OLLAMA_BASE_URL="http://localhost:11434"
export OLLAMA_EMBEDDING_MODEL="nomic-embed-text:latest"
```

3. **Cloud Features Available:**
   - ✅ **Scalable Storage**: Automatic scaling based on usage
   - ✅ **High Availability**: Multi-region replication
   - ✅ **Backup & Recovery**: Automated backups with point-in-time recovery
   - ✅ **Security**: Enterprise-grade security with encryption at rest
   - ✅ **Monitoring**: Built-in performance monitoring and alerting
   - ✅ **Vector Search**: Optimized vector similarity search at scale

### Local OSS Deployment (Development/Testing)

For development and testing, LanceDB runs locally without cloud dependencies:

```bash
# No environment variables needed - uses local storage
# Data stored in ./lancedb_data/ directory
```

### Migration from Local to Cloud

To migrate existing local LanceDB data to cloud:

1. **Export local data** (if needed):
```python
from lancedb_utils import get_db_manager
db = get_db_manager()
# Export logic here
```

2. **Update environment variables** with cloud credentials

3. **Redeploy application** - the code automatically detects and uses cloud configuration

### API Endpoints for LanceDB

Once configured, the following endpoints become available:

- `GET /api/lancedb/health` - Database health check
- `GET /api/lancedb/datasets` - List stored datasets
- `GET /api/lancedb/images` - List stored images
- `GET /api/lancedb/datasets/{id}` - Get specific dataset
- `GET /api/lancedb/images/{id}` - Get specific image
- `POST /api/lancedb/search` - Multimodal search
- `POST /api/lancedb/embeddings/generate` - Generate text embeddings
- `POST /api/lancedb/embeddings/store` - Store text with embeddings
- `DELETE /api/lancedb/datasets/{id}` - Delete dataset
- `DELETE /api/lancedb/images/{id}` - Delete image

Installation:

Windows PowerShell (when venv activated):
```powershell
# Activate your venv if not activated already
& ".\\venv\\Scripts\\Activate.ps1"

# Install optional packages
pip install lancedb python-multipart

# or use the optional requirements file
pip install -r requirements-optional.txt
```

Linux/macOS:
```bash
source ./venv/bin/activate
pip install lancedb python-multipart
```

Notes:
- If `lancedb` is not installed, the API now falls back to an in-memory lightweight store for
  development and testing. This fallback is not production-grade and does not persist data.
- If `python-multipart` is not installed, the file upload endpoints are **disabled** and the
  server will log a message indicating uploads are unavailable.
- After installing these packages, restart the API server to enable the full functionality.

Troubleshooting:
- If you see an error about missing shared libraries when installing `lancedb`, check your Python
  and system package manager docs (some components may require C/C++ compilers or platform
  packages like `libarrow`/`pyarrow`). You may also prefer to install `lancedb` using prebuilt
  wheels for your platform.
- For quick testing without installing optional deps, the in-memory fallback will still allow
  the module to import and basic endpoints to run (but uploads and vector search are disabled).
