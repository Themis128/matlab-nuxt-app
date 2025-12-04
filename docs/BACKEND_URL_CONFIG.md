# Dynamic Backend URL Configuration

## Overview

The frontend automatically detects the Python API backend URL through environment variables, making it easy to deploy across different environments without code changes.

## Configuration

### Environment Variables

The backend URL is configured via the `NUXT_PUBLIC_API_BASE` environment variable:

```bash
# Development (default)
NUXT_PUBLIC_API_BASE=http://localhost:8000

# Production
NUXT_PUBLIC_API_BASE=https://api.yourproduction.com

# Docker container-to-container
NUXT_PUBLIC_API_BASE=http://python-api:8000
```

### Setup Methods

#### 1. Using .env file (Recommended for development)

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your configuration
NUXT_PUBLIC_API_BASE=http://localhost:8000
```

#### 2. Using environment variables

```bash
# Windows PowerShell
$env:NUXT_PUBLIC_API_BASE="http://localhost:8000"
npm run dev

# Linux/Mac
export NUXT_PUBLIC_API_BASE=http://localhost:8000
npm run dev
```

#### 3. Using runtime config (Docker/Production)

```dockerfile
# Dockerfile or docker-compose.yml
ENV NUXT_PUBLIC_API_BASE=http://python-api:8000
```

## Usage in Code

### Using the composable (Recommended)

```typescript
// In your Vue component
const { pythonApiUrl } = useApiConfig();

// Make API calls
const data = await $fetch(`${pythonApiUrl}/api/endpoint`);
```

### Using runtime config directly

```typescript
const config = useRuntimeConfig();
const apiUrl = config.public.apiBase;
```

## Deployment Scenarios

### Local Development

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Config: `NUXT_PUBLIC_API_BASE=http://localhost:8000`

### Optional Docker Development

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Config: `NUXT_PUBLIC_API_BASE=http://python-api:8000` (container network)

### Production

- Frontend: `https://yourdomain.com`
- Backend: `https://api.yourdomain.com`
- Config: `NUXT_PUBLIC_API_BASE=https://api.yourdomain.com`

## Testing

The configuration automatically works with Playwright tests:

```typescript
// Tests use the same runtime config
const config = useRuntimeConfig();
await page.goto(`${config.public.apiBase}/health`);
```

## Troubleshooting

### Backend not reachable

1. Check if Python API is running: `curl http://localhost:8000/health`
2. Verify environment variable: `echo $NUXT_PUBLIC_API_BASE`
3. Check browser console for CORS errors
4. Ensure firewall allows the connection

### Wrong URL being used

1. Clear Nuxt cache: `rm -rf .nuxt node_modules/.cache`
2. Restart dev server: `npm run dev`
3. Check runtime config in browser console: `window.__NUXT__.config.public.apiBase`

## Files Using Dynamic URLs

- `pages/search.vue` - Search and model filtering
- `pages/api-docs.vue` - API documentation
- `server/utils/python-api.ts` - Server-side API calls
- `server/api/health.get.ts` - Health check proxy
- `composables/useApiConfig.ts` - Configuration composable
