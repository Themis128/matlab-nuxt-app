#!/bin/bash

# Deployment Verification Script
# Checks if all deployment files are present and valid

echo "====================================="
echo "Deployment Files Verification"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check_file() {
    local file="$1"
    local description="$2"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description (Missing: $file)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_executable() {
    local file="$1"
    local description="$2"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if [ -f "$file" ] && [ -x "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    elif [ -f "$file" ]; then
        echo -e "${YELLOW}⚠${NC} $description (Not executable: $file)"
        chmod +x "$file" 2>/dev/null && echo -e "  ${GREEN}→${NC} Made executable"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description (Missing: $file)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

echo "(Optional) Docker Configuration:"
# Docker files are optional — prefer non-containerized SSH deploy
echo "(Legacy) Docker artifacts have been removed in favor of SSH artifact deploy."
check_file ".dockerignore" ".dockerignore file (optional)" || true

echo ""
echo "Server Configuration:"
check_file "infrastructure/nginx/nginx.conf" "Nginx configuration"
check_file "infrastructure/systemd/python-api.service" "Python API systemd service"
check_file "infrastructure/systemd/nuxt-app.service" "Nuxt App systemd service"

echo ""
echo "Automation Scripts:"
check_executable "infrastructure/scripts/deploy_production.sh" "Production deployment script"
check_executable "infrastructure/scripts/health_check.sh" "Health check script"
check_executable "infrastructure/scripts/backup.sh" "Backup script"

echo ""
echo "Environment Configuration:"
check_file ".env.production.template" "Environment variables template"

echo ""
echo "Documentation:"
check_file "docs/deployment/README.md" "Deployment guide"
check_file "docs/deployment/QUICK_REFERENCE.md" "Quick reference"
check_file "docs/deployment/DEPLOYMENT_SUMMARY.md" "Deployment summary"

echo ""
echo "Application Files:"
check_file "nuxt.config.ts" "Nuxt configuration"
check_file "python_api/api.py" "Python API main file"
check_file "python_api/requirements.txt" "Python dependencies"
check_file "package.json" "Node.js dependencies"

echo ""
echo "====================================="
echo "Verification Summary:"
echo "Total Checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"
echo "====================================="

if [ "$FAILED_CHECKS" -eq 0 ]; then
    echo -e "${GREEN}✅ All deployment files are present!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure environment: cp .env.production.template .env.production"
    echo "2. Edit .env.production with your actual values"
    echo "3. Choose deployment method:"
    echo "   - Traditional (recommended): sudo ./infrastructure/scripts/deploy_production.sh"
    echo "   - Optional (legacy): Docker Compose: cd infrastructure/legacy && docker-compose up -d"
    echo "4. Run health checks: sudo ./infrastructure/scripts/health_check.sh"
    echo ""
    echo "See docs/deployment/README.md for detailed instructions."
    exit 0
else
    echo -e "${RED}❌ Some deployment files are missing!${NC}"
    echo ""
    echo "Please ensure all files are present before deploying."
    exit 1
fi
