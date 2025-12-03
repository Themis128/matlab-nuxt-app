# MCP Events Monitoring Setup

This guide explains how to set up MCP (Model Context Protocol) monitoring with Sentry for your Nuxt.js application.

## Current Setup

Your application already has Sentry configured with MCP monitoring enabled:

- **Client Config** (`sentry.client.config.ts`): `sendDefaultPii: true` enables MCP monitoring
- **Server Config** (`sentry.server.config.ts`): `sendDefaultPii: true` enables MCP monitoring

## MCP Events Test Script

The `test_mcp_events.js` script demonstrates how to generate MCP events for monitoring. It currently simulates MCP operations but shows the pattern for real implementation.

### Running the Test

```bash
node test_mcp_events.js
```

This will simulate various MCP operations and generate test events that Sentry can monitor.

## Available MCP Servers

Your environment has the following MCP servers configured:

### 1. Git MCP Server

- **Command**: `uvx mcp-server-git --repository d:/Nuxt Projects/MatLab`
- **Tools**: git_status, git_diff_unstaged, git_diff_staged, git_diff, git_commit, git_add, git_reset, git_log, git_create_branch, git_checkout, git_show, git_branch

### 2. Filesystem MCP Server

- **Command**: `github.com/modelcontextprotocol/servers/tree/main/src/filesystem`
- **Tools**: read_file, read_text_file, read_media_file, read_multiple_files, write_file, edit_file, create_directory, list_directory, list_directory_with_sizes, directory_tree, move_file, search_files, get_file_info, list_allowed_directories

### 3. GitHub MCP Server

- **Command**: `docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server`
- **Tools**: add_comment_to_pending_review, add_issue_comment, assign_copilot_to_issue, create_branch, create_or_update_file, create_pull_request, create_repository, delete_file, fork_repository, get_file_contents, get_label, get_latest_release, get_me, get_release_by_tag, get_tag, get_team_members, get_teams, issue_read, issue_write, list_branches, list_commits, list_issue_types, list_issues, list_pull_requests, list_releases, list_tags, merge_pull_request, pull_request_read, pull_request_review_write, push_files, request_copilot_review, search_code, search_issues, search_pull_requests, search_repositories, search_users, sub_issue_write, update_pull_request, update_pull_request_branch

### 4. Snyk MCP Server

- **Command**: `github.com/snyk/snyk-ls`
- **Tools**: snyk_aibom, snyk_auth, snyk_code_scan, snyk_container_scan, snyk_iac_scan, snyk_logout, snyk_open_learn_lesson, snyk_sbom_scan, snyk_sca_scan, snyk_send_feedback, snyk_trust, snyk_version

### 5. Playwright MCP Server

- **Command**: `npx -y @executeautomation/playwright-mcp-server`
- **Tools**: start_codegen_session, end_codegen_session, get_codegen_session, clear_codegen_session, playwright_navigate, playwright_screenshot, playwright_click, playwright_iframe_click, playwright_iframe_fill, playwright_fill, playwright_select, playwright_hover, playwright_upload_file, playwright_evaluate, playwright_console_logs, playwright_close, playwright_get, playwright_post, playwright_put, playwright_patch, playwright_delete, playwright_expect_response, playwright_assert_response, playwright_custom_user_agent, playwright_get_visible_text, playwright_get_visible_html, playwright_go_back, playwright_go_forward, playwright_drag, playwright_press_key, playwright_save_as_pdf, playwright_click_and_switch_tab

### 6. AWS Cost Explorer MCP Server

- **Command**: `C:\Users\baltz\AppData\Local\Microsoft\WinGet\Packages\astral-sh.uv_Microsoft.Winget.Source_8wekyb3d8bbwe\uv.exe tool run --from awslabs.cost-explorer-mcp-server@latest awslabs.cost-explorer-mcp-server.exe`
- **Tools**: get_today_date, get_dimension_values, get_tag_values, get_cost_forecast, get_cost_and_usage_comparisons, get_cost_comparison_drivers, get_cost_and_usage

## Setting Up Real MCP Monitoring

To generate real MCP events instead of simulated ones:

### 1. Install Required SDKs

```bash
# MCP SDK for Model Context Protocol support
npm install @modelcontextprotocol/sdk

# Sentry SDK for Nuxt.js (includes both client and server monitoring)
npm install @sentry/nuxt
```

**Note**: We're using `@sentry/nuxt` which provides integrated monitoring for Nuxt.js applications. This handles both server-side (SSR) and client-side (browser) monitoring automatically.

**SDK Choice Guide**:

