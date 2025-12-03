# Workspace Setup & Editor Performance

This document explains how we configure Visual Studio Code for this repository to keep the editor responsive when working on large datasets and non-TS code (MATLAB, Python, CSV data, etc.).

## Why

- Some directories (e.g., `data`, `matlab`, `python_api`, `mobiles-dataset-docs`) contain many files and non-JS/TS artifacts. Indexing these in the TypeScript/JS language service and search slows development and increases memory usage.

## What we do

- We exclude these directories by default in `.vscode/settings.json` and `tsconfig.json` so the VS Code explorer, search and TypeScript language service do not index them.
- We keep `node_modules` and `venv` excluded by default for performance and to avoid accidental editing.

## Using JavaScript & TypeScript Nightly (optional) ⚡

- We recommend the "JavaScript & TypeScript Nightly" extension to get early access to TypeScript features and the latest language server improvements. The extension ID is `ms-vscode.vscode-typescript-next` and is included in the tracked `.vscode/extensions.json` recommendations.
- If you install this extension, you may want to pick the workspace TypeScript version (the project uses the `typescript` package in `node_modules`). When prompted by VS Code, choose **Use Workspace Version** so the TypeScript server matches the version installed in the repo.
- If you prefer to control this behavior manually, set the workspace setting `typescript.tsdk` to `node_modules/typescript/lib` and `typescript.enablePromptUseWorkspaceTsdk` to `true` (this repo's `settings-controls` templates include these settings already.)
 - If you want the nightly TypeScript language server, open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P) and run **TypeScript: Select TypeScript Version** → **Use Workspace Version**. If the extension is installed and you prefer to always use the nightly build, select the `Use VS Code's Nightly` option from that same command.

### Add to devcontainer (optional)

If you use a VS Code **devcontainer** for development and want the Nightly extension preinstalled for all contributors of the container, add it to the `extensions` array in your `devcontainer.json` like this:

```jsonc
{
	"name": "matlab-nuxt-app devcontainer",
	"image": "mcr.microsoft.com/devcontainers/dotnet:latest",
	"extensions": [
		"ms-vscode.vscode-typescript-next"
	]
}
```

This will ensure the Nightly extension is available inside the container and will avoid per-user extension installation steps.

## Toggle editor visibility

If you need to work inside any of the excluded directories (for debugging or editing), follow the steps below:

1. Open a PowerShell terminal in the repo root.
2. Run either (from the repo root):

```pwsh
.\.vscode\settings-controls\toggle-settings.ps1 -mode show -backup
# or
.\.vscode\settings-controls\toggle-settings.ps1 -mode hide -backup
```

## Devcontainer quick start

If you're using the VS Code Devcontainer for consistent dev environments:

- Open the repo in VS Code and choose: `Remote-Containers: Reopen in Container` or use GitHub Codespaces.
- The container's `postCreateCommand` runs `npm ci` and `pip install` so dependencies are preinstalled.
- To run health checks in the container:
	```bash
	bash ./.devcontainer/health-check.sh
	```
- To start both the frontend and the API inside the container:
	```bash
	./scripts/shell/start.sh
	# or
	make dev
	```
- Or use the VS Code task `Dev: Fullstack (Shell)` (it calls `./scripts/shell/start.sh`).

- Auto-start (tmux-based): the `devcontainer` includes a `postStartCommand` that runs the health-check and then starts the frontend and API in a `tmux` session (separate panes). This is enabled by default by setting `DEVCONTAINER_AUTO_START_SERVERS=true` in the container (`containerEnv` in `devcontainer.json`).
- To disable auto-start, set `DEVCONTAINER_AUTO_START_SERVERS=false` in your container environment or change the `devcontainer.json` setting before creating the container.


3. Reload VS Code: `Developer: Reload Window`.

## Notes

- `-backup` preserves your previous `.vscode/settings.json` as `.vscode/settings.json.bak`.
- If you prefer, open `.vscode\settings.json` and edit the `files.exclude` and `search.exclude` keys manually.

### Pre-commit guard

To help avoid accidental commits of per-developer VS Code settings, we added a pre-commit hook that blocks committing `.vscode/settings.json` or `.vscode/settings.json.bak`.
If you see the error in your pre-commit hook, unstage the file with:

```pwsh
git restore --staged .vscode/settings.json
```

If you intentionally want to track a workspace config, commit a template like `.vscode/extensions.json` or `.vscode/settings-controls/*` instead and update `.gitignore` appropriately.

## Tracked vs ignored (what you can commit)

- We intentionally do NOT commit per-developer `settings.json` changes. The repository's `.gitignore` lists `.vscode/settings.json` and `.vscode/settings.json.bak` as ignored to prevent accidental commits of local preferences.
- The following are tracked and should be checked in: `.vscode/extensions.json`, `.vscode/launch.json`, `.vscode/tasks.json`, and `.vscode/settings-controls/*` (templates and scripts used for toggling workspace behavior).
- If you need to add another tracked workspace configuration (e.g., `settings-workspace.json`), add it to `.gitignore` exceptions and commit the new file.

Alternative (short): you can run the npm scripts from the repo root:

```pwsh
npm run vscode:show
npm run vscode:hide
```

## Useful commands

```pwsh
# Show current settings
Get-Content .\.vscode\settings.json

# Swap to the "hidden" defaults
.\.vscode\settings-controls\toggle-settings.ps1 -mode hide -backup

# Swap to the "show" defaults
.\.vscode\settings-controls\toggle-settings.ps1 -mode show -backup
```

## Troubleshooting ⚠️

If you try the Microsoft "JavaScript & TypeScript Nightly" extension (`ms-vscode.vscode-typescript-next`) and run into issues, here are quick fixes you can try:

- Nightly server gives incorrect diagnostics or crashes:
	1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P).
	2. Run `TypeScript: Select TypeScript Version`.
	3. Choose `Use VS Code's Version` to revert to the built-in stable language service, or `Use Workspace Version` to use the repository `node_modules/typescript` version.
	4. Reload Window (Developer: Reload Window).

- Want to disable Nightly entirely (workspace-level): Open the Extensions view, search for `JavaScript & TypeScript Nightly`, and click **Disable (Workspace)** or **Disable (Always)** (uninstall if you prefer).

- Using Volar (Vue) and experiencing duplicate diagnostics or conflicting completions:
	- If you use Volar with TypeScript, prefer `Volar: Use Take Over Mode` (search from Command Palette) or disable the built-in TypeScript/JavaScript extension for the workspace in rare cases.
	- See `Volar` docs if you need to set `volar.takeOverMode`.

- Type checking errors after switching TypeScript versions:
	- Ensure the project `node_modules` are installed (`npm install`).
	- If you see TypeScript runtime mismatch errors (e.g., new types missing or different behavior), switch to `Use Workspace Version` and run `npm ci`.

- Nightly vs Workspace mismatch:
	- If the Nightly extension reports features your `typescript` version doesn't yet support, use `TypeScript: Select TypeScript Version` and pick `Use VS Code's Version` (the built-in server) or `Use Workspace Version` if you upgraded `typescript` locally.

- If performance regressions occur while using the Nightly server, revert to the standard server temporarily, and consider toggling `.vscode/settings-controls` to `hide` (which disables indexing of large folders), then reload the window.

If none of the above resolves your issue, open an issue in the repository with the extension version and the `TypeScript` version you're using. Include a short reproduction and any logs from `Help: Toggle Developer Tools` → Console.
