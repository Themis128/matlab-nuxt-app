# GitHub MCP Server Setup Guide

## 🔍 Issue Analysis

The error you encountered was due to an incorrect assumption about the GitHub MCP server:

- **Error**: `npm notice Access token expired or revoked` and `npm error 404 Not Found - GET https://registry.npmjs.org/@anthropic-ai%2fgithub-mcp-server`
- **Root Cause**: The GitHub MCP server is a **Go-based application**, not an npm package
- **Why it failed**: There is no `@anthropic-ai/github-mcp-server` package in the npm registry

## ✅ Solutions

### Option 1: Remote Server (RECOMMENDED)

The easiest solution is to use the **hosted GitHub MCP server**:

**Configuration for your MCP host:**

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

**Or with GitHub PAT (if needed):**

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${input:github_mcp_pat}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "github_mcp_pat",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ]
}
```

### Option 2: Docker (Alternative)

If you want to run locally, the command would be:

```bash
docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_PAT} \
  ghcr.io/github/github-mcp-server
```

### Option 3: Build from Source (Advanced)

If you have Go installed:

```bash
cd mcp-servers/mcp-github
go build -o github-mcp-server ./cmd/github-mcp-server
./github-mcp-server --help
```

## 🔧 Requirements for GitHub Access

To use any of these options, you'll need a GitHub Personal Access Token:

1. **Create a PAT**: Go to https://github.com/settings/personal-access-tokens/new
2. **Required scopes**:
   - `repo` (for repository operations)
   - `read:packages` (for Docker access)
   - `read:org` (for organization operations)
3. **Store securely**: Use environment variables or secure storage

## 🎯 Recommended Next Steps

1. **Use Option 1 (Remote Server)** - it's the simplest and most reliable
2. **Configure your MCP host** with the JSON configuration above
3. **Create a GitHub PAT** for authentication
4. **Test the connection** by asking the MCP server to list your repositories

## 📚 More Information

- **Full documentation**: Available in `mcp-servers/mcp-github/README.md`
- **Tools available**: Issues, PRs, repositories, code search, CI/CD, and more
- **Security**: Use PAT with minimum required permissions
