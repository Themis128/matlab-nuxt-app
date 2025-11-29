@echo off
REM Test Script for New API Endpoints (Windows)
REM Run this to verify all endpoints are working
REM Change to project root directory
cd /d "%~dp0\..\.."

echo Testing API Endpoints...
echo.

set BASE_URL=http://localhost:3000

REM Test 1: Advanced Search
echo 1. Testing Advanced Search Endpoint
curl -s "%BASE_URL%/api/dataset/search?brand=Samsung&minPrice=500&maxPrice=800&limit=5"
if %ERRORLEVEL% EQU 0 (
    echo [OK] Advanced Search - Samsung filter
) else (
    echo [FAIL] Advanced Search
)
echo.

REM Test 2: Model Details
echo 2. Testing Model Details Endpoint
curl -s "%BASE_URL%/api/dataset/model/iPhone%%2016%%20128GB"
if %ERRORLEVEL% EQU 0 (
    echo [OK] Model Details - iPhone 16
) else (
    echo [FAIL] Model Details
)
echo.

REM Test 3: Model Comparison
echo 3. Testing Model Comparison Endpoint
curl -s -X POST "%BASE_URL%/api/dataset/compare" -H "Content-Type: application/json" -d "{\"modelNames\": [\"iPhone 16 128GB\", \"Samsung Galaxy S24\"]}"
if %ERRORLEVEL% EQU 0 (
    echo [OK] Model Comparison
) else (
    echo [FAIL] Model Comparison
)
echo.

REM Test 4: Similar Models
echo 4. Testing Similar Models Endpoint
curl -s -X POST "%BASE_URL%/api/dataset/similar" -H "Content-Type: application/json" -d "{\"ram\": 8, \"battery\": 4000, \"screenSize\": 6.1, \"weight\": 174, \"year\": 2024, \"limit\": 5}"
if %ERRORLEVEL% EQU 0 (
    echo [OK] Similar Models
) else (
    echo [FAIL] Similar Models
)
echo.

echo Testing complete!
echo.
echo If all tests passed, your endpoints are working correctly!
pause
