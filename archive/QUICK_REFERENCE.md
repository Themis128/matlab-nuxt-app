# 🚀 Quick Reference: Security & Configuration

**Quick access to common security configurations and commands**

---

## 🔑 Environment Variables

### Development (`.env.local`)

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60
NUXT_PUBLIC_API_BASE=http://localhost:8000
```

### Production (`.env.production`)

```env
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
NUXT_API_SECRET=$(openssl rand -hex 32)
NUXT_PUBLIC_API_BASE=https://api.your-domain.com
```

---

## 🚦 Common Commands

### Generate Secrets

```bash
# API Secret (Linux/Mac)
openssl rand -hex 32

# API Secret (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### Run Development

```bash
# Start both servers
npm run dev:all

# Start separately
npm run dev          # Nuxt (port 3000)
npm run dev:python   # Python API (port 8000)
```

### Test Security

```bash
# Check security headers
curl -I http://localhost:3000

# Test rate limiting (should fail after 100 requests)
for i in {1..110}; do curl http://localhost:8000/health; done

# Test CORS
curl -H "Origin: https://your-domain.com" http://localhost:8000/health
```

### Deploy

````bash
# Tag version
git tag v1.0.1
git push origin v1.0.1
---

## 🔎 Algolia indexing (sample)

Use environment variables or pass your App ID and Admin API Key on the command line. See `.env.example` for preferred values.

```bash
# (PowerShell) Set environment vars (do NOT put production API keys in Git)
$env:ALGOLIA_APP_ID='YourAlgoliaAppId'
$env:ALGOLIA_ADMIN_API_KEY='YourAlgoliaAdminKey'

# Run the sample indexing script (fetches movie dataset by default)
npm run algolia:index

# Or index from a local JSON file
node scripts/algolia/index_records.js --file data/scraped_phone_data.json --index "phones_index"
````

### Server-side: Trigger indexing via Nuxt API (server-only)

With Nuxt running and server-side API credentials configured, POST to the admin index endpoint to trigger indexing on the server.

```bash
curl -X POST http://localhost:3000/api/algolia/index -H "Content-Type: application/json" \
	-d '{"indexName":"phones_index","objects": [{"objectID":"test-1","name":"Phone Test"}]}'
```

## Deployment (pulling updates to server)

Use a server-side approach when updating production:

```bash
# Example: Stop service, pull updated artifacts (scp/rsync), and restart
# Copy new build artifacts to server
scp -r .output/ user@server:/var/www/matlab/nuxt
scp -r python_api/ user@server:/var/www/matlab/python_api

# Restart services
ssh user@server 'systemctl restart python-api nuxt-app'
```

````

---

## 🛡️ Security Checklist

**Before Production Deployment:**

- [ ] Set `CORS_ORIGINS` (no wildcards!)
- [ ] Generate `NUXT_API_SECRET`
- [ ] Configure rate limiting
- [ ] Add GitHub secrets
- [ ] Enable HTTPS
- [ ] Test security headers
- [ ] (Optional) Configure Sentry

---

## 📚 Documentation Quick Links

| Topic                  | Link                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Security Configuration | [docs/SECURITY_CONFIGURATION.md](docs/SECURITY_CONFIGURATION.md)                   |
| Error Tracking         | [docs/ERROR_TRACKING_SETUP.md](docs/ERROR_TRACKING_SETUP.md)                       |
| Implementation Summary | [docs/MISSING_FEATURES_IMPLEMENTATION.md](docs/MISSING_FEATURES_IMPLEMENTATION.md) |
| Changelog              | [CHANGELOG.md](CHANGELOG.md)                                                       |
| Security Policy        | [SECURITY.md](SECURITY.md)                                                         |

---

## 🆘 Troubleshooting

### CORS Errors

```env
# Check CORS_ORIGINS includes your domain (no trailing slash)
CORS_ORIGINS=https://your-domain.com
````

### Rate Limit Too Strict

```env
# Increase limits
RATE_LIMIT_REQUESTS=500
RATE_LIMIT_WINDOW=60
```

### CSP Blocking Resources

Check `nuxt.config.ts` and add required domains to CSP directives

---

## 📞 Get Help

- 🐛 [Report Issues](https://github.com/Themis128/matlab-nuxt-app/issues)
- 💬 [Ask Questions](https://github.com/Themis128/matlab-nuxt-app/discussions)
- 🔒 [Security Concerns](SECURITY.md)
