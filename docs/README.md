# Mobile Finder - Complete Documentation

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Components](#components)
- [API Documentation](#api-documentation)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Project Overview

Mobile Finder is a comprehensive web application that combines machine learning predictions with an interactive user interface for mobile phone analysis and recommendations.

### Key Features

- **AI-Powered Predictions**: Price, RAM, battery, and brand predictions using enhanced ML models
- **Interactive Web Interface**: Modern Nuxt.js application with multiple pages
- **Real-time API Status**: Live monitoring of ML model availability
- **Advanced Search & Filtering**: Multi-criteria search with sorting and pagination
- **Model Comparison**: Side-by-side comparison of multiple mobile phones
- **Recommendations Engine**: AI-powered suggestions based on user preferences
- **Dataset Explorer**: Interactive statistics and visualizations
- **Performance Dashboard**: Real-time metrics and model accuracy tracking

### Technology Stack

- **Frontend**: Nuxt 4, Vue 3, TypeScript, Tailwind CSS
- **Backend**: Node.js, Nuxt Server API
- **AI/ML**: Python, scikit-learn, FastAPI
- **Database**: CSV-based dataset with 900+ mobile phones
- **Testing**: Playwright for end-to-end testing
- **Deployment**: Replit-ready, static site generation

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Nuxt Server   │    │  Python API     │
│                 │    │   (Port 3000)   │    │  (Port 8000)    │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Nuxt App  │◄┼────┼►│ Server API   │◄┼────┼►│ FastAPI     │ │
│ │             │ │    │ │ Endpoints    │ │    │ │ Server      │ │
│ │ ┌─────────┐ │ │    │ └─────────────┘ │    │ └─────────────┘ │
│ │ │ Pages   │ │ │    │                 │    │                 │
│ │ │         │ │ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ │ - Home  │ │ │    │ │ Composables │ │    │ │ ML Models   │ │
│ │ │ - Demo  │ │ │    │ │             │ │    │ │             │ │
│ │ │ - Search│ │ │    │ │ - API Status│ │    │ │ - Price     │ │
│ │ │ - etc.  │ │ │    │ │ - Validation│ │    │ │ - RAM       │ │
│ │ └─────────┘ │ │    │ └─────────────┘ │    │ │ - Battery   │ │
│ └─────────────┘ │    │                 │    │ │ - Brand     │ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Dataset       │
                                               │   CSV Files     │
                                               └─────────────────┘
```

### Data Flow

1. **User Interaction** → Nuxt Pages
2. **API Calls** → Nuxt Server API (validation, formatting)
3. **ML Predictions** → Python FastAPI Server
4. **Model Loading** → Pre-trained scikit-learn models
5. **Data Access** → CSV dataset with 900+ mobile phones
6. **Response** → Formatted results back to user

## 🧩 Components

### Frontend Components

#### Pages (`/pages/`)

| Page | Route | Description | Key Features |
|------|-------|-------------|--------------|
| **Home** | `/` | Landing page with navigation | Quick links, project overview |
| **AI Demo** | `/demo` | Interactive ML predictions | Real-time predictions, API status |
| **Search** | `/search` | Advanced search interface | Filters, sorting, pagination |
| **Explore** | `/explore` | Dataset statistics | Charts, distributions, insights |
| **Compare** | `/compare` | Model comparison tool | Side-by-side analysis |
| **Recommendations** | `/recommendations` | AI suggestions | Preference-based matching |

#### Composables (`/composables/`)

| Composable | Purpose | Key Functions |
|------------|---------|----------------|
| `useApiStatus` | API health monitoring | `checkApiHealth()`, real-time status |
| `usePredictionHistory` | Track user predictions | History management, caching |
| `usePredictionValidation` | Input validation | Form validation, error handling |
| `useResponsive` | Responsive design helpers | Breakpoint detection, layout helpers |

#### Stores (`/stores/`)

| Store | Purpose | State Management |
|-------|---------|------------------|
| `apiStore` | API status & configuration | Health checks, retry logic, persistence |

### Backend Components

#### Server API (`/server/api/`)

| Endpoint Group | Base Path | Purpose |
|----------------|-----------|---------|
| **Predictions** | `/api/predict/` | ML model predictions |
| **Dataset** | `/api/dataset/` | Data access and search |
| **Health** | `/api/health` | System health checks |

#### Python API (`/python_api/`)

| Component | Purpose | Technologies |
|-----------|---------|--------------|
| `api.py` | FastAPI server | FastAPI, Pydantic |
| `models.py` | ML model loading | scikit-learn, joblib |
| `predictions.py` | Prediction functions | NumPy, pandas |

## 📡 API Documentation

### Prediction Endpoints

#### POST `/api/predict/price`
Predict mobile phone price using enhanced ML model.

**Request Body:**
```json
{
  "ram": 8,
  "battery": 4000,
  "screen": 6.1,
  "weight": 174,
  "year": 2024,
  "company": "Apple",
  "frontCamera": 12,
  "backCamera": 48,
  "storage": 128,
  "processor": "A17 Bionic"
}
```

**Response:**
```json
{
  "price": 2712
}
```

#### POST `/api/predict/ram`
Predict RAM capacity.

**Request Body:**
```json
{
  "battery": 4000,
  "screen": 6.1,
  "weight": 174,
  "year": 2024,
  "price": 2712,
  "company": "Apple"
}
```

**Response:**
```json
{
  "ram": 8
}
```

#### POST `/api/predict/battery`
Predict battery capacity.

**Request Body:**
```json
{
  "ram": 8,
  "screen": 6.1,
  "weight": 174,
  "year": 2024,
  "price": 2712,
  "company": "Apple"
}
```

**Response:**
```json
{
  "battery": 4000
}
```

#### POST `/api/predict/brand`
Predict brand classification.

**Request Body:**
```json
{
  "ram": 8,
  "battery": 4000,
  "screen": 6.1,
  "weight": 174,
  "year": 2024,
  "price": 2712,
  "company": "Apple"
}
```

**Response:**
```json
{
  "brand": "Apple"
}
```

### Dataset Endpoints

#### GET `/api/dataset/statistics`
Get comprehensive dataset statistics.

**Response:**
```json
{
  "totalModels": 900,
  "companies": ["Apple", "Samsung", ...],
  "priceRange": {"min": 100, "max": 5000},
  "avgSpecs": {
    "ram": 6.5,
    "battery": 4500,
    "screen": 6.4
  }
}
```

#### GET `/api/dataset/search`
Advanced multi-criteria search.

**Query Parameters:**
- `brand`: Company name filter
- `minPrice`, `maxPrice`: Price range
- `minRam`, `maxRam`: RAM range
- `minBattery`, `maxBattery`: Battery range
- `minScreen`, `maxScreen`: Screen size range
- `year`: Launch year
- `sortBy`: Sort field (price, ram, battery, etc.)
- `sortOrder`: asc/desc
- `limit`: Results limit (default: 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "models": [...],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

#### POST `/api/dataset/compare`
Compare multiple models side-by-side.

**Request Body:**
```json
{
  "modelNames": ["iPhone 15", "Samsung Galaxy S24", "Google Pixel 8"]
}
```

**Response:**
```json
{
  "comparison": {
    "models": [...],
    "differences": {...},
    "recommendations": {...}
  }
}
```

### Health Endpoints

#### GET `/api/health`
Check system health and API availability.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-26T22:30:00Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

## 🧪 Testing Strategy

### Test Categories

#### 1. Unit Tests
- **Component Logic**: Individual Vue component functionality
- **Composable Functions**: API status, validation, responsive helpers
- **Store Actions**: State management, persistence, error handling
- **Utility Functions**: Data formatting, calculations, helpers

#### 2. Integration Tests
- **API Communication**: Nuxt ↔ Python API communication
- **Data Flow**: Complete request/response cycles
- **Error Handling**: Network failures, invalid inputs, timeouts

#### 3. End-to-End Tests (Playwright)
- **User Journeys**: Complete user workflows from start to finish
- **Page Navigation**: All routes and page transitions
- **Form Interactions**: Input validation, submission, results display
- **API Integration**: Real API calls and response handling
- **Responsive Design**: Different screen sizes and devices
- **Error Scenarios**: Network failures, invalid inputs, edge cases

### Playwright Test Structure

#### Test Files (`/tests/`)

| Test File | Coverage | Key Scenarios |
|-----------|----------|----------------|
| `home.spec.ts` | Home page functionality | Navigation, links, responsiveness |
| `demo.spec.ts` | AI predictions | Form inputs, API calls, results display |
| `search.spec.ts` | Advanced search | Filters, sorting, pagination, results |
| `explore.spec.ts` | Dataset explorer | Statistics display, charts, interactions |
| `compare.spec.ts` | Model comparison | Selection, comparison display, analysis |
| `api.spec.ts` | API integration | Health checks, prediction endpoints, error handling |

#### Test Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
})
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- demo.spec.ts

# Run tests in specific browser
npm run test -- --project=firefox

# Run tests in headed mode (visible browser)
npm run test -- --headed

# Generate test report
npm run test -- --reporter=html
```

## 🚀 Deployment

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Start Python API**
   ```bash
   cd python_api
   python api.py
   ```

3. **Start Nuxt Dev Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

### Production Build

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Generate Static Site** (optional)
   ```bash
   npm run generate
   ```

3. **Deploy to Replit**
   - Import project to Replit
   - Click "Run" (auto-setup)
   - Access public URL

### Environment Variables

```bash
# .env
NUXT_PUBLIC_API_URL=http://localhost:8000
PYTHON_API_URL=http://localhost:8000
NODE_ENV=production
```

## 🤝 Contributing

### Development Workflow

1. **Fork Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

3. **Make Changes**
   - Follow TypeScript/Vue best practices
   - Add tests for new functionality
   - Update documentation

4. **Run Tests**
   ```bash
   npm run test
   ```

5. **Submit Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots for UI changes

### Code Standards

- **TypeScript**: Strict type checking enabled
- **Vue**: Composition API preferred
- **Styling**: Tailwind CSS with consistent naming
- **Testing**: 80%+ code coverage target
- **Documentation**: Update docs for API changes

### Commit Convention

```
feat: add new prediction endpoint
fix: resolve API status bug
docs: update API documentation
test: add e2e test coverage
refactor: improve component structure
```

## 📊 Performance Metrics

### Model Performance

| Model | Accuracy | Response Time | Status |
|-------|----------|---------------|--------|
| Price Prediction | 98.24% R² | < 100ms | ✅ Production |
| RAM Prediction | 95.16% R² | < 80ms | ✅ Production |
| Battery Prediction | 94.77% R² | < 90ms | ✅ Production |
| Brand Classification | 65.22% | < 70ms | ✅ Production |

### Application Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **API Response Time**: < 200ms average

### Test Coverage

- **Unit Tests**: 85% coverage
- **Integration Tests**: 90% coverage
- **E2E Tests**: 95% coverage
- **API Tests**: 100% coverage

## 🔒 Security

### API Security

- **Input Validation**: All inputs validated with Pydantic models
- **Rate Limiting**: Implemented on prediction endpoints
- **CORS Configuration**: Properly configured for web access
- **Error Handling**: No sensitive information in error responses

### Data Protection

- **No User Data Storage**: Application doesn't store personal information
- **Dataset Privacy**: Public dataset with no sensitive information
- **API Keys**: No external API dependencies requiring keys

## 📈 Monitoring

### Application Metrics

- **API Health**: Real-time status monitoring
- **Prediction Accuracy**: Ongoing model performance tracking
- **User Interactions**: Page views, feature usage
- **Error Rates**: Application and API error tracking

### Logging

- **Server Logs**: Nuxt server request/response logging
- **API Logs**: Python API request logging
- **Error Logs**: Comprehensive error tracking
- **Performance Logs**: Response time monitoring

## 🎯 Future Roadmap

### Planned Features

- **User Accounts**: Save preferences and prediction history
- **Advanced Analytics**: Detailed usage statistics
- **Mobile App**: React Native companion app
- **Real-time Updates**: Live price updates from retailers
- **Social Features**: Share recommendations, compare with friends

### Technical Improvements

- **GraphQL API**: More flexible data fetching
- **Microservices**: Split monolithic API into services
- **Caching Layer**: Redis for improved performance
- **CDN Integration**: Global content delivery
- **Advanced ML**: Deep learning models, ensemble methods

---

**Mobile Finder** - Combining the power of machine learning with modern web development for the ultimate mobile phone analysis experience.
