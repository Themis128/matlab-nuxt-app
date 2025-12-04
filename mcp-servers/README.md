# MCP Servers Collection

This directory contains various Model Context Protocol (MCP) server implementations fetched from GitHub.

## Fetched MCP Servers

### 1. Official MCP Servers (`mcp-servers-official/`)

- **Source**: https://github.com/modelcontextprotocol/servers
- **Contains**: Core MCP server implementations including:
  - `filesystem/` - File system operations
  - `git/` - Git repository operations
  - `fetch/` - HTTP fetch operations
  - `memory/` - In-memory storage
  - `time/` - Time and date utilities
  - `everything/` - Combined server with all tools
  - `sequentialthinking/` - Sequential thinking patterns

### 2. GitHub MCP Server (`mcp-github/`)

- **Source**: https://github.com/github/github-mcp-server
- **Purpose**: GitHub API integration for repository management, issues, pull requests, etc.
- **Tools**: Repository operations, issue management, pull request handling, code search

### 3. Snyk MCP Server (`mcp-snyk/`)

- **Source**: https://github.com/snyk/snyk-ls
- **Purpose**: Security scanning and vulnerability assessment
- **Tools**: Code analysis, dependency scanning, security recommendations

### 4. Algolia MCP Server (`mcp-node/`)

- **Source**: https://github.com/algolia/mcp-node
- **Purpose**: Algolia search and analytics integration
- **Tools**: Search operations, analytics, index management

## Setup and Usage

Each MCP server directory contains its own setup instructions. Generally:

1. Navigate to the server directory
2. Install dependencies: `npm install` or `pip install -r requirements.txt`
3. Configure authentication tokens/API keys as needed
4. Run the server according to its documentation

## Integration with Your Application

These MCP servers can be integrated with MCP-compatible clients like Claude Desktop or custom applications using the MCP SDK.

For configuration examples, see the main project's `MCP_EVENTS_README.md` file.

## Note on Missing Servers

Some MCP servers mentioned in the documentation were not found at their expected GitHub locations:

- Playwright MCP Server (likely distributed via npm: `@executeautomation/playwright-mcp-server`)
- AWS Cost Explorer MCP Server (likely distributed via pip: `awslabs.cost-explorer-mcp-server`)

These can be installed via their respective package managers when needed.
