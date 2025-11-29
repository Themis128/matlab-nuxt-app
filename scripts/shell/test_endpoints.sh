#!/bin/bash

# Test Script for New API Endpoints
# Run this to verify all endpoints are working

echo "🧪 Testing API Endpoints..."
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4

    echo -n "Testing $name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Response: $body"
        return 1
    fi
}

# Test 1: Advanced Search
echo "1. Testing Advanced Search Endpoint"
test_endpoint "Advanced Search (Samsung, $500-$800)" \
    "GET" \
    "$BASE_URL/api/dataset/search?brand=Samsung&minPrice=500&maxPrice=800&limit=5"

test_endpoint "Advanced Search (8GB+ RAM)" \
    "GET" \
    "$BASE_URL/api/dataset/search?minRam=8&sortBy=price&sortOrder=asc&limit=5"

echo ""

# Test 2: Model Details
echo "2. Testing Model Details Endpoint"
test_endpoint "Model Details (iPhone 16)" \
    "GET" \
    "$BASE_URL/api/dataset/model/iPhone%2016%20128GB"

test_endpoint "Model Details (Samsung Galaxy S24)" \
    "GET" \
    "$BASE_URL/api/dataset/model/Samsung%20Galaxy%20S24"

echo ""

# Test 3: Model Comparison
echo "3. Testing Model Comparison Endpoint"
test_endpoint "Compare Models" \
    "POST" \
    "$BASE_URL/api/dataset/compare" \
    '{"modelNames": ["iPhone 16 128GB", "Samsung Galaxy S24"]}'

echo ""

# Test 4: Similar Models
echo "4. Testing Similar Models Endpoint"
test_endpoint "Similar Models" \
    "POST" \
    "$BASE_URL/api/dataset/similar" \
    '{"ram": 8, "battery": 4000, "screenSize": 6.1, "weight": 174, "year": 2024, "price": 799, "limit": 5}'

echo ""

# Test 5: Existing Endpoints (Quick Check)
echo "5. Testing Existing Endpoints"
test_endpoint "Models by Price" \
    "GET" \
    "$BASE_URL/api/dataset/models-by-price?price=800&tolerance=0.2&maxResults=5"

test_endpoint "Dataset Statistics" \
    "GET" \
    "$BASE_URL/api/dataset/statistics"

echo ""

echo "✅ Testing complete!"
echo ""
echo "If all tests passed, your endpoints are working correctly!"
echo "If any tests failed, check:"
echo "  1. Is the Nuxt server running? (npm run dev)"
echo "  2. Is the dataset file present? (Mobiles Dataset (2025).csv)"
echo "  3. Check the error messages above"
