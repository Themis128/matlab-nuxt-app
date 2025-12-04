# Dynamic Backend URL Detection - Implementation Summary

## Overview

The frontend now automatically detects and connects to the Python API backend based on the current host, making it work seamlessly across different environments (localhost, Replit, production).

## How It Works

### Server-Side Detection

**File:** `server/utils/get-python-api-url.ts`

The server-side utility examines the incoming HTTP request to determine the appropriate Python API URL:

1. **Environment Variable** (highest priority): `PYTHON_API_URL` or `NUXT_PUBLIC_API_BASE`
2. **Request Host Detection**: Extracts the host from the request headers
3. **Platform-Specific Logic**:
   - Replit: Uses the same host with port 8000
   - Localhost: Uses `localhost:8000` or `127.0.0.1:8000`
   - Production: Uses the same domain with port 8000
4. **Fallback**: `http://localhost:8000`

### Client-Side Detection

**File:** `composables/useApiConfig.ts`

The client-side composable uses browser APIs to detect the current location:

1. **Environment Variable** (if explicitly set and not default)
2. **Browser Location Detection**: `window.location.hostname` and `window.location.protocol`
3. **Platform Detection**: Special handling for Replit domains
4. **Port Replacement**: Replaces frontend port (3000/5000) with backend port (8000)
5. **Fallback**: Uses runtime config default

## Updated Files

### Server-Side

- ✅ `server/utils/get-python-api-url.ts` - **NEW** - Core URL detection utility
- ✅ `server/utils/python-api.ts` - Updated to use dynamic URL
- ✅ `server/api/health.get.ts` - Updated to use dynamic URL
- ✅ `server/api/predict/price.post.ts` - Passes event for URL detection
- ✅ `server/api/predict/ram.post.ts` - Passes event for URL detection
- ✅ `server/api/predict/battery.post.ts` - Passes event for URL detection
- ✅ `server/api/predict/brand.post.ts` - Passes event for URL detection

### Client-Side

- ✅ `composables/useApiConfig.ts` - Enhanced with dynamic detection
- ✅ `pages/search.vue` - Uses `useApiConfig()` composable
- ✅ `pages/api-docs.vue` - Uses `useApiConfig()` composable

## Usage Examples

### In Server API Routes

```typescript
import { getPythonApiUrl } from '~/server/utils/get-python-api-url';

export default defineEventHandler(async (event) => {
  const apiUrl = getPythonApiUrl(event);
  const response = await fetch(`${apiUrl}/api/endpoint`);
  // ...
});
```

### In Python API Utility

```typescript
import { callPythonAPI } from '~/server/utils/python-api';

export default defineEventHandler(async (event) => {
  const result = await callPythonAPI('/api/predict/price', body, event);
  // ...
});
```

### In Vue Components

```typescript
const { pythonApiUrl } = useApiConfig();
const data = await $fetch(`${pythonApiUrl}/api/endpoint`);
```

## Environment Configuration

### Local Development

No configuration needed - automatically uses `localhost:8000`

### Replit

No configuration needed - automatically detects Replit domain and uses port 8000

### Custom Deployment

Set environment variable:

```bash
export NUXT_PUBLIC_API_BASE=https://api.yourdomain.com
# or
export PYTHON_API_URL=https://api.yourdomain.com
```

## Testing the Configuration

### Check Current URL (Browser Console)

```javascript
// Should show the detected Python API URL
console.log(window.__NUXT__.config.public.apiBase);
```

### Check Server-Side URL

Add temporary logging in any API route:

```typescript
console.log('Python API URL:', getPythonApiUrl(event));
```

### Test Health Endpoint

```bash
# Should work on any environment
curl http://localhost:3000/api/health
```

## Deployment Scenarios

| Environment | Frontend Port | Backend Port | Auto-Detection             |
| ----------- | ------------- | ------------ | -------------------------- |
| Localhost   | 3000 or 5000  | 8000         | ✅ Yes                     |
| Replit      | Dynamic       | 8000         | ✅ Yes                     |
| Docker      | 3000          | 8000         | ✅ Yes (container network) |
| Production  | 80/443        | Custom       | ⚙️ Set env var             |

## Troubleshooting

### Backend Not Found

1. Check Python API is running: `curl http://localhost:8000/health`
2. Check browser console for the detected URL
3. Check server logs for URL detection output

### Wrong URL Detected

1. Set explicit override: `export NUXT_PUBLIC_API_BASE=http://correct-url:8000`
2. Restart the Nuxt dev server
3. Clear browser cache

### Replit-Specific Issues

- Ensure both services are exposed on their respective ports
- Check Replit's port forwarding configuration
- Verify the domain includes `:8000` for API calls

## Benefits

✅ **Zero Configuration** - Works out of the box on localhost and Replit
✅ **Environment Aware** - Adapts to different deployment platforms
✅ **Override Capable** - Can be explicitly configured when needed
✅ **Type Safe** - Full TypeScript support
✅ **Maintainable** - Centralized URL detection logic
