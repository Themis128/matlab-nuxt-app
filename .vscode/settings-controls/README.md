# VS Code Workspace Exclude Controls

This folder contains settings files and a small PowerShell script to toggle between `show` and `hide` variants of workspace settings (helpful if you need to edit big folders like `python_api`, `matlab`, or `data`).

Files:

- `settings-hide.json`: Default optimized settings that hide large folders to reduce indexing and file watcher overhead.
- `settings-show.json`: The opposite (unhide) variant for local debugging or when editing in the excluded folders.
- `toggle-settings.ps1`: PowerShell script to copy one of the two variants into `.vscode/settings.json`.

## How to use

From the repository root run (PowerShell):

```pwsh
.\.vscode\settings-controls\toggle-settings.ps1 -mode show -backup
# or
.\.vscode\settings-controls\toggle-settings.ps1 -mode hide -backup
```

On macOS or Linux (or if you prefer a POSIX shell):

```bash
./.vscode/settings-controls/toggle-settings.sh show
# or
./.vscode/settings-controls/toggle-settings.sh hide
```

The script will replace `.vscode/settings.json` and (optionally) create `.vscode/settings.json.bak` as a backup.
