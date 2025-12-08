#!/bin/bash
# Verify Security Fixes
# This script helps verify that security vulnerabilities have been fixed

set -e

echo "🔒 Security Fixes Verification"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if files exist
echo "📋 Checking fixed files..."
echo ""

FIXED_FILES=(
  "tools/run-eslint-mcp-fallback.js"
  "mcp-servers/todo-mcp-server/todo_mcp.py"
  "scripts/sentry/discover-and-fix.js"
  "scripts/sentry/fix-api-config.js"
  "scripts/sentry/analyze-issues.js"
  "server/api/user/settings.put.ts"
  "server/api/user/profile.get.ts"
  "server/api/notifications/mark-all-read.put.ts"
  "scripts/python/view_mat_file.py"
  "scripts/algolia/sync-phones-with-images.js"
  "python_api/enhanced_data_pipeline.py"
  "python_api/pickle_security.py"
  "server/utils/cors.ts"
)

MISSING_FILES=0
for file in "${FIXED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (missing)"
    MISSING_FILES=$((MISSING_FILES + 1))
  fi
done

echo ""
if [ $MISSING_FILES -gt 0 ]; then
  echo -e "${RED}❌ $MISSING_FILES file(s) missing${NC}"
  exit 1
else
  echo -e "${GREEN}✅ All fixed files present${NC}"
fi

echo ""
echo "🔍 Checking for security patterns..."
echo ""

# Check for insecure CORS patterns
echo "Checking for insecure CORS patterns..."
CORS_ISSUES=$(grep -r "Access-Control-Allow-Origin.*'\*'" server/api/ 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$CORS_ISSUES" ]; then
  echo -e "${YELLOW}⚠️  Found potential CORS issues:${NC}"
  echo "$CORS_ISSUES"
else
  echo -e "${GREEN}✓ No insecure CORS patterns found${NC}"
fi

# Check for command injection patterns
echo ""
echo "Checking for command injection patterns..."
INJECTION_ISSUES=$(grep -r "execSync.*\`" scripts/ tools/ 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$INJECTION_ISSUES" ]; then
  echo -e "${YELLOW}⚠️  Found potential command injection patterns:${NC}"
  echo "$INJECTION_ISSUES"
else
  echo -e "${GREEN}✓ No obvious command injection patterns found${NC}"
fi

# Check for hardcoded secrets
echo ""
echo "Checking for hardcoded secrets..."
SECRET_PATTERNS=("password.*=" "api.*key.*=" "token.*=" "secret.*=")
FOUND_SECRETS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
  MATCHES=$(grep -ri "$pattern" scripts/ --include="*.js" --include="*.ts" 2>/dev/null | grep -v "process.env" | grep -v "node_modules" || true)
  if [ -n "$MATCHES" ]; then
    echo -e "${YELLOW}⚠️  Potential hardcoded secrets found:${NC}"
    echo "$MATCHES" | head -5
    FOUND_SECRETS=1
  fi
done
if [ $FOUND_SECRETS -eq 0 ]; then
  echo -e "${GREEN}✓ No obvious hardcoded secrets found${NC}"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Run your security scanning tool to verify fixes"
echo "2. Test API endpoints with CORS validation"
echo "3. Review the security fixes summary: docs/SECURITY_FIXES_SUMMARY.md"
echo "4. Run integration tests to ensure functionality still works"
echo ""
echo -e "${GREEN}✅ Verification complete${NC}"
