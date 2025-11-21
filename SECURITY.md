# Security Notes

## glob Package Vulnerability

There is a reported high-severity vulnerability in the `glob` package (versions 10.2.0 - 11.0.3) related to command injection in the CLI tool.

**Important:** This vulnerability only affects the `glob` command-line tool when used with the `-c/--cmd` flag. Since this Nuxt application uses `glob` as a library dependency (not as a CLI tool), **this vulnerability does not affect our application**.

The vulnerability is tracked in:
- GitHub Advisory: [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2)
- Affected versions: 10.2.0 - 11.0.3

**Current Status:**
- We're using `glob@11.0.3` via npm overrides
- The package is used as a library dependency by:
  - `@nuxt/ui` → `tailwindcss` → `sucrase`
  - `nuxt` → `nitropack` → `@vercel/nft`
- No CLI usage of `glob` in this project

**Action Required:**
- Monitor for updates to `glob` that fix this issue
- Consider alternative packages if a fix is not available
- This is a low-priority issue for our use case since we don't use the CLI