- `@sentry/nuxt`: Nuxt.js applications (both server and browser)
- `@sentry/node`: Node.js server applications only
- `@sentry/browser`: Browser-only applications (use Loader Script for simple setup)
- Loader Script: CDN-based browser monitoring (what you see in the documentation above)

### 2. Configure Sentry for MCP Monitoring

Update your Sentry configuration to properly initialize MCP monitoring:

```javascript
// Import with `import * as Sentry from "@sentry/nuxt"` if you are using ESM
const Sentry = require('@sentry/nuxt')

Sentry.init({
  dsn: 'https://8a69bd6fe87e03fbdbc5a69103bb14d3@o4509865549561856.ingest.de.sentry.io/4509865552445520',
  // Tracing must be enabled for MCP monitoring to work
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
})
```

### 3. Create MCP Server with Sentry Monitoring

Create a new file `mcp-server.js` for your MCP server setup:

```javascript
const { McpServer } = require('@modelcontextprotocol/sdk')
const Sentry = require('@sentry/nuxt')

// Initialize Sentry (if not already done in your main app)
Sentry.init({
  dsn: 'https://8a69bd6fe87e03fbdbc5a69103bb14d3@o4509865549561856.ingest.de.sentry.io/4509865552445520',
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
})

// Wrap your MCP server with Sentry monitoring
const server = Sentry.wrapMcpServerWithSentry(
  new McpServer({
    name: 'matlab-mcp-server',
    version: '1.0.0',
  })
)

// Your MCP server implementation here
// All server interactions will now be automatically monitored by Sentry
```

### 4. Create MCP Client Setup (Alternative)

If you prefer client-side monitoring, create `mcp-client.js`:

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'

// MCP client setup code here
// This would connect to your MCP servers and provide the use_mcp_tool function
```

### 3. Replace Simulated Calls

In `test_mcp_events.js`, replace simulated calls with real MCP tool calls:

```javascript
// Instead of simulation:
console.warn('✅ Git status operation simulated')
events.push({ type: 'git_status', simulated: true })

// Use real MCP calls:
const gitStatus = await use_mcp_tool({
  server_name: 'uvx mcp-server-git --repository d:/Nuxt Projects/MatLab',
  tool_name: 'git_status',
  arguments: {
    repo_path: 'd:/Nuxt Projects/MatLab',
  },
})
events.push({ type: 'git_status', data: gitStatus })
```

### 4. Environment Setup

Ensure your environment has:

- **GitHub Token**: Set `GITHUB_PERSONAL_ACCESS_TOKEN` for GitHub MCP server
- **AWS Credentials**: Configure AWS credentials for Cost Explorer MCP server
- **Snyk Token**: Set up Snyk authentication for security scanning

## Monitoring MCP Events in Sentry

Once MCP monitoring is active:

1. Run your application with MCP operations
2. Check your Sentry dashboard at: https://sentry.io/organizations/baltzakisthemiscom/issues/
3. Look for events tagged with MCP operations
4. Monitor performance and error rates of MCP tool usage

## Example MCP Operations to Monitor

- **Git Operations**: Repository status checks, commits, branching
- **File Operations**: Reading/writing files, directory listings
- **GitHub Operations**: Issue management, pull request reviews, repository searches
- **Security Scanning**: Snyk vulnerability scans, code analysis
- **Browser Automation**: Playwright test automation, screenshot capture
- **HTTP Operations**: API calls, data fetching
- **AWS Cost Analysis**: Cost monitoring, usage analysis

## Sentry Inbound Data Filters Configuration

For proper MCP event monitoring, configure your Sentry inbound data filters:

### **Recommended Filter Settings**

#### ✅ **Safe to Enable**

- **Browser Extension Errors**: Filter out extension-related errors (doesn't affect MCP)
- **Health Check Transactions**: Filter synthetic health checks
- **Legacy Browsers**: Filter old browser versions (MCP operations use modern Node.js)
- **Web Crawlers**: Filter bot traffic (may affect MCP if using crawler-like patterns)

#### ⚠️ **Review Carefully**

- **Localhost Events**: Currently DISABLED - Keep disabled to capture MCP server events running on localhost
- **Hydration Errors**: Depends on your frontend setup
- **ChunkLoadError**: May occur during deployments

#### ❌ **Should Be Disabled for MCP**

- **Localhost Filtering**: DISABLE this filter - MCP servers often run on localhost during development
- **IP Address Filtering**: Don't block your server's IP ranges

### **Custom Filters Setup**

Add these custom filters to avoid noise:

**Error Message Filters:**

```
TypeError: *extension*
ReferenceError: *extension*
*chrome-extension*
*moz-extension*
*safari-extension*
```

**Log Message Filters:**

```
*health check*
*synthetic*
*monitoring*
```

### **Testing Filter Configuration**

1. Run MCP operations: `node test_mcp_client.js`
2. Check Sentry dashboard for events
3. Verify events aren't being filtered (check "Events filtered in last 30 days")
4. Adjust filters as needed

## Enhanced Error & Message Capturing

Our MCP monitoring implementation follows Sentry's best practices for capturing errors and messages:

### **Error Capturing**

```javascript
// Automatic exception capturing with full context
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
})
```

### **Message Capturing**

```javascript
// Success messages for monitoring
Sentry.captureMessage(`MCP tool ${name} completed successfully`, 'info', {
  tags: {
    mcp_tool: name,
    mcp_operation: 'tool_call',
    outcome: 'success',
  },
  extra: {
    tool_args: args,
    result_summary: '...',
  },
})
```

### **Breadcrumb Tracking**

```javascript
// Track operation flow
Sentry.addBreadcrumb({
  message: `Starting MCP tool: ${name}`,
  category: 'mcp',
  level: 'info',
  data: { tool: name, args: args },
})
```

## Metrics Tracking

Sentry metrics are automatically enabled and provide quantitative monitoring of MCP operations:

### **Client-Side Metrics**

```javascript
// Tool usage counting
Sentry.metrics.count('mcp_tool_call', 1, {
  tags: { tool_name: name },
})

