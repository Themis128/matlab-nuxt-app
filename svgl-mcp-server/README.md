# SVGL MCP Server

A Model Context Protocol (MCP) server for accessing SVG logos from the SVGL API.

## Features

This MCP server provides the following tools:

### 1. search_svg_logos

Search for SVG logos by name or query.

- **Parameters:**
  - `query` (string, required): Search query (e.g., "github", "react", "typescript")
  - `limit` (number, optional): Maximum results (default: 10)

### 2. get_svg_logo

Retrieve SVG logo by brand name.

- **Parameters:**
  - `brand` (string, required): Brand name (e.g., "github", "react")
  - `size` (number, optional): Size of SVG (default: 24)
  - `format` (string, optional): Format to return - "svg" or "url" (default: "svg")

### 3. list_popular_brands

List popular brands and their logos.

- **Parameters:**
  - `category` (string, optional): Filter by category (e.g., "tech", "social", "programming")
  - `limit` (number, optional): Maximum results (default: 20)

### 4. get_logo_info

Get detailed information about a specific logo.

- **Parameters:**
  - `brand` (string, required): Brand name to get information about

## Installation

1. Install dependencies:

```bash
npm install
```

2. Run the server:

```bash
npm start
```

## Configuration

The server is configured in Cline's MCP settings at:

```
c:/Users/baltz/AppData/Roaming/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

## Usage in Cline

Once configured, the SVGL MCP server will be available in Cline's MCP server dropdown menu. You can use it to:

- Search for specific logo icons
- Retrieve SVG logos for popular brands
- Browse logos by category
- Get detailed information about logos

## Example Queries

- "Search for React logos"
- "Get the GitHub logo in SVG format"
- "List all technology company logos"
- "Get information about the TypeScript logo"
