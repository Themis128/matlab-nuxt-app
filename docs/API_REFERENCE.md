# API Reference Documentation

> **Last Updated**: December 2025
> **Base URL**: `http://localhost:3000` (Nuxt) → `http://localhost:8000` (Python)

## API Architecture

The application uses a **two-layer API architecture**:

1. **Nuxt Server API** (`/server/api/*`) - Nitro routes that proxy to Python
2. **Python FastAPI** (`/api/*`) - Direct ML model inference

---

## Nuxt Server API Routes

### Health & Status

#### `GET /api/health`

Check Python API health status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-12-05T23:44:19.230Z"
}
```

**Error Response (503):**

```json
{
  "status": "unhealthy",
  "message": "Python API is not available",
  "error": "Connection timeout",
  "timestamp": "2025-12-05T23:44:19.230Z"
}
```

---

### Prediction Endpoints

#### `POST /api/predict/price`

Predict mobile phone price.

**Request Body:**

```json
{
  "ram": 8,
  "battery": 4000,
  "screen_size": 6.1,
  "weight": 180,
  "year": 2025,
  "company": "Samsung"
}
```

**Response:**

```json
{
  "price": 699.99,
  "confidence": 85,
  "model_used": "distilled_price_model"
}
```

#### `POST /api/predict/ram`

Predict RAM capacity.

**Request Body:**

```json
{
  "price": 699,
  "battery": 4000,
  "screen_size": 6.1
}
```

**Response:**

```json
{
  "ram": 8,
  "confidence": 92
}
```

#### `POST /api/predict/battery`

Predict battery capacity.

**Request Body:**

```json
{
  "ram": 8,
  "price": 699,
  "screen_size": 6.1
}
```

**Response:**

```json
{
  "battery": 4000,
  "confidence": 88
}
```

#### `POST /api/predict/brand`

Classify phone brand.

**Request Body:**

```json
{
  "ram": 8,
  "battery": 4000,
  "price": 699,
  "screen_size": 6.1
}
```

**Response:**

```json
{
  "brand": "Samsung",
  "confidence": 65.22,
  "probabilities": {
    "Samsung": 0.6522,
    "Apple": 0.2341,
    "Xiaomi": 0.1137
  }
}
```

#### `POST /api/predict/advanced`

Advanced prediction with multiple models.

**Request Body:**

```json
{
  "model": "ensemble_stacking",
  "features": {
    "ram": 8,
    "battery": 4000,
    "screen_size": 6.1
  }
}
```

---

### Dataset Endpoints

#### `GET /api/dataset/statistics`

Get dataset statistics.

**Response:**

```json
{
  "total_records": 930,
  "columns": ["id", "model", "company", "price_usa", ...],
  "missing_values": 0.02,
  "data_quality_score": 98.5
}
```

#### `GET /api/dataset/search`

Search dataset with filters.

**Query Parameters:**

- `search`: Search query
- `brand`: Brand filter
- `ramMin`: Minimum RAM
- `ramMax`: Maximum RAM
- `page`: Page number
- `limit`: Items per page

**Response:**

```json
{
  "products": [...],
  "total": 150,
  "page": 1,
  "limit": 12
}
```

#### `GET /api/dataset/columns`

Get all column names.

**Response:**

```json
{
  "columns": ["id", "model", "company", "price_usa", ...]
}
```

#### `POST /api/dataset/compare`

Compare multiple phones.

**Request Body:**

```json
{
  "phone_ids": [1, 2, 3, 4]
}
```

#### `POST /api/dataset/similar`

Find similar phones.

**Request Body:**

```json
{
  "phone_id": 1,
  "limit": 5
}
```

#### `GET /api/dataset/quality-report`

Get data quality report.

#### `GET /api/dataset/preprocessing-status`

Get preprocessing/training status.

**Response:**

```json
{
  "training": {
    "currentEpoch": 127,
    "totalEpochs": 200,
    "currentLoss": 0.234,
    "currentAccuracy": 94.7
  }
}
```

#### `GET /api/dataset/models-by-price`

Get models filtered by price range.

**Query Parameters:**

- `minPrice`: Minimum price
- `maxPrice`: Maximum price

#### `GET /api/dataset/model/[name]`

Get specific model information.

---

### Products Endpoint

#### `GET /api/products`

Get product list with pagination and filters.

**Query Parameters:**

- `search`: Search query
- `brand`: Brand filter
- `ramMin`: Minimum RAM (GB)
- `ramMax`: Maximum RAM (GB)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)

**Response:**

```json
{
  "products": [
    {
      "id": 1,
      "model": "Galaxy S24",
      "company": "Samsung",
      "price_usa": 799,
      "ram": 8,
      "battery": 4000,
      "image_url": "/mobile_images/..."
    }
  ],
  "total": 930,
  "page": 1,
  "limit": 12
}
```

---

### Advanced ML Endpoints

#### `GET /api/advanced/models`

Get list of available ML models.

**Response:**

```json
{
  "models": [
    {
      "name": "distilled",
      "type": "price_prediction",
      "available": true,
      "accuracy": 98.24
    },
    {
      "name": "ensemble_stacking",
      "type": "price_prediction",
      "available": true,
      "accuracy": 97.8
    }
  ]
}
```

#### `POST /api/advanced/compare`

Compare multiple ML models.

**Request Body:**

```json
{
  "models": ["distilled", "ensemble_stacking"],
  "sampleSize": 100,
  "confidence": 0.95
}
```

**Response:**

```json
{
  "status": "completed",
  "winner": "distilled",
  "confidence": 95,
  "modelA": {
    "name": "distilled",
    "mean": 450,
    "mae": 12.5,
    "r2": 0.9824
  },
  "modelB": {
    "name": "ensemble_stacking",
    "mean": 448,
    "mae": 13.2,
    "r2": 0.978
  }
}
```

#### `POST /api/advanced/predict`

Advanced prediction with model selection.

**Request Body:**

```json
{
  "model": "distilled",
  "features": {
    "ram": 8,
    "battery": 4000,
    "screen_size": 6.1
  }
}
```

---

### Utility Endpoints

#### `POST /api/find-closest-model`

Find closest matching phone model.

**Request Body:**

```json
{
  "features": {
    "ram": 8,
    "battery": 4000,
    "price": 699
  }
}
```

#### `POST /api/algolia/index`

Index data to Algolia search.

---

## Python FastAPI Endpoints

### Base URL

`http://localhost:8000` (or configured via `NUXT_PUBLIC_API_BASE`)

