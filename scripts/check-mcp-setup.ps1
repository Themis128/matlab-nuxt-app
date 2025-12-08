# Script to check Chrome DevTools MCP setup status

Write-Host "🔍 Chrome DevTools MCP Setup Check" -ForegroundColor Cyan
Write-Host ""

# Check 1: Dev Server
Write-Host "1. Dev Server (port 3000):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Server is running - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Server not accessible" -ForegroundColor Red
    Write-Host "      Run: npm run dev:all" -ForegroundColor Gray
}

Write-Host ""

# Check 2: Chrome Remote Debugging
Write-Host "2. Chrome Remote Debugging (port 9222):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:9222/json/version" -TimeoutSec 2 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ Chrome is running with remote debugging" -ForegroundColor Green
    Write-Host "      Version: $($data.Browser)" -ForegroundColor Gray
    Write-Host "      WebSocket: $($data.webSocketDebuggerUrl)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Chrome remote debugging not available" -ForegroundColor Red
    Write-Host "      Run: .\scripts\start-chrome-debug.ps1" -ForegroundColor Gray
    Write-Host "      Or start dev server: npm run dev:all (auto-starts Chrome)" -ForegroundColor Gray
}

Write-Host ""

# Check 3: Cursor MCP Configuration
Write-Host "3. Cursor MCP Configuration:" -ForegroundColor Yellow
$settingsPath = "$env:APPDATA\Cursor\User\settings.json"
if (Test-Path $settingsPath) {
    $content = Get-Content $settingsPath -Raw
    if ($content -match '"chrome-devtools"') {
        if ($content -match '--browserUrl=http://127.0.0.1:9222') {
            Write-Host "   ✅ Configuration found with browserUrl" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Configuration found but missing browserUrl" -ForegroundColor Yellow
            Write-Host "      Update to use: --browserUrl=http://127.0.0.1:9222" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ Chrome DevTools MCP not configured" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Cursor settings file not found" -ForegroundColor Red
}

Write-Host ""

# Check 4: Chrome Executable
Write-Host "4. Chrome Installation:" -ForegroundColor Yellow
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromeFound = $false
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        Write-Host "   ✅ Chrome found: $path" -ForegroundColor Green
        $chromeFound = $true
        break
    }
}

if (-not $chromeFound) {
    Write-Host "   ❌ Chrome not found" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   To use Chrome DevTools MCP:" -ForegroundColor White
Write-Host "   1. Start dev server: npm run dev:all" -ForegroundColor Gray
Write-Host "   2. Restart Cursor IDE" -ForegroundColor Gray
Write-Host "   3. Ask AI to check performance" -ForegroundColor Gray

