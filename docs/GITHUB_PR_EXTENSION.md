# VS Code: GitHub Pull Request extension configuration (quick guide)

This repository includes workspace recommendations and a GitHub Actions workflow to validate pull requests faster.

What we added:

- `.vscode/extensions.json`: recommends `GitHub.vscode-pull-request-github` and `eamodio.gitlens` for working with PRs and Git insights.
- `.vscode/settings.json`: enables auto-fetch and recommended Git/PR defaults for your workspace.
- `.github/PULL_REQUEST_TEMPLATE.md`: standardizes PR descriptions.
- `.github/CODEOWNERS`: auto-requests repo maintainer(s) for review on PRs.
- `.github/workflows/pull-request.yml`: quick checks (typecheck, lint, pytest) that run on PRs for fast feedback.

How to use the extension locally:

1. Install the recommended extensions in VS Code (open the Extensions pane -> Workspace Recommended).
2. Sign into GitHub (Accounts view in the Activity Bar — sign in to GitHub to grant the extension access).
3. Open the Source Control side bar and navigate to the 'GitHub Pull Requests' view (it appears after signing in).
4. From the PR extension UI you can:
   - Create a new PR from your working branch
   - Review diffs, leave comments and file-level suggestions
   - Checkout PR branches and apply suggested fixes locally

Local tips:

- Use the `Dev: Nuxt + Python` task to run the app locally (`Ctrl+Shift+P` -> Tasks: Run Task -> `Dev: Nuxt + Python`).
- Use `npm run typecheck:ci` to run the TypeScript checks locally before opening a PR.
- Use `cd python_api && python -m pytest -q` to run Python tests locally.

Notes:

- The GitHub Pull Request extension uses the status checks provided by GitHub Actions to display PR checks.
- You can configure branch protection rules in the GitHub repository to require the new `Pull Request Quick Checks` job to pass before merging.

Automatic labeling and path-based reviewers:

- We configured `actions/labeler` with `.github/labeler.yml` to automatically add labels like `frontend`, `python`, `docs`, and `ml` based on changed file patterns.
- We also added `assign-reviewers-by-path.yml` which requests reviewers based on changed file patterns. Edit the mapping in the workflow file if you want to request different reviewers or teams.
