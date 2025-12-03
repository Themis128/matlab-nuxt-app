# TODOs & TODO Tree configuration for this repository ✅

This project uses the VS Code "TODO Tree" extension to show project-wide TODOs, FIXMEs, and other developer markers in a single panel.

## Recommended Extensions

- `gruntfuggly.todo-tree` — TODO explorer & scan
- `wayou.vscode-todo-highlighting` — Highlights TODO comments in the editor

Add them via `.vscode/extensions.json` (already recommended for this workspace).

## Default Tags (supported by the workspace settings)
- TODO (general tasks)
- FIXME (broken code or immediate bugs)
- HACK (temporary or hacky implementation)
- BUG (confirmed bug)
- OPTIMIZE (optimization candidates)
- NOTE (notes for maintainers)
- REVIEW (code under review)
- DEPRECATED (deprecated API or code)
- QUESTION (open questions)

## Where To Use Comments

- JS/TS/Vue/HTML: `// TODO: ...` or `/* TODO: ... */`
- Python/PowerShell/Shell: `# TODO: ...`
- MATLAB: `% TODO: ...`
- YAML/JSON (strings): `TODO: ...` (string-based comments are allowed in JSON-like files)

The settings in `.vscode/settings.json` will scan the repo and show TODOs for those languages.

## Exclusions
The extension excludes certain directories by default to keep the tree focused:
- `node_modules`, `.git`, `.output`, `dist`, and virtual envs (`venv` / `.venv`) — see `.vscode/settings.json` for the full list.

## Tips for Use

## CI enforcement (optional)
You can enable CI enforcement to prevent PRs from being merged when critical TODOs remain. The repository includes a GitHub Actions workflow `check-critical-todos.yml` which runs on PRs and pushes to `master` / `main` and uses the `scripts/check-critical-todos.js` script to scan for critical tags such as `FIXME` and `BUG`.

To run locally:
```bash
npm run check:todos
```

You can change the tags checked by setting the environment variable `CRITICAL_TAGS`, e.g. `CRITICAL_TAGS=FIXME,BUG,CRITICAL npm run check:todos`.

If you'd like the CI check to only scan diffs for a PR (instead of the whole repo), we can enhance the workflow to use `git diff` and only scan changed files.


## VS Code Tasks
- `List TODOs (PowerShell)` — runs `.\scripts\list-todos.ps1` which lists TODOs in the repo
- `Check Critical TODOs (Node)` — runs `node ./scripts/check-critical-todos.js` and returns non-zero if critical tags found

Use the Command Palette (Ctrl/Cmd+Shift+P) and run `Tasks: Run Task` to select either task.

## Quick UI badge suggestion
Use the following GitHub Actions badge snippet in your README to show whether critical TODOs are present (or the state of other CI checks):

```md
![TODOs CI](https://github.com/<owner>/<repo>/actions/workflows/check-critical-todos.yml/badge.svg)
```

If you add new TODO-style tags, update `.vscode/settings.json` and this guide so the team and CI can find them consistently.
