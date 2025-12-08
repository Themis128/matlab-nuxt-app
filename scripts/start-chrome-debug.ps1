# PowerShell script to start Chrome with remote debugging enabled for Chrome DevTools MCP
# This allows the MCP server to connect to a running Chrome instance

param(
    [int]$DebugPort = 9222,
    [string]$UserDataDir = "$env:TEMP\chrome-profile-mcp",
    [string]$Url = "http://localhost:3000",
    [switch]$Headless
)

function Write-Log($message) {
    Write-Host "[chrome-debug] $message" -ForegroundColor Cyan
}

# Find Chrome executable
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromeExe = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromeExe = $path
        break
    }
}

if (-not $chromeExe) {
    Write-Log "❌ Chrome not found. Please install Google Chrome." -ForegroundColor Red
    exit 1
}

# Check if Chrome is already running with remote debugging
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$DebugPort/json/version" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Log "✅ Chrome is already running with remote debugging on port $DebugPort"
        Write-Log "   You can connect Chrome DevTools MCP using: --browserUrl=http://127.0.0.1:$DebugPort"
        exit 0
    }
} catch {
    # Chrome not running with remote debugging, continue to start it
}

# Create user data directory if it doesn't exist
if (-not (Test-Path $UserDataDir)) {
    New-Item -ItemType Directory -Path $UserDataDir -Force | Out-Null
    Write-Log "Created user data directory: $UserDataDir"
}

# Build Chrome arguments
$chromeArgs = @(
    "--remote-debugging-port=$DebugPort",
    "--user-data-dir=`"$UserDataDir`"",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-default-apps"
)

if ($Headless) {
    $chromeArgs += "--headless"
    $chromeArgs += "--disable-gpu"
}

# Add URL if provided
if ($Url) {
    $chromeArgs += $Url
}

Write-Log "Starting Chrome with remote debugging on port $DebugPort..."
Write-Log "User data directory: $UserDataDir"
if ($Url) {
    Write-Log "Opening URL: $Url"
}

# Start Chrome
$process = Start-Process -FilePath $chromeExe -ArgumentList $chromeArgs -PassThru -WindowStyle Normal

# Wait a moment for Chrome to start
Start-Sleep -Seconds 2

# Verify Chrome started with remote debugging
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$DebugPort/json/version" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Log "✅ Chrome started successfully with remote debugging"
        Write-Log "   Debug port: $DebugPort"
        Write-Log "   Connect URL: http://127.0.0.1:$DebugPort"
        Write-Log ""
        Write-Log "💡 Update your Cursor MCP config to use:"
        Write-Log "   `"--browserUrl=http://127.0.0.1:$DebugPort`""
        Write-Log ""
        Write-Log "Chrome process ID: $($process.Id)"
        Write-Log "To stop Chrome, close it or run: Stop-Process -Id $($process.Id)"
    }
} catch {
    Write-Log "⚠️ Chrome started but remote debugging may not be ready yet" -ForegroundColor Yellow
    Write-Log "   Wait a few seconds and try again"
}

# Return process ID for potential cleanup
return $process
