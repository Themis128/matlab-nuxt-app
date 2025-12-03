# Node Modules Changes Log

This document tracks all changes made to node_modules dependencies, including installations, removals, and version updates for security, compatibility, and maintenance reasons.

📋 **For a complete inventory of all current dependencies with priority levels and detailed explanations, see [NODE_MODULES_INVENTORY.md](NODE_MODULES_INVENTORY.md).**

## 📅 Change Log

### 2025-12-03: Security Vulnerability Fixes

**Summary**: Resolved 2 high-severity security vulnerabilities in node_modules.

#### Issues Fixed:
1. **@modelcontextprotocol/sdk DNS Rebinding Protection** (GHSA-w48q-cv73-mx4w)
   - **Severity**: High
   - **Issue**: MCP TypeScript SDK did not enable DNS rebinding protection by default
   - **Original Version**: `^1.24.0` (non-existent)
   - **New Version**: `1.23.0-beta.0`
   - **Reason**: Version 1.24.0 didn't exist, causing installation failure. Beta version includes security fix.

2. **tar-fs Symlink Validation Bypass** (GHSA-vj76-c3g6-qr5v)
   - **Severity**: High
   - **Issue**: tar-fs had a symlink validation bypass when destination directory is predictable
   - **Affected Package**: `@involvex/cline-cli-win@1.1.17` (bundled dependency)
   - **Action**: Removed `@involvex/cline-cli-win` optional dependency
   - **Reason**: Vulnerability was in bundled dependency, couldn't be fixed automatically. Package wasn't actively used (project uses `npx cline` instead).

#### Package Changes:
- **Removed**: 85 packages (including @involvex/cline-cli-win and its dependencies)
- **Changed**: 1 package (@modelcontextprotocol/sdk)
- **Total Packages**: 1369 (down from 1454)

#### Before/After Status:
- **Before**: 2 high severity vulnerabilities
- **After**: 0 vulnerabilities

#### Verification:
```bash
npm audit
# Output: found 0 vulnerabilities
```

---

## 📋 Documentation Guidelines

### When to Document:
- Security vulnerability fixes
- Major version updates
- Package additions/removals
- Breaking changes
- Dependency conflicts resolutions

### What to Include:
- Date of change
- Summary of changes
- Specific packages affected
- Reasons for changes
- Before/after vulnerability status
- Verification commands/results

### Template for New Entries:
```markdown
### YYYY-MM-DD: [Brief Description]

**Summary**: [One-line summary of changes]

#### Issues Fixed:
1. **[Package Name] [Issue Title]** ([CVE/GHSA ID])
   - **Severity**: [Low/Medium/High/Critical]
   - **Issue**: [Brief description]
   - **Original Version**: [version]
   - **New Version**: [version]
   - **Reason**: [Why this change was made]

#### Package Changes:
- **Added**: [count] packages
- **Removed**: [count] packages
- **Changed**: [count] packages
- **Total Packages**: [new total] (changed from [old total])

#### Before/After Status:
- **Before**: [vulnerability count] vulnerabilities
- **After**: [vulnerability count] vulnerabilities
```

---

## 🔍 Current Package Status

### Critical Dependencies:
- **@modelcontextprotocol/sdk**: `1.23.0-beta.0` (DNS rebinding protection enabled)
- **@nuxt/ui**: `^2.19.0`
- **nuxt**: `^4.2.1`
- **vue**: (bundled with Nuxt)

### Security Notes:
- All high-severity vulnerabilities resolved
- Regular `npm audit` checks recommended
- Consider using `npm audit fix` for new vulnerabilities
- Review optional dependencies periodically

### Last Updated: 2025-12-03
