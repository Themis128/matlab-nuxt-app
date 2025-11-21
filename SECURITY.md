# Security Notes

## glob Package Vulnerability

There is a reported high-severity vulnerability in the `glob` package (versions 10.2.0 - 11.0.3) related to command injection in the CLI tool.

**Important:** This vulnerability only affects the `glob` command-line tool when used with the `-c/--cmd` flag. Since this Nuxt application uses `glob` as a library dependency (not as a CLI tool), **this vulnerability does not affect our application**.

The vulnerability is tracked in:
- GitHub Advisory: [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2)
- Affected versions: 10.2.0 - 11.0.3

**Current Status:**
- ✅ **FIXED:** Downgraded to `glob@10.1.0` via npm overrides (safe version, before vulnerability)
- The package is used as a library dependency by:
  - `@nuxt/ui` → `tailwindcss` → `sucrase`
  - `nuxt` → `nitropack` → `@vercel/nft`
- No CLI usage of `glob` in this project
- Vulnerability resolved by using version 10.1.0 (before affected range 10.2.0-11.0.3)

**Action Required:**
- ✅ Monitor for updates to `glob` that fix this issue
- ✅ Consider alternative packages if a fix is not available
- ✅ This is a low-priority issue for our use case since we don't use the CLI

**Fix Status:**
- ✅ **RESOLVED:** Fixed by downgrading to `glob@10.1.0` (safe version)
- ✅ All nested dependencies forced to use safe version via npm overrides
- ✅ npm audit now shows: `found 0 vulnerabilities`
- Last fixed: Current
- Method: npm overrides targeting all nested dependency paths

**Fix Applied:**
- ✅ Downgraded `glob` from `11.0.3` to `10.1.0` (safe version, before vulnerability range)
- ✅ Added comprehensive npm overrides for all nested dependencies:
  - `@vercel/nft > glob`
  - `archiver-utils > glob`
  - `replace-in-file > glob`
  - `sucrase > glob`
- ✅ Verified fix: `npm audit` shows **0 vulnerabilities**
- ✅ All nested dependencies now use `glob@10.1.0`

**Future Updates:**
1. Monitor for `glob@11.1.0+` which should fix the vulnerability
2. When available, update override to: `"glob": "^11.1.0"`
3. Run `npm install` to apply update

**Alternative Packages (if needed):**
- `fast-glob` - Faster alternative with similar API
- `node-glob` - Older, more stable version (v7.x)
- `minimatch` - Lower-level pattern matching (used by glob internally)
