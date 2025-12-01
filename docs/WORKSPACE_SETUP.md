# Workspace Setup & Editor Performance

This document explains how we configure Visual Studio Code for this repository to keep the editor responsive when working on large datasets and non-TS code (MATLAB, Python, CSV data, etc.).

## Why

- Some directories (e.g., `data`, `matlab`, `python_api`, `mobiles-dataset-docs`) contain many files and non-JS/TS artifacts. Indexing these in the TypeScript/JS language service and search slows development and increases memory usage.

## What we do

- We exclude these directories by default in `.vscode/settings.json` and `tsconfig.json` so the VS Code explorer, search and TypeScript language service do not index them.
- We keep `node_modules` and `venv` excluded by default for performance and to avoid accidental editing.

## Toggle editor visibility

If you need to work inside any of the excluded directories (for debugging or editing), follow the steps below:

1. Open a PowerShell terminal in the repo root.
2. Run either (from the repo root):

```pwsh
.\.vscode\settings-controls\toggle-settings.ps1 -mode show -backup
# or
.\.vscode\settings-controls\toggle-settings.ps1 -mode hide -backup
```

3. Reload VS Code: `Developer: Reload Window`.

## Notes

- `-backup` preserves your previous `.vscode/settings.json` as `.vscode/settings.json.bak`.
- If you prefer, open `.vscode\settings.json` and edit the `files.exclude` and `search.exclude` keys manually.

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
