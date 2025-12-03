#!/bin/bash

# Sentry MCP Server Startup Script for MatLab Application
# This script starts the Sentry MCP server with proper configuration

echo "🚀 Starting Sentry MCP Server for MatLab Application..."

# Load environment variables
# First load main .env file, then load Sentry-specific configuration
if [ -f .env ]; then
    echo "📋 Loading main environment configuration from .env"
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ Error: .env file not found"
    exit 1
fi

if [ -f .env.sentry ]; then
    echo "📋 Loading Sentry MCP configuration from .env.sentry"
    export $(grep -v '^#' .env.sentry | xargs)
else
    echo "❌ Error: .env.sentry file not found"
    exit 1
fi

# Check if Sentry access token is configured
if [ -z "$SENTRY_ACCESS_TOKEN" ]; then
    echo "❌ Error: SENTRY_ACCESS_TOKEN is not configured"
    echo "Please add your Sentry access token to .env.sentry file"
    echo "Required scopes: org:read, project:read, project:write, team:read, event:write"
    exit 1
fi

echo "🔧 Configuration:"
echo "  - Environment: $NODE_ENV"
echo "  - Organization: $SENTRY_ORG_SLUG"
echo "  - Project: $SENTRY_PROJECT_SLUG"
echo "  - Skills: $SENTRY_MCP_SKILLS"
echo "  - Port: $MCP_PORT"
echo "  - Sentry Environment: $SENTRY_ENVIRONMENT"

# Start the Sentry MCP server with development environment settings
echo "🌐 Starting Sentry MCP server in $NODE_ENV mode on port $MCP_PORT..."

npx @sentry/mcp-server@latest \
    --access-token="$SENTRY_ACCESS_TOKEN" \
    --organization-slug="$SENTRY_ORG_SLUG" \
    --project-slug="$SENTRY_PROJECT_SLUG" \
    --skills="$SENTRY_MCP_SKILLS" \
    --sentry-dsn="$SENTRY_DSN" \
    --openai-base-url="$OPENAI_BASE_URL" \
    --openai-model="$OPENAI_MODEL"

# Additional development environment flags
if [ "$NODE_ENV" = "development" ]; then
    echo "🔍 Development mode enabled - additional debugging available"
    echo "📊 Access MCP server at: http://localhost:$MCP_PORT"
    echo "🔗 Sentry Dashboard: https://sentry.io/organizations/$SENTRY_ORG_SLUG/projects/$SENTRY_PROJECT_SLUG/"
fi

# Handle server startup
if [ $? -eq 0 ]; then
    echo "✅ Sentry MCP server started successfully!"
    echo "🔗 Server available at: http://localhost:$MCP_PORT"
    echo "📊 Dashboard: https://sentry.io/organizations/$SENTRY_ORG_SLUG/issues/"
else
    echo "❌ Failed to start Sentry MCP server"
    exit 1
fi
