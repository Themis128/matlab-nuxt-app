# TypeScript & Local Typecheck guidance

This file documents the typecheck configuration changes in this repository and how to use them locally.

Why we changed `tsconfig.json`

- The repository lives inside a multi-repo directory where sibling projects live as parent folders. The default `tsconfig` previously included parent directories which caused the TypeScript compiler to scan sibling repositories and cause huge memory usage and irrelevant type errors during a full scan.
- To fix this, `tsconfig.json` now scopes `include` to local source files only and uses a robust `exclude` list that explicitly excludes parent directories and `venv`.

Local vs CI configuration

- `tsconfig.ci.json` extends `tsconfig.json` and contains CI-friendly behavior. It is intended for continuous/integrated builds.
- `tsconfig.local.json` mirrors the same file list as `tsconfig.ci.json` and is intended to provide the same behavior locally and for IDE integrations, without scanning parent archives.

How to run type checks locally

- For a CI-like check (recommended):

```powershell
npm run typecheck:local
```

- For a full memory-based typecheck (keep an eye on memory):

```powershell
npm run typecheck:mem
```

- For CI usage: `npm run typecheck:ci` (this is what CI runs and should be consistent with local results)

Notes

- Do not run `vue-tsc` directly against `tsconfig.json` unless you want to use the repo scoped file. Use `tsconfig.local.json` if you want local checks to emulate CI behavior.
- We removed references to parent directories in `paths` and `include` to avoid unintended cross-repo resolution. If you need workspace or monorepo-style cross-package imports, consider using a package manager workspace or published packages.

If you see large file lists or unexpected errors referencing sibling repositories (e.g., `../llm-dev-agent`), ensure your `tsconfig` does not include parent paths and that `../**/*` is present in the `exclude` list.
