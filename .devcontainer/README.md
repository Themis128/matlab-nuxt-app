# Dev Container Configuration

This directory contains the development container configuration for the MatLab Nuxt App project.

## What is a Dev Container?

A dev container allows you to use a Docker container as a full-featured development environment. It enables you to:

- Have a consistent development environment across different machines
- Isolate project dependencies
- Use VS Code features like IntelliSense, debugging, and extensions inside the container

## Setup

1. **Install Prerequisites:**
   - Docker Desktop (Windows/Mac) or Docker Engine (Linux)
   - VS Code with the "Dev Containers" extension

2. **Open in Container:**
   - Open VS Code Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Select "Dev Containers: Reopen in Container"
   - VS Code will build and start the containers

3. **Services:**
   - **Frontend**: Nuxt.js app on port 3000
   - **API**: Python FastAPI on port 8000

## Configuration Files

- `devcontainer.json`: Main dev container configuration
- `../docker-compose.yml`: Docker Compose configuration for all services
- `../Dockerfile.api`: Dockerfile for the Python API service

## Manual Docker Commands

If you prefer to use Docker directly:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose build --no-cache

# Access frontend container
docker exec -it matlab-nuxt-frontend bash

# Access API container
docker exec -it matlab-nuxt-api bash
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 8000 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - '3001:3000' # Use 3001 instead of 3000
```

### Container Build Fails

- Ensure Docker is running
- Check Docker has enough resources (memory/CPU)
- Try rebuilding: `docker-compose build --no-cache`

### Extensions Not Working

- Ensure extensions are listed in `devcontainer.json` under `customizations.vscode.extensions`
- Reload the window after container starts

## Notes

- The `docker-compose.override.yml` file can be used for local overrides without committing changes
- Volumes are used to persist `node_modules` and Python virtual environments
- The dev container uses the `frontend` service as the primary workspace
