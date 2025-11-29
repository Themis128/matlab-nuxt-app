#!/bin/bash

# MATLAB Mobile Dataset Health Check Script
# Usage: ./health_check.sh

# Configuration
PYTHON_API_URL="${PYTHON_API_URL:-http://localhost:8000}"
NUXT_APP_URL="${NUXT_APP_URL:-http://localhost:3000}"
TIMEOUT=10

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $name"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $name (Expected: $expected_status, Got: $response)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

echo "====================================="
echo "MATLAB Mobile Dataset - Health Check"
echo "====================================="
echo ""

# Python API checks
echo "Python API Checks:"
check_endpoint "Health endpoint" "$PYTHON_API_URL/health"
check_endpoint "Docs endpoint" "$PYTHON_API_URL/docs"

echo ""
echo "Analytics Endpoints:"
check_endpoint "EDA Summary" "$PYTHON_API_URL/api/analytics/eda/summary"
check_endpoint "Outliers Detection" "$PYTHON_API_URL/api/analytics/eda/outliers"
check_endpoint "Distributions" "$PYTHON_API_URL/api/analytics/eda/distributions"
check_endpoint "Brand Positioning" "$PYTHON_API_URL/api/analytics/market/brands"
check_endpoint "Price Segments" "$PYTHON_API_URL/api/analytics/market/segments"
check_endpoint "Yearly Trends" "$PYTHON_API_URL/api/analytics/market/trends"

echo ""
echo "Prediction Endpoints (POST - checking availability):"
check_endpoint "Price Prediction" "$PYTHON_API_URL/api/predict/price" "422"
check_endpoint "RAM Prediction" "$PYTHON_API_URL/api/predict/ram" "422"
check_endpoint "Battery Prediction" "$PYTHON_API_URL/api/predict/battery" "422"
check_endpoint "Brand Prediction" "$PYTHON_API_URL/api/predict/brand" "422"

echo ""
echo "Dataset Endpoints:"
check_endpoint "Dataset Info" "$PYTHON_API_URL/api/dataset/info"
check_endpoint "Dataset Stats" "$PYTHON_API_URL/api/dataset/stats"
check_endpoint "Models Info" "$PYTHON_API_URL/api/models/info"

echo ""
# Nuxt App checks
echo "Nuxt App Checks:"
check_endpoint "Home Page" "$NUXT_APP_URL/"
check_endpoint "Analytics Page" "$NUXT_APP_URL/analytics"
check_endpoint "Predict Page" "$NUXT_APP_URL/predict"
check_endpoint "Explore Page" "$NUXT_APP_URL/explore"
check_endpoint "Compare Page" "$NUXT_APP_URL/compare"

echo ""
echo "====================================="
echo "Summary:"
echo "Total Checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"
echo "====================================="

if [ "$FAILED_CHECKS" -eq 0 ]; then
    echo -e "${GREEN}All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Some health checks failed!${NC}"
    exit 1
fi
