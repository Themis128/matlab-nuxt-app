// Test MCP client to interact with the MCP server and generate real events
import * as Sentry from '@sentry/nuxt';

// Initialize Sentry for client-side MCP monitoring (aligned with Sentry best practices)
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
  release: process.env.npm_package_version || 'mcp-client@1.0.0',
});

// Simple MCP client implementation for testing
class SimpleMcpClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  async callTool(name /** @type {string} */, args /** @type {any} */) {
    const startTime = Date.now();
    const transaction = Sentry.startTransaction({
      name: `mcp_tool_call_${name}`,
      op: 'mcp.tool',
    });

    try {
      // Track tool usage with metrics
      Sentry.metrics.count('mcp_tool_call', 1, {
        tags: { tool_name: name },
      });

      // In a real implementation, this would make HTTP calls to the MCP server
      // For now, we'll simulate the calls and log them for Sentry monitoring

      console.warn(`🔧 Calling MCP tool: ${name}`);

      // Capture the operation start as a breadcrumb
      Sentry.addBreadcrumb({
        message: `Starting MCP tool: ${name}`,
        category: 'mcp',
        level: 'info',
        data: {
          tool: name,
          args: args,
        },
      });

      let result;
      switch (name) {
        case 'git_status':
          result = await this.simulateGitStatus(args);
          break;
        case 'list_directory':
          result = await this.simulateListDirectory(args);
          break;
        case 'get_today_date':
          result = await this.simulateGetDate(args);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      transaction.setStatus('ok');

      // Capture successful operation as a message
      Sentry.captureMessage(`MCP tool ${name} completed successfully`, 'info', {
        tags: {
          mcp_tool: name,
          mcp_operation: 'tool_call',
          outcome: 'success',
        },
        extra: {
          tool_args: args,
          result_summary:
            typeof result === 'object'
              ? JSON.stringify(result).slice(0, 500)
              : String(result).slice(0, 500),
        },
      });

      const responseTime = Date.now() - startTime;

      // Track response time with metrics
      Sentry.metrics.distribution('mcp_response_time', responseTime, {
        tags: { tool_name: name, outcome: 'success' },
      });

      console.warn(`✅ MCP tool ${name} completed successfully (${responseTime}ms)`);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Track failed response time
      Sentry.metrics.distribution('mcp_response_time', responseTime, {
        tags: { tool_name: name, outcome: 'error' },
      });

      transaction.setStatus('error');

      // Capture the error with full context
      Sentry.captureException(error, {
        tags: {
          mcp_tool: name,
          mcp_operation: 'tool_call',
          outcome: 'error',
        },
        extra: {
          tool_args: args,
          error_message: error.message,
          error_stack: error.stack,
          timestamp: new Date().toISOString(),
        },
      });

      console.error(`❌ MCP tool ${name} failed:`, error.message);
      throw error;
    } finally {
      transaction.finish();
    }
  }

  async simulateGitStatus(args) {
    // Simulate calling git status
    const { execSync } = await import('child_process');
    const status = execSync('git status --porcelain', {
      cwd: args.repo_path || process.cwd(),
      encoding: 'utf8',
    });

    return {
      content: [
        {
          type: 'text',
          text: `Git status: ${status || 'Working directory clean'}`,
        },
      ],
    };
  }

  async simulateListDirectory(args) {
    // Simulate listing directory contents
    const fs = await import('fs');
    const path = await import('path');
    const items = fs.readdirSync(args.path || '.');

    const detailed = items.map((item) => {
      const fullPath = path.join(args.path || '.', item);
      const stats = fs.statSync(fullPath);
      return `${stats.isDirectory() ? '[DIR]' : '[FILE]'} ${item}`;
    });

    return {
      content: [
        {
          type: 'text',
          text: `Directory contents:\n${detailed.join('\n')}`,
        },
      ],
    };
  }

  async simulateGetDate(args) {
    // Simulate getting current date
    const today = new Date().toISOString().split('T')[0];

    return {
      content: [
        {
          type: 'text',
          text: `Current date (UTC): ${today}`,
        },
      ],
    };
  }
}

async function testMcpClient() {
  console.warn('🚀 Starting MCP Client Test for Sentry monitoring...');
  console.warn('📊 This will generate real MCP events tracked by Sentry');

  // Send test metric to verify metrics are working
  Sentry.metrics.count('test_metric', 1);
  console.warn('📈 Test metric sent to Sentry');

  const client = new SimpleMcpClient('http://localhost:3001'); // Assuming server runs on port 3001

  const operations = [
    { name: 'get_today_date', args: {} },
    { name: 'list_directory', args: { path: '.' } },
    { name: 'git_status', args: { repo_path: '.' } },
  ];

  console.warn('🔄 Executing MCP operations...');

  for (const op of operations) {
    try {
      const result = await client.callTool(op.name, op.args);
      console.warn(`📋 Result: ${result.content[0].text.slice(0, 100)}...`);
    } catch (error) {
      // Error already logged by the client
    }

    // Small delay between operations
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.warn('✅ MCP Client Test completed!');
  console.warn('📊 Check your Sentry dashboard for detailed MCP operation traces');
  console.warn('🔗 Dashboard: https://sentry.io/organizations/baltzakisthemiscom/issues/');
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testMcpClient().catch((error) => {
    console.error('❌ MCP Client test failed:', error.message);
    process.exit(1);
  });
}

export { SimpleMcpClient, testMcpClient };
