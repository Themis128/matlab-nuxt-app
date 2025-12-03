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
- Use issue references: `TODO: #1234 - handle edge cases` to link tasks to issue numbers.
- Keep TODOs short and actionable — they show nicely in the tree.
- Use `FIXME` for urgent, fix-in-next-deploy items.
- Use `REVIEW` for pull-request work and `DEPRECATED` where code should be removed.

## Contributing
If you add new TODO-style tags, update `.vscode/settings.json` and this guide so the team and CI can find them consistently.
