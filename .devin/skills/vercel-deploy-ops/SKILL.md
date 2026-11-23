---
name: vercel-deploy-ops
description: Diagnose and fix Vercel preview/production deployment failures for matlab-nuxt-app (Nuxt 4/Nitro on Vercel). Use when a Vercel deploy email arrives, a deployment is BLOCKED/ERROR/BUILDING-hung, or before pushing changes that could break the build. Covers the Vercel MCP server, the failure taxonomy seen in production, and local verification commands.
---

# Vercel deploy ops — matlab-nuxt-app

## Fixed identifiers

| Thing | Value |
|---|---|
| Vercel team | `baltzakis-projects` (slug) / `team_0xWIKbxEQcejRGqU7sH6JxzD` |
| Project | `matlab-nuxt-app` / `prj_ikPoojWE6jWqVAahn0K1RcrOrTlY` |
| Framework preset | `nuxtjs` (NOT `nuxt` — that slug is rejected) |
| Region | `fra1` |
| Active PR base branch | `claude/fix-issues-01TRhsHPvFhrEH1XDbeXRoYL` (most PRs target this, not `master`) |
| Repo | `https://github.com/Themis128/matlab-nuxt-app.git` |

## MCP workflow (vercel server)

Always go through the **`vercel` MCP server** — the `vercel` CLI is NOT installed locally.

1. `list_deployments` — `{"projectId": "prj_ikPoojWE6jWqVAahn0K1RcrOrTlY", "slug": "baltzakis-projects", "limit": 5}` — returns state (`QUEUED`/`BUILDING`/`READY`/`ERROR`/`BLOCKED`), commit sha, inspector URL. Filter by `sha` or `branch` to pin the deployment you care about.
2. `get_deployment` — details for one `dpl_*` id. NOTE: `withGitRepoInfo` must be passed as a **string** (`"true"`), not boolean.
3. `list_deployment_events` — build log stream; this is where the actual error lives. Look for the LAST error before the stream ends.
4. `get_runtime_logs` / `get_runtime_errors` — post-deploy app errors (only after READY).
5. `open_deployments` — interactive card view; good for watching a build finish.

If a call 403s on team scope: the connection is personal-scope only. Call `authorize_team_access`/`authorize_team_sso` and hand the user the returned URL — it needs one human click.

**Never trust GitHub checks as proof of deploy health.** GitHub CI can be green while Vercel fails, and vice versa. Only `list_deployments.state === "READY"` + a 200 on the preview URL is success.

## Failure taxonomy (all observed in production)

| Symptom in build events | Root cause | Fix |
|---|---|---|
| `vercel.json schema validation failed ... framework` | `"framework": "nuxt"` is not a valid slug | Use `"nuxtjs"` |
| `Function Runtimes must have a valid version` | legacy `functions` block pinning `server/**/*.ts` to `nodejs20.x` | Delete the `functions` block — Nitro bundles `server/**` into the framework function automatically |
| `deprecated "version": 2` | old vercel.json field | Remove it |
| Deployment `BLOCKED` before build | Vercel requires a commit authored by a verified GitHub identity | Fresh commit with a recognized author, push — do NOT try `create_deployment` redeploy on a blocked sha (`deployment_can_never_deploy`) |
| Build error: missing file e.g. `/avatar.png` | `public/` asset referenced but absent | Add the asset (e.g. `public/avatar.png`) |
| `RolldownError: Invalid end tag` / `SyntaxError: Invalid end tag` at `pages/X.vue:NNN` | Orphan closing tag (`</DPageLayout>`, extra `</div>`) left after template edits | Remove the orphan; run the template checker (below) across ALL `.vue` files — these bugs cluster |
| Nuxt build completes (`Build complete in Xs`) but deployment stays `BUILDING` forever; log says `process is still running: 1 timer` | A module-level `setInterval`/handle in `server/**` keeps the Node process alive during the Nitro build | Find the module-level timer (see below), add `.unref?.()` or lazy-init. Fixed instance: `server/utils/rate-limiter.ts` |
| Build succeeds, then deployment `ERROR` at `patchBuild`: `invalid_routes — Builder returned invalid routes: should NOT have fewer than 1 properties` | A `routeRules` entry with an empty `headers: {}` (e.g. `'/**': { headers: {} }` placeholder) — Nitro copies it verbatim into `.vercel/output/config.json` and Vercel's schema rejects empty header maps (nitrojs/nitro#4963) | Remove the no-op routeRule entirely (real headers live in `server/middleware/security-headers.ts`). Verify locally: `NITRO_PRESET=vercel npm run build` then check `.vercel/output/config.json` for `"headers": {}`. Fixed in #126 |
| Deployment stuck `QUEUED` for a long time | A previous deployment is hung in `BUILDING` holding the single build slot | `get_deployment` on the BUILDING one; if its build completed but state won't flip, `cancel_deployment` it — the queue drains immediately |
| Branch deployment `BLOCKED` while base-branch deployments `QUEUED`/`BUILDING`/`READY` | Expected — preview protection requires verified commit authors; only base-branch (squash-merge, user-authored) deploys are the health signal | Ignore branch BLOCKED; watch the merge-sha deployment instead |

### Hunting the build-hang timer

```bash
grep -rn "setInterval\|setTimeout" server/ --include="*.ts" | grep -v "=>" # then eyeball top-level vs inside functions
```

Only timers at **module top level** (executed on import during build) hang the build. Timers inside functions/handlers are fine. Fix pattern:

```ts
const t = setInterval(fn, ms);
(t as unknown as { unref?: () => void })?.unref?.();
```

## Local verification before pushing

```bash
cd ~/matlab-nuxt-app
npm run build            # full nuxt build — must exit cleanly AND the process must exit (no lingering timer)
python3 .devin/skills/vercel-deploy-ops/scripts/vue_template_check.py   # all .vue templates parse-balanced
npx vue-tsc --noEmit     # optional; typecheck was historically broken, don't block on it unless it regressed
```

`npm run build` completing but the shell **hanging** = the timer bug is still present. Ctrl-C and fix before pushing.

## Deploy loop

1. Push branch → open PR into `claude/fix-issues-01TRhsHPvFhrEH1XDbeXRoYL` (or the current active base — check `gh pr list` first).
2. `list_deployments` filtered by the merge sha → expect `BUILDING`.
3. On `ERROR`/`BLOCKED`: `list_deployment_events` → last error → apply taxonomy fix → new PR.
4. On `READY`: `open_deployments` or curl the `*.vercel.app` URL for a 200.
5. Builds take ~3–6 min; the Nitro step alone is ~18s. A build older than ~15 min in `BUILDING` is hung — check events for the "still running" warning.

## Gotchas learned the hard way

- Multiple QUEUED deployments pile up behind each other — always verify the sha you intend, not just "latest".
- A PR-branch deployment (`fix/...`) and the post-merge deployment on the base branch are DIFFERENT deployments; the merge sha is the one that matters.
- `BLOCKED` on branch deployments is expected/harmless (verified-commit rule applies to preview protection); the base-branch deployment is the signal.
- `vercel.json` minimal working config for this repo:
  ```json
  { "framework": "nuxtjs", "buildCommand": "npm run build", "installCommand": "npm install", "regions": ["fra1"], "env": { "NODE_ENV": "production" } }
  ```