// Response time distribution
Sentry.metrics.distribution('mcp_response_time', responseTime, {
  tags: { tool_name: name, outcome: 'success' },
})
```

### **Server-Side Metrics**

```javascript
// Server tool call counting
Sentry.metrics.count('mcp_server_tool_call', 1, {
  tags: { tool_name: name },
})
```

### **Metrics Available in Sentry**

- **Count Metrics**: `mcp_tool_call`, `mcp_server_tool_call`, `test_metric`
- **Distribution Metrics**: `mcp_response_time` (response times in milliseconds)
- **Custom Tags**: Filter by `tool_name`, `outcome`, and `operation` type

**View metrics in Sentry**: Dashboard → Metrics → Filter by `mcp_tool_call` or `mcp_response_time`

### **Metrics Verification**

✅ **Test Metric Sent**: `Sentry.metrics.count('test_metric', 1)` successfully executed
✅ **MCP Metrics Active**: Tool calls and response times being tracked
✅ **Server Metrics Active**: Server-side tool operations monitored

## Source Maps Configuration for Readable Stack Traces

For production-ready MCP monitoring, configure source maps to get readable stack traces in Sentry error reports:

### **Source Map Setup for Nuxt.js**

```bash
# Use Sentry Wizard for automatic setup
npx @sentry/wizard@latest -i sourcemaps
```

This will:

- Configure your Nuxt.js build to generate source maps
- Set up automatic uploading to Sentry during production builds
- Ensure readable stack traces for MCP server errors

### **Environment Setup**

Add your Sentry authentication token to your environment variables:

```bash
# In your .env file (copy from .env.example)
SENTRY_AUTH_TOKEN=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

# In CI/CD environments (GitHub Actions, etc.)
# Add SENTRY_AUTH_TOKEN as a secret/environment variable
```

### **Manual Source Map Configuration**

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  sourcemap: {
    server: true,
    client: true,
  },
  // ... other config
})
```

### **Source Map Benefits for MCP Monitoring**

- **Readable Stack Traces**: See exact lines in your MCP server code
- **Better Debugging**: Quickly identify issues in MCP tool implementations
- **Production Debugging**: Debug minified production code effectively

### **Testing Source Maps**

1. Deploy with source maps enabled
2. Trigger an MCP error (the test script includes one)
3. Check Sentry for readable stack traces in error reports

## Best Practices

1. **Error Handling**: Wrap MCP calls in try-catch blocks with comprehensive error context
2. **Message Capturing**: Log successful operations for monitoring and analytics
3. **Breadcrumb Tracking**: Record operation flow for debugging complex issues
4. **Source Maps**: Enable source maps for readable production stack traces
5. **Rate Limiting**: Be mindful of API rate limits for external services
6. **Authentication**: Securely manage API tokens and credentials
7. **Logging**: Log MCP operations for debugging and monitoring
8. **Performance**: Monitor response times of MCP operations
9. **Fallbacks**: Implement fallback behavior when MCP servers are unavailable
10. **Filter Configuration**: Regularly review and update Sentry filters to ensure MCP events are captured
