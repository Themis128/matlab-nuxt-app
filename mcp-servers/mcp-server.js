import * as Sentry from '@sentry/nuxt';

// Initialize Sentry for MCP monitoring (aligned with Sentry best practices)
Sentry.init({
  dsn: 'https://8a69bd6fe87e03fbdbc5a69103bb14d3@o4509865549561856.ingest.de.sentry.io/4509865552445520',

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing
  tracesSampleRate: 1.0,

  // Set tracePropagationTargets to control for which URLs trace propagation should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],

  environment: process.env.NODE_ENV || 'development',

  // Release version (can be dynamic in production)
  release: process.env.npm_package_version || 'mcp-server@1.0.0',
});

// Create a basic MCP server implementation (simplified for demonstration)
class SimpleMcpServer {
  constructor(config) {
    this.config = config;
    this.handlers = new Map();
  }

  setRequestHandler(method, handler) {
    this.handlers.set(method, handler);
  }

  async handleRequest(request) {
    const handler = this.handlers.get(request.method);
    if (!handler) {
      throw new Error(`No handler for method: ${request.method}`);
    }
    return await handler(request);
  }

  async connect(transport) {
    // Simplified connection - in real implementation would handle transport
    console.warn('MCP Server connected (simplified implementation)');
  }
}

const server = new SimpleMcpServer({
  name: 'matlab-mcp-server',
  version: '1.0.0',
});

// Example tool implementation - Git status
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();

  // Track server-side tool usage
  Sentry.metrics.count('mcp_server_tool_call', 1, {
    tags: { tool_name: name },
  });

  switch (name) {
    case 'git_status':
      try {
        // Simulate git status check
        const { execSync } = await import('child_process');
        const status = execSync('git status --porcelain', {
          cwd: args.repo_path || process.cwd(),
          encoding: 'utf8',
        });

        return {
          content: [
            {
              type: 'text',
              text: `Git status for ${args.repo_path}:\n${status || 'Working directory clean'}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Git status failed: ${error.message}`);
      }

    case 'list_directory':
      try {
        const fs = await import('fs');
        const path = await import('path');

        // Security: Validate and sanitize the path to prevent path traversal
        if (!args.path || typeof args.path !== 'string') {
          throw new Error('Invalid path parameter');
        }

        // Resolve to absolute path and check it's within allowed directories
        const resolvedPath = path.resolve(args.path);
        const allowedDirs = [
          'd:\\Nuxt Projects\\MatLab',
          'C:\\Users\\baltz\\Documents',
          'C:\\Users\\baltz\\Desktop',
        ];

        // Check if resolved path is within any allowed directory
        const isPathAllowed = allowedDirs.some((allowedDir) => {
          const relative = path.relative(allowedDir, resolvedPath);
          return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
        });

        if (!isPathAllowed) {
          throw new Error('Access to this directory is not allowed');
        }

        const items = fs.readdirSync(resolvedPath);

        const detailed = items.map((item) => {
          const fullPath = path.join(resolvedPath, item);
          const stats = fs.statSync(fullPath);
          return `${stats.isDirectory() ? '[DIR]' : '[FILE]'} ${item}`;
        });

        return {
          content: [
            {
              type: 'text',
              text: `Contents of ${resolvedPath}:\n${detailed.join('\n')}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Directory listing failed: ${error.message}`);
      }

    case 'get_today_date':
      try {
        const today = new Date().toISOString().split('T')[0];
        return {
          content: [
            {
              type: 'text',
              text: `Today's date (UTC): ${today}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Date retrieval failed: ${error.message}`);
      }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Handle listTools request
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'git_status',
        description: 'Get git repository status',
        inputSchema: {
          type: 'object',
          properties: {
            repo_path: {
              type: 'string',
              description: 'Path to git repository',
            },
          },
        },
      },
      {
        name: 'list_directory',
        description: 'List contents of a directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Directory path to list',
            },
          },
        },
      },
      {
        name: 'get_today_date',
        description: 'Get current date',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Start the server
async function main() {
  console.warn('🚀 Starting MATLAB MCP Server with Sentry monitoring...');

  // For this example, we'll use stdio transport
  const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.warn('✅ MCP Server connected and monitoring active');
  console.warn('📊 All MCP operations will be tracked in Sentry');
  console.warn('🔗 Dashboard: https://sentry.io/organizations/baltzakisthemiscom/issues/');
}

// Run the server
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ MCP Server failed to start:', error.message);
    process.exit(1);
  });
}

export { server, main };
