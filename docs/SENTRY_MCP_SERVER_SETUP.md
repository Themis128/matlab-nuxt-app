# Sentry MCP Server Installation Guide

> **Created:** December 4, 2025
> **Repository:** https://github.com/getsentry/sentry-mcp
> **Status:** Configured (requires token setup)

---

## Overview

The Sentry MCP server provides AI coding assistants (like Cursor, Claude Code) with access to your Sentry issues, projects, and error tracking data. This enables:

- Debugging issues directly from your IDE
- Querying error events and stack traces
- Managing projects and releases
- AI-powered issue search (with OpenAI key)

---

## Quick Start (Recommended)

### Step 1: Get Your Sentry Auth Token

1. Go to [Sentry Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)
2. Click **"Create New Token"**
3. Select these scopes:
   - ✅ `org:read`
   - ✅ `project:read`
   - ✅ `project:write`
   - ✅ `team:read`
   - ✅ `team:write`
   - ✅ `event:write`
4. Copy the generated token

### Step 2: Update MCP Settings

Edit your Cursor MCP settings file:

```
C:\Users\baltz\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

Find the `github.com/getsentry/sentry-mcp` section and replace `YOUR_SENTRY_AUTH_TOKEN_HERE`:

```json
"github.com/getsentry/sentry-mcp": {
  "env": {
    "SENTRY_ACCESS_TOKEN": "your-actual-token-here",
    "OPENAI_API_KEY": ""
  }
}
```

### Step 3: Restart Cursor

Close and reopen Cursor to load the new MCP server configuration.

### Step 4: Verify Installation

The Sentry MCP tools should now be available. Try asking:

- "List my Sentry organizations"
- "Show recent issues in my project"

---

## Configuration Options

### Environment Variables

| Variable              | Required | Description                                      |
| --------------------- | -------- | ------------------------------------------------ |
| `SENTRY_ACCESS_TOKEN` | ✅ Yes   | Your Sentry User Auth Token                      |
| `SENTRY_HOST`         | ❌ No    | Self-hosted Sentry hostname (default: sentry.io) |
| `OPENAI_API_KEY`      | ❌ No    | Enables AI-powered search tools                  |

### Self-Hosted Sentry

For self-hosted installations, add the `--host` argument:

```json
"args": [
  "-y",
  "@sentry/mcp-server@latest",
  "--host=sentry.your-company.com"
]
```

Or set the environment variable:

```json
"env": {
  "SENTRY_HOST": "sentry.your-company.com"
}
```

---

## Available Tools

### Issue Management

| Tool                | Description                               |
| ------------------- | ----------------------------------------- |
| `resolve_short_id`  | Resolve a Sentry short ID to full issue   |
| `get_issue_details` | Get detailed issue information            |
| `get_issue_events`  | Get events for an issue                   |
| `list_issues`       | List issues in a project                  |
| `search_issues`     | AI-powered issue search (requires OpenAI) |
| `update_issue`      | Update issue status/assignment            |
| `assign_issue`      | Assign issue to team member               |

### Project & Organization

| Tool                       | Description                   |
| -------------------------- | ----------------------------- |
| `list_projects`            | List all projects             |
| `list_organizations`       | List accessible organizations |
| `list_teams`               | List teams in organization    |
| `get_project_details`      | Get project configuration     |
| `get_organization_details` | Get organization info         |
| `create_project`           | Create new project            |
| `create_team`              | Create new team               |

### Events & Search

| Tool            | Description                               |
| --------------- | ----------------------------------------- |
| `search_events` | AI-powered event search (requires OpenAI) |

### Releases

| Tool                  | Description             |
| --------------------- | ----------------------- |
| `get_release_details` | Get release information |
| `list_releases`       | List project releases   |
| `create_release`      | Create new release      |

---

## Alternative: Remote MCP Server

Instead of stdio transport, you can use Sentry's hosted remote MCP:

**URL:** https://mcp.sentry.dev

This uses OAuth authentication and doesn't require a local token. Connect via the MCP Inspector or supported clients.

---

## Local Development Setup

If you want to contribute or run a local development server:

```bash
# Navigate to cloned repository
cd mcp-servers/sentry-mcp

# Install dependencies
pnpm install

# Set up environment
make setup-env

# Configure OAuth (see README for details)
# Edit packages/mcp-cloudflare/.env

# Start development server
pnpm dev
```

---

## Troubleshooting

### Server Not Loading

1. Check token is correctly set (no quotes issues)
2. Verify token has all required scopes
3. Restart Cursor completely
4. Check MCP settings JSON is valid

### "Unauthorized" Errors

- Token may have expired - generate a new one
- Token may not have required scopes - check permissions
- Wrong Sentry instance - verify `SENTRY_HOST` if self-hosted

### AI Search Not Working

- `search_events` and `search_issues` require `OPENAI_API_KEY`
- Other tools work without OpenAI

### Connection Timeout

- Increase timeout in settings: `"timeout": 120`
- Check network/firewall settings

---

## Files Reference

| Path                              | Description                        |
| --------------------------------- | ---------------------------------- |
| `mcp-servers/sentry-mcp/`         | Cloned repository (reference only) |
| `cline_mcp_settings.json`         | MCP server configuration           |
| `docs/SENTRY_MCP_SERVER_SETUP.md` | This guide                         |

---

## Resources

- **Official Docs:** https://mcp.sentry.dev
- **GitHub:** https://github.com/getsentry/sentry-mcp
- **Sentry API:** https://docs.sentry.io/api/
- **MCP Protocol:** https://modelcontextprotocol.io/

---

**Need Help?**

- Check the [Sentry MCP README](../mcp-servers/sentry-mcp/README.md)
- Report issues: https://github.com/getsentry/sentry-mcp/issues
