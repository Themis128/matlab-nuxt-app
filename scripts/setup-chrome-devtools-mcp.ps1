# PowerShell script to help set up Chrome DevTools MCP Server configuration for Cursor
# This script generates the MCP configuration with optional parameters

param(
    [switch]$Headless,
    [switch]$Isolated,
    [string]$Viewport,
    [string]$Channel = "stable",
    [string]$BrowserUrl,
    [string]$LogFile
)

Write-Host "🌐 Chrome DevTools MCP Server Configuration Generator" -ForegroundColor Cyan
Write-Host ""

# Build args array
$args = @(
    "-y"
    "chrome-devtools-mcp@latest"
)

# Add optional parameters
if ($Headless) {
    $args += "--headless=true"
    Write-Host "✓ Headless mode enabled" -ForegroundColor Green
}

if ($Isolated) {
    $args += "--isolated=true"
    Write-Host "✓ Isolated mode enabled (temporary profile)" -ForegroundColor Green
}

if ($Viewport) {
    $args += "--viewport=$Viewport"
    Write-Host "✓ Viewport set to: $Viewport" -ForegroundColor Green
}

if ($Channel -and $Channel -ne "stable") {
    $args += "--channel=$Channel"
    Write-Host "✓ Chrome channel: $Channel" -ForegroundColor Green
}

if ($BrowserUrl) {
    $args += "--browserUrl=$BrowserUrl"
    Write-Host "✓ Connecting to existing Chrome instance: $BrowserUrl" -ForegroundColor Green
}

if ($LogFile) {
    $args += "--logFile=$LogFile"
    Write-Host "✓ Log file: $LogFile" -ForegroundColor Green
}

# Configuration template
$config = @{
    mcpServers = @{
        "chrome-devtools" = @{
            command = "npx"
            args = $args
        }
    }
}

# Convert to JSON with proper formatting
$jsonConfig = $config | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "📋 Generated Configuration:" -ForegroundColor Green
Write-Host ""
Write-Host $jsonConfig
Write-Host ""

# Save to file
$projectRoot = $PSScriptRoot | Split-Path -Parent
$outputPath = Join-Path $projectRoot ".cursor" "mcp-chrome-devtools-config.json"
$outputDir = Split-Path $outputPath -Parent

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$jsonConfig | Out-File -FilePath $outputPath -Encoding UTF8
Write-Host "✅ Configuration saved to: $outputPath" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open Cursor IDE" -ForegroundColor White
Write-Host "2. Press Ctrl+Shift+P and type 'Preferences: Open User Settings (JSON)'" -ForegroundColor White
Write-Host "3. Copy the configuration above into your Cursor settings" -ForegroundColor White
Write-Host "4. If you have other MCP servers, add 'chrome-devtools' to the existing mcpServers object" -ForegroundColor White
Write-Host "5. Restart Cursor IDE" -ForegroundColor White
Write-Host ""

Write-Host "💡 Usage Examples:" -ForegroundColor Yellow
Write-Host "  Basic: .\scripts\setup-chrome-devtools-mcp.ps1" -ForegroundColor Gray
Write-Host "  Headless: .\scripts\setup-chrome-devtools-mcp.ps1 -Headless" -ForegroundColor Gray
Write-Host "  With viewport: .\scripts\setup-chrome-devtools-mcp.ps1 -Viewport '1920x1080'" -ForegroundColor Gray
Write-Host "  Canary channel: .\scripts\setup-chrome-devtools-mcp.ps1 -Channel canary" -ForegroundColor Gray
Write-Host "  Connect to existing: .\scripts\setup-chrome-devtools-mcp.ps1 -BrowserUrl 'http://127.0.0.1:9222'" -ForegroundColor Gray
Write-Host "  Combined: .\scripts\setup-chrome-devtools-mcp.ps1 -Headless -Isolated -Viewport '1280x720'" -ForegroundColor Gray
