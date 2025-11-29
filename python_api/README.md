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

- `GET /` - API info
- `GET /health` - Health check
- `POST /api/predict/price` - Predict price
- `POST /api/predict/ram` - Predict RAM
- `POST /api/predict/battery` - Predict battery
- `POST /api/predict/brand` - Predict brand

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