### Core Endpoints

All prediction endpoints mirror the Nuxt API routes:

- `POST /api/predict/price`
- `POST /api/predict/ram`
- `POST /api/predict/battery`
- `POST /api/predict/brand`

### Model Priority

Python API uses **fallback chain**:

1. **Distilled models** (fastest, production-ready)
2. **scikit-learn models** (primary, Python 3.14 compatible)
3. **TensorFlow models** (fallback)
4. **Mock predictions** (development)
5. **Basic predictions** (last resort)

### Available Models

#### Price Prediction Models

- `distilled_price_model.pkl` - Distilled model (10x faster)
- `price_predictor_sklearn.pkl` - scikit-learn model
- `ensemble_stacking_model.pkl` - Ensemble model
- `xgboost_conservative.pkl` - XGBoost conservative
- `xgboost_aggressive.pkl` - XGBoost aggressive
- `price_usd_model.pkl` - USD-specific model
- `price_eur_model.pkl` - EUR-specific model
- `price_inr_model.pkl` - INR-specific model

#### RAM Prediction Models

- `ram_predictor_sklearn.pkl`

#### Battery Prediction Models

- `battery_predictor_sklearn.pkl`

#### Brand Classification Models

- `brand_classifier_sklearn.pkl`

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2025-12-05T23:44:19.230Z"
}
```

### Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (Python API down)

---

## Rate Limiting

**Nginx Level**: 100 requests/minute per IP
**FastAPI Level**: Configurable rate limiting middleware

---

## CORS Configuration

**Allowed Origins**: `*` (configured in FastAPI and Nuxt)
**Allowed Methods**: `GET, POST, PUT, DELETE, OPTIONS`
**Allowed Headers**: `Content-Type, Authorization`

---

## Authentication

**Current Status**: No authentication required
**Future**: Can be added via middleware

---

## Response Times

**Typical Response Times:**

- Health check: < 100ms
- Price prediction: 50-200ms (depending on model)
- Dataset search: 100-500ms
- Model comparison: 1-5 seconds

---

## API Versioning

**Current**: No versioning
**Future**: Can add `/api/v1/` prefix if needed

---

## Testing

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Price Prediction

```bash
curl -X POST http://localhost:3000/api/predict/price \
  -H "Content-Type: application/json" \
  -d '{"ram": 8, "battery": 4000, "screen_size": 6.1, "year": 2025, "company": "Samsung"}'
```

### Dataset Search

```bash
curl "http://localhost:3000/api/dataset/search?search=Samsung&page=1&limit=10"
```

---

## API Configuration

### Environment Variables

```bash
# Python API URL
NUXT_PUBLIC_API_BASE=http://localhost:8000

# Disable Python API (use mocks)
NUXT_PUBLIC_PY_API_DISABLED=0
```

### Runtime Configuration

Defined in `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    pyApiDisabled: process.env.NUXT_PUBLIC_PY_API_DISABLED === '1',
  }
}
```

### Dynamic API URL Detection

The `useApiConfig` composable automatically detects the Python API URL:

1. Environment variable (`NUXT_PUBLIC_API_BASE`)
2. Current browser hostname + port 8000
3. Fallback to `localhost:8000`

---

## API Utilities

### `server/utils/get-python-api-url.ts`

Utility function to get Python API URL dynamically:

- Checks environment variables
- Detects current hostname
- Handles cloud platform deployments

### `composables/useApiConfig.ts`

Composable for API configuration:

```typescript
const { pythonApiUrl, isPythonApiDisabled } = useApiConfig();
```

---

## Monitoring

### Health Monitoring

- **Endpoint**: `/api/health`
- **Frequency**: Every 5 seconds (configurable)
- **Composable**: `useApiStatus()` with exponential backoff

### Error Tracking

- **Sentry Integration**: Automatic error tracking
- **Logger**: `useSentryLogger()` composable

---

## Performance Considerations

1. **Model Loading**: Models loaded once at startup
2. **Caching**: Prediction results can be cached
3. **Compression**: Models compressed with joblib (77% size reduction)
4. **Distilled Models**: 10x faster inference than full models

---

## Future API Enhancements

1. **GraphQL Support**: Consider GraphQL for complex queries
2. **WebSocket**: Real-time updates for training progress
3. **API Versioning**: Add version prefix
4. **Rate Limiting**: Per-user rate limits
5. **Authentication**: JWT or OAuth integration
6. **API Documentation**: OpenAPI/Swagger generation
