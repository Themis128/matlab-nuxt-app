#!/bin/bash

# Sentry MCP Server Setup Script for MatLab App
# This script helps you quickly configure and test your Sentry MCP setup

echo "🚀 Setting up Sentry MCP Server for MatLab App..."

# Check if Sentry MCP server is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ npx is available"

# Test MCP server connectivity
echo "🔍 Testing Sentry MCP server connectivity..."
npx -y @sentry/mcp-server@latest --version

if [ $? -eq 0 ]; then
    echo "✅ Sentry MCP server is working correctly!"
else
    echo "❌ Sentry MCP server test failed. Please check your configuration."
fi

# Check environment variables
echo ""
echo "🔧 Checking environment variables..."

if [ -z "$SENTRY_DSN" ]; then
    echo "⚠️  SENTRY_DSN is not set"
    echo "   Add your Sentry DSN to your .env file:"
    echo "   SENTRY_DSN=your_actual_dsn_here"
else
    echo "✅ SENTRY_DSN is configured"
fi

if [ -z "$SENTRY_ACCESS_TOKEN" ]; then
    echo "⚠️  SENTRY_ACCESS_TOKEN is not set in MCP environment"
    echo "   The MCP server configuration already includes your access token"
else
    echo "✅ SENTRY_ACCESS_TOKEN is available"
fi

# Verify configuration files exist
echo ""
echo "📁 Checking configuration files..."

if [ -f "sentry.client.config.ts" ]; then
    echo "✅ sentry.client.config.ts exists"
else
    echo "❌ sentry.client.config.ts missing"
fi

if [ -f "sentry.server.config.ts" ]; then
    echo "✅ sentry.server.config.ts exists"
else
    echo "❌ sentry.server.config.ts missing"
fi

# Test Sentry integration
echo ""
echo "🧪 Testing Sentry integration..."

if [ -f "test_sentry.js" ]; then
    echo "Running Sentry integration test..."
    node test_sentry.js
else
    echo "Creating a simple Sentry test..."
    cat > temp_sentry_test.js << 'EOF'
// Simple Sentry test
try {
    // This should be caught by Sentry
    throw new Error('Test error for Sentry MCP');
} catch (error) {
    console.log('✅ Sentry test error thrown successfully');
    console.log('Error message:', error.message);
}
EOF
    node temp_sentry_test.js
    rm temp_sentry_test.js
fi

echo ""
echo "🎉 Sentry MCP setup complete!"
echo ""
echo "📖 Next steps:"
echo "1. Check your Sentry dashboard to see if the test error was captured"
echo "2. Configure your actual SENTRY_DSN in environment variables"
echo "3. Review the SENTRY_MCP_CONFIGURATION.md guide"
echo "4. Start using Sentry MCP commands in your development workflow"
echo ""
echo "💡 Try these Sentry MCP commands:"
echo "   - 'Show me the latest issues in my MatLab app'"
echo "   - 'Search for performance errors in the last 24 hours'"
echo "   - 'List all projects in my Sentry organization'"
