# Dev Container for Nuxt + Python API

This repository includes a Dev Container using Docker Compose to run both the Nuxt frontend and the Python API as two separate services. The container environment attaches to the `frontend` service so you can use VS Code to inspect and edit both projects simultaneously.

Ports forwarded:
- 3000 — Nuxt dev server
- 8000 — Python API
- 9229 — Node debugger (optional)

Start/Run guidelines (Dev Container w/ Docker Compose):
1. Open the repository in VS Code Remote - Containers: Reopen in Container.
2. The post-create script will run automatically in the attached service (`frontend`) to install node deps; the API service installs its Python dependencies during image build.
3. Both services (frontend & api) will be started automatically after the container is created via `runServices` in `devcontainer.json`. If you need to start them manually, run:
```
# From inside the devcontainer terminal
npm run dev            # Nuxt (frontend container handles this by default)
cd python_api && python api.py  # Python API (this runs in the api service container)
```

Notes:
- MATLAB is not included in the container image — use MATLAB on your host if needed.
- If you use custom Python or Node versions, adjust the Dockerfile accordingly.
# Devcontainer for MATLAB Nuxt App

This repository includes a minimal VS Code Devcontainer (`.devcontainer/devcontainer.json`) to provide a consistent local development environment for contributors using Codespaces or Remote - Containers.

Key points
- Node.js (22) is available via the base image.
- Python 3.14 is installed via the `devcontainer` features (so the Python and Node tooling are available).
- Recommended extensions are preinstalled in the container; this includes the `JavaScript & TypeScript Nightly` (`ms-vscode.vscode-typescript-next`) extension.
- Ports forwarded:
  - 3000 — Nuxt dev server
  - 8000 — Python FastAPI server

Health checks & start scripts
- This devcontainer includes `.devcontainer/health-check.sh` which runs on container start and checks that Node, npm and Python are installed and the repo `node_modules/typescript` package is available.
- To start both the frontend and the API from within the devcontainer, use the repo script (recommended):
  ```bash
  ./scripts/shell/start.sh
  ```
  
Security & dependency maintenance
--------------------------------
This repository includes overrides in `package.json` to pin some nested dependencies to known safe versions (e.g., `micromatch` and `tar-fs`). After changing `package.json` you must regenerate the lockfile and ensure the changes are applied by running:
```
npm install
npm audit fix
```
If vulnerabilities remain, review the output and run `npm audit fix --force` only after reviewing the changes as it can upgrade major versions.
  The script installs dependencies if they are missing, starts the Python API, trains models if necessary, and starts the Nuxt dev server.

Notes
- `start.sh` uses `bash` and is appropriate for the container environment — for Windows/PowerShell developers, continue to use `scripts/start-nuxt-dev.ps1` or `npm run dev:all` as needed.

Quick run
-----------
- Run the repo fullstack start script (recommended):
  ```bash
  ./scripts/shell/start.sh
  ```
- Alternatively, use the `Makefile` if you prefer `make`:
  ```bash
  make dev
  ```
- From VS Code: run the task `Dev: Fullstack (Shell)` (uses `./scripts/shell/start.sh`).

Auto start servers on container start
----------------------------------
- This devcontainer optionally starts the frontend and API automatically using a tmux session. By default, the container sets `DEVCONTAINER_AUTO_START_SERVERS=true` to auto-start the servers on `postStartCommand`.
- If you'd rather not start servers automatically, set `DEVCONTAINER_AUTO_START_SERVERS=false` in your Codespaces environment or change the container config.
- To disable auto-start for an existing container's session, open a terminal and set `export DEVCONTAINER_AUTO_START_SERVERS=false` or update your devcontainer configuration.


How to use
1. Open the repo in VS Code and choose: `Remote-Containers: Reopen in Container` or use GitHub Codespaces.
2. The container will run `npm ci` and then install Python requirements for `python_api` during `postCreateCommand`.

Optional customizations
- If you want additional extensions inside the devcontainer, add them to the `customizations.vscode.extensions` array in `devcontainer.json`.
- If you need MATLAB support, note that it usually requires a local MATLAB installation — running MATLAB inside the container is not supported in generic images.
