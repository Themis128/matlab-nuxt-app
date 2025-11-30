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
