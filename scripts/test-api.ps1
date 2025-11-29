# Test Python API Endpoints
# Run with: .\scripts\test-api.ps1

param(
    [string]$BaseUrl = "http://localhost:8000",
    [switch]$Verbose
)

Write-Host "🧪 Testing Python API at $BaseUrl" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣  Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET
    Write-Host "   ✅ API is healthy!" -ForegroundColor Green
    Write-Host "   Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Price Prediction
Write-Host "2️⃣  Testing Price Prediction..." -ForegroundColor Yellow
$priceBody = @{
    ram = 8
    battery = 5000
    screen = 6.5
    weight = 180
    year = 2024
    company = "Samsung"
    front_camera = 32
    back_camera = 108
    processor = "Snapdragon 8 Gen 2"
    storage = 256
} | ConvertTo-Json

try {
    $priceResult = Invoke-RestMethod -Uri "$BaseUrl/api/predict/price" -Method POST -ContentType "application/json" -Body $priceBody
    Write-Host "   ✅ Price prediction successful!" -ForegroundColor Green
    Write-Host "   Predicted Price: `$$($priceResult.price)" -ForegroundColor Cyan
    if ($Verbose) {
        Write-Host "   Full Response: $($priceResult | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Price prediction failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: RAM Prediction
Write-Host "3️⃣  Testing RAM Prediction..." -ForegroundColor Yellow
$ramBody = @{
    price = 800
    battery = 5000
    screen = 6.5
    weight = 180
    year = 2024
    company = "Samsung"
    front_camera = 32
    back_camera = 108
    processor = "Snapdragon 8 Gen 2"
    storage = 256
} | ConvertTo-Json

try {
    $ramResult = Invoke-RestMethod -Uri "$BaseUrl/api/predict/ram" -Method POST -ContentType "application/json" -Body $ramBody
    Write-Host "   ✅ RAM prediction successful!" -ForegroundColor Green
    Write-Host "   Predicted RAM: $($ramResult.ram) GB" -ForegroundColor Cyan
    if ($Verbose) {
        Write-Host "   Full Response: $($ramResult | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ RAM prediction failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Battery Prediction
Write-Host "4️⃣  Testing Battery Prediction..." -ForegroundColor Yellow
$batteryBody = @{
    price = 800
    ram = 8
    screen = 6.5
    weight = 180
    year = 2024
    company = "Samsung"
    front_camera = 32
    back_camera = 108
    processor = "Snapdragon 8 Gen 2"
    storage = 256
} | ConvertTo-Json

try {
    $batteryResult = Invoke-RestMethod -Uri "$BaseUrl/api/predict/battery" -Method POST -ContentType "application/json" -Body $batteryBody
    Write-Host "   ✅ Battery prediction successful!" -ForegroundColor Green
    Write-Host "   Predicted Battery: $($batteryResult.battery) mAh" -ForegroundColor Cyan
    if ($Verbose) {
        Write-Host "   Full Response: $($batteryResult | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Battery prediction failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Brand Classification
Write-Host "5️⃣  Testing Brand Classification..." -ForegroundColor Yellow
$brandBody = @{
    price = 800
    ram = 8
    battery = 5000
    screen = 6.5
    weight = 180
    year = 2024
    front_camera = 32
    back_camera = 108
    processor = "Snapdragon 8 Gen 2"
    storage = 256
} | ConvertTo-Json

try {
    $brandResult = Invoke-RestMethod -Uri "$BaseUrl/api/predict/brand" -Method POST -ContentType "application/json" -Body $brandBody
    Write-Host "   ✅ Brand classification successful!" -ForegroundColor Green
    Write-Host "   Predicted Brand: $($brandResult.brand)" -ForegroundColor Cyan
    if ($brandResult.confidence) {
        Write-Host "   Confidence: $([math]::Round($brandResult.confidence * 100, 2))%" -ForegroundColor Gray
    }
    if ($Verbose -and $brandResult.probabilities) {
        Write-Host "   Top Brands:" -ForegroundColor Gray
        $brandResult.probabilities.PSObject.Properties | Sort-Object Value -Descending | Select-Object -First 3 | ForEach-Object {
            Write-Host "      $($_.Name): $([math]::Round($_.Value * 100, 2))%" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ❌ Brand classification failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ API Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Use -Verbose flag for detailed responses" -ForegroundColor Gray
Write-Host "   - API runs on port 8000 by default" -ForegroundColor Gray
Write-Host "   - Start with: npm run dev:all" -ForegroundColor Gray
