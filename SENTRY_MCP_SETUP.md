# Sentry MCP Server Setup for MatLab Application

This guide provides complete instructions for setting up and configuring the Sentry MCP (Model Context Protocol) server for your MatLab application.

## 🎯 Overview

The Sentry MCP server provides advanced monitoring, error tracking, and AI-powered debugging capabilities for your MatLab application. This integration enables:

- **Real-time error monitoring** with full stack traces
- **AI-powered debugging** using Sentry's advanced analysis
- **Performance monitoring** for your Nuxt.js application
- **Release tracking** and deployment monitoring
- **User feedback collection** and session replay

## 🚀 Quick Start

### 1. Configure Environment

Copy the example configuration:

```bash
cp .env.sentry .env
```

### 2. Add Your Sentry Access Token

1. Go to [Sentry.io](https://sentry.io/)
2. Navigate to **Settings → API → Auth Tokens**
3. Create a new token with these scopes:

   - `org:read`
   - `project:read`
   - `project:write`
   - `team:read`
   - `event:write`

4. Add the token to your `.env` file:

```env
SENTRY_ACCESS_TOKEN=your_token_here
```

### 3. Start the MCP Server

```bash
./start_sentry_mcp.sh
```

## 🔧 Configuration Options

### Environment Variables

| Variable              | Description                   | Required | Default                             |
| --------------------- | ----------------------------- | -------- | ----------------------------------- |
| `SENTRY_ACCESS_TOKEN` | Sentry API access token       | ✅ Yes   | -                                   |
| `SENTRY_ORG_SLUG`     | Your Sentry organization slug | ❌ No    | `themis128`                         |
| `SENTRY_PROJECT_SLUG` | Your Sentry project slug      | ❌ No    | `matlab-nuxt-app`                   |
| `SENTRY_MCP_SKILLS`   | Skills to enable              | ❌ No    | `inspect,triage,project-management` |
| `MCP_PORT`            | Port for MCP server           | ❌ No    | `5173`                              |

### Available Skills

- **inspect**: Deep code inspection and analysis
- **seer**: Advanced error prediction and prevention
- **docs**: Documentation generation and analysis
- **triage**: Automated issue triage and prioritization
- **project-management**: Project management integration

## 📋 Integration with MatLab Application

### 1. Update `mcp-server.js`

Ensure your MCP server configuration includes Sentry:

```javascript
// In mcp-server.js
Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://8a69bd6fe87e03fbdbc5a69103bb14d3@o4509865552445520',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.npm_package_version || 'mcp-server@1.0.0',
  tracesSampleRate: 1.0,
});
```

### 2. Add Sentry to Your Nuxt Config

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  // ... other config
  modules: ['@nuxtjs/sentry'],
  sentry: {
    dsn: 'https://8a69bd6fe87e03fbdbc5a69103bb14d3@o4509865552445520',
    config: {
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    },
  },
});
```

## 🛡️ Security Considerations

### Access Control

- **Token Security**: Keep your `SENTRY_ACCESS_TOKEN` secure
- **Network Security**: Ensure MCP server is behind proper authentication
- **Scope Limitation**: Use least-privilege principle for token scopes

### Monitoring

- **Rate Limiting**: Configure appropriate rate limits
- **Logging**: Enable comprehensive logging for auditing
- **Alerting**: Set up alerts for suspicious activity

## 🎓 Advanced Usage

### Custom Skills Configuration

To enable specific skills:

```bash
npx @sentry/mcp-server@latest \
  --access-token="$SENTRY_ACCESS_TOKEN" \
  --skills=inspect,triage,docs
```

### Self-Hosted Sentry

For self-hosted Sentry instances:

```bash
npx @sentry/mcp-server@latest \
  --access-token="$SENTRY_ACCESS_TOKEN" \
  --host=sentry.yourdomain.com
```

## 🔗 Useful Links

- **Sentry MCP Documentation**: https://mcp.sentry.dev
- **Sentry Main Dashboard**: https://sentry.io/
- **MatLab Project Dashboard**: https://sentry.io/organizations/themis128/projects/matlab-nuxt-app/

## 📊 Monitoring and Maintenance

### Health Checks

```bash
curl http://localhost:5173/health
```

### Logs

```bash
# View MCP server logs
tail -f mcp-server.log

# View Sentry integration logs
tail -f sentry-integration.log
```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failed**: Verify your `SENTRY_ACCESS_TOKEN` has correct scopes
2. **Connection Refused**: Check if MCP server is running (`ps aux | grep mcp-server`)
3. **Permission Denied**: Ensure proper file permissions for configuration files

### Debugging

Enable debug mode:

```bash
export SENTRY_DEBUG=true
./start_sentry_mcp.sh
```

## 📈 Performance Optimization

### Caching

Configure caching for better performance:

```env
MCP_CACHE_ENABLED=true
MCP_CACHE_TTL=3600
```

### Rate Limiting

Set appropriate rate limits:

```env
MCP_RATE_LIMIT=1000
MCP_BURST_LIMIT=500
```

## 🎉 Success!

Your Sentry MCP server is now configured and ready to provide advanced monitoring and debugging capabilities for your MatLab application. The integration provides:

- ✅ Real-time error tracking
- ✅ AI-powered debugging
- ✅ Performance monitoring
- ✅ Release tracking
- ✅ User feedback collection

**Next Steps**:

1. Start the MCP server: `./start_sentry_mcp.sh`
2. Integrate with your MatLab application
3. Monitor errors in real-time at [Sentry Dashboard](https://sentry.io/)
