# Security Configuration Guide

This document provides comprehensive security configuration guidelines for the MATLAB Deep Learning & Mobile Dataset Analysis application.

## Table of Contents

- [Quick Start](#quick-start)
- [Security Features](#security-features)
- [CORS Configuration](#cors-configuration)
- [Rate Limiting](#rate-limiting)
- [Security Headers](#security-headers)
- [Environment Variables](#environment-variables)
- [Production Checklist](#production-checklist)
- [Common Security Issues](#common-security-issues)

---

## Quick Start

### Development Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your local settings (CORS can be permissive)
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
RATE_LIMIT_REQUESTS=1000  # Higher for development
```

### Production Setup

```bash
# Copy production template
cp .env.production.template .env.production

# REQUIRED: Update these values
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
NUXT_API_SECRET=$(openssl rand -hex 32)
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

---

## Security Features

### ✅ Implemented Security Features

1. **Rate Limiting** - Prevents API abuse (100 requests/60 seconds by default)
2. **CORS Protection** - Restricts which domains can access the API
3. **Security Headers** - HSTS, CSP, X-Frame-Options, etc.
4. **Input Validation** - All API inputs validated with Pydantic
5. **Environment-based Config** - Different settings for dev/prod
6. **Health Checks** - Monitor application status
7. **Docker Security** - Non-root user, minimal attack surface

### 🔄 Recommended Additional Features

1. **API Authentication** - JWT tokens or API keys
2. **Database Encryption** - Encrypt sensitive data at rest
3. **Audit Logging** - Track all API requests
4. **WAF (Web Application Firewall)** - Use Cloudflare or AWS WAF
5. **DDoS Protection** - Use CDN with DDoS protection

---

## CORS Configuration

### What is CORS?

CORS (Cross-Origin Resource Sharing) controls which websites can access your API. Without proper configuration, any website could make requests to your API.

### Development Configuration

```env
# .env.local - Permissive for testing
CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000
```

### Production Configuration

```env
# .env.production - Restrictive and secure
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### ⚠️ Common Mistakes

```env
# ❌ NEVER DO THIS IN PRODUCTION
CORS_ORIGINS=*

# ❌ Don't include localhost in production
CORS_ORIGINS=https://your-domain.com,http://localhost:3000

# ❌ Don't forget trailing slashes consistency
CORS_ORIGINS=https://your-domain.com,https://other-domain.com/

# ✅ Correct production configuration
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com,https://api.your-domain.com
```

### Multiple Environments

```env
# Development
CORS_ORIGINS=http://localhost:3000

# Staging
CORS_ORIGINS=https://staging.your-domain.com

# Production
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Testing CORS Configuration

```bash
# Test from browser console
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

# Test with curl
curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8000/api/predict/price
```

---

## Rate Limiting

### Default Configuration

```env
RATE_LIMIT_REQUESTS=100  # Maximum requests
RATE_LIMIT_WINDOW=60     # Per 60 seconds
```

### Response Headers

The API includes rate limit information in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701234567
```

### Customizing Rate Limits

```env
# Development - Higher limits
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60

# Production - Standard
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# High-traffic production - Per endpoint
RATE_LIMIT_REQUESTS=500
RATE_LIMIT_WINDOW=60

# Strict - Anti-abuse
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60
```

### Rate Limit Bypass (Advanced)

For trusted clients (e.g., your own frontend), you can implement API key-based bypass:

```python
# In python_api/api.py (add this logic)
async def rate_limit_middleware(request: Request, call_next):
    # Check for API key header
    api_key = request.headers.get("X-API-Key")
    if api_key and api_key == os.getenv("INTERNAL_API_KEY"):
        return await call_next(request)  # Skip rate limiting

    # ... rest of rate limiting logic
```

### Production Rate Limiting

For production, consider using Redis for distributed rate limiting:

```python
# Install: pip install redis
import redis

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    key = f"rate_limit:{client_ip}"

    current = redis_client.get(key)
    if current and int(current) >= RATE_LIMIT_REQUESTS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    redis_client.incr(key)
    redis_client.expire(key, RATE_LIMIT_WINDOW)

    return await call_next(request)
```

---

## Security Headers

### Implemented Headers

All responses include these security headers:

```http
# Prevent MIME type sniffing
X-Content-Type-Options: nosniff

# Prevent clickjacking
X-Frame-Options: SAMEORIGIN

# Enable XSS protection
X-XSS-Protection: 1; mode=block

# Control referrer information
Referrer-Policy: strict-origin-when-cross-origin

# Restrict browser features
Permissions-Policy: camera=(), microphone=(), geolocation=()

# Enforce HTTPS (production only)
Strict-Transport-Security: max-age=31536000; includeSubdomains; preload
```

### Content Security Policy (CSP)

Production CSP prevents XSS attacks:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' data: https:;
  font-src 'self' data: https:;
  connect-src 'self' https://your-api.com;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
```

### Testing Security Headers

```bash
# Online tools
https://securityheaders.com
https://observatory.mozilla.org

# Command line
curl -I https://your-domain.com

# Check specific header
curl -I https://your-domain.com | grep -i "x-frame-options"
```

---

## Environment Variables

### Required Variables

```env
# CORS Configuration (REQUIRED in production)
CORS_ORIGINS=https://your-domain.com

# API Secret (REQUIRED)
NUXT_API_SECRET=$(openssl rand -hex 32)

# API Base URL (REQUIRED)
NUXT_PUBLIC_API_BASE=https://api.your-domain.com
```

### Optional Security Variables

```env
# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Error Tracking
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Logging Level
LOG_LEVEL=INFO  # Use WARNING or ERROR in production

# Internal API Key (for bypassing rate limits)
INTERNAL_API_KEY=$(openssl rand -hex 32)
```

### Generating Secure Secrets

```bash
# Generate API secret (Linux/Mac)
openssl rand -hex 32

# Generate API secret (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Generate UUID
uuidgen

# Generate using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Production Checklist

### Before Deploying

- [ ] Set `CORS_ORIGINS` to specific domains (no `*`)
- [ ] Generate and set strong `NUXT_API_SECRET`
- [ ] Configure rate limiting for your traffic
- [ ] Set up error tracking (Sentry recommended)
- [ ] Enable HTTPS/SSL certificate
- [ ] Test security headers with online tools
- [ ] Review and restrict `Permissions-Policy`
- [ ] Enable `Strict-Transport-Security` (HSTS)
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Document incident response plan
- [ ] Test CORS from production domain
- [ ] Verify rate limiting works
- [ ] Test with security scanner (OWASP ZAP)

### Optional Docker Hardening Guidance

- The project supports containerized deployment, but it is optional. If you choose to use Docker, follow these hardening guidelines:
- [ ] Use secrets management (Docker Swarm, Kubernetes, or GitHub Actions secrets)
- [ ] Run containers as a non-root user
- [ ] Scan images for vulnerabilities (`docker scan`)
- [ ] Use minimal base images (alpine, distroless)
- [ ] Keep images updated
- [ ] Configure health checks
- [ ] Set resource limits (CPU, memory)
- [ ] Enable Docker Content Trust

### GitHub Secrets Required

```
SERVER_HOST=your-server-host
SERVER_USER=your-deploy-user
SERVER_SSH_KEY=your-ssh-private-key
SENTRY_DSN_FRONTEND=https://...
SENTRY_DSN_BACKEND=https://...
NUXT_API_SECRET=your-secret
```

---

## Common Security Issues

### Issue 1: CORS Errors in Production

**Symptom**: API works locally but fails in production with CORS error

**Solution**:

```env
# Make sure production domain is in CORS_ORIGINS
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Check for trailing slashes
# ❌ https://domain.com/
# ✅ https://domain.com
```

### Issue 2: Rate Limit Too Strict

**Symptom**: Legitimate users getting 429 errors

**Solution**:

```env
# Increase limits
RATE_LIMIT_REQUESTS=500
RATE_LIMIT_WINDOW=60

# Or implement API key bypass for your frontend
```

### Issue 3: CSP Blocking Resources

**Symptom**: Images, scripts, or styles not loading

**Solution**: Check `nuxt.config.ts` CSP configuration and add domains:

```typescript
'img-src': ["'self'", 'data:', 'https:', 'https://cdn.your-domain.com'],
```

### Issue 4: Mixed Content (HTTP/HTTPS)

**Symptom**: HTTPS page blocked from loading HTTP resources

**Solution**:

```env
# Ensure all URLs use HTTPS in production
NUXT_PUBLIC_API_BASE=https://api.your-domain.com  # Not http://
```

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mozilla Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Security Headers Reference](https://securityheaders.com)
- [Content Security Policy](https://content-security-policy.com/)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## Support

For security concerns or questions:

- 🔒 Security issues: See [SECURITY.md](../SECURITY.md)
- 💬 General questions: [GitHub Discussions](https://github.com/Themis128/matlab-nuxt-app/discussions)
- 🐛 Bug reports: [GitHub Issues](https://github.com/Themis128/matlab-nuxt-app/issues)
