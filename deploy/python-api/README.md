# Python API self-hosted deploy (matlab-api.cloudless.gr)

The Vercel frontend cannot run `python_api/` (FastAPI + sklearn/xgboost/
lightgbm — too heavy for serverless). It is deployed as a Docker container
on the OMV host instead, exposed publicly through the `omv-cloudless`
Cloudflare Tunnel (`a474360d`).

## Live layout (verified 2026-11-23)

- Image: `matlab-python-api:latest`, built from repo-root context:
  `docker build -f Dockerfile.python-api -t matlab-python-api .`
- Container: `matlab-python-api`, `--restart unless-stopped`,
  `-p 8010:8000`, env `CORS_ORIGINS=https://matlab-nuxt-app.vercel.app,...`
- Public URL: `https://matlab-api.cloudless.gr` → tunnel ingress →
  `http://192.168.1.200:8010`
- Vercel env: `PYTHON_API_URL=https://matlab-api.cloudless.gr`
  (production + preview) — picked up on each new deployment.

## Rebuild / redeploy

```bash
# on omv (or build elsewhere and docker save | ssh docker load)
cd <repo checkout with LFS pulled>
docker build -f Dockerfile.python-api -t matlab-python-api .
docker rm -f matlab-python-api
docker run -d --name matlab-python-api --restart unless-stopped \
  -p 8010:8000 \
  -e CORS_ORIGINS='https://matlab-nuxt-app.vercel.app,http://localhost:3000' \
  matlab-python-api:latest
curl -s http://localhost:8010/health   # {"status":"healthy",...}
```

NOTE: `trained_models/*.pkl` are Git LFS objects — `git lfs pull` before
building or the image ships 130-byte pointer stubs and predictions fail.
