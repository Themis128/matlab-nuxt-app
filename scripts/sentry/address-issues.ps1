# Comprehensive Sentry Issues Addressing Script
# Uses both Sentry CLI and API to find and address issues

param(
    [switch]$UseAPI = $false,
    [switch]$AutoFix = $false,
    [int]$Limit = 20
)

$ErrorActionPreference = "Continue"

Write-Host "=== Sentry Issues Addressing ===" -ForegroundColor Cyan
Write-Host ""

# Method 1: Use API (more reliable)
if ($UseAPI) {
    Write-Host "📡 Using Sentry API..." -ForegroundColor Yellow
    Write-Host ""

    node scripts/sentry/analyze-issues.js

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Analysis complete!" -ForegroundColor Green
    }
    exit $LASTEXITCODE
}

# Method 2: Use Sentry CLI
Write-Host "🔧 Using Sentry CLI..." -ForegroundColor Yellow
Write-Host ""

# Check authentication
Write-Host "Checking authentication..." -ForegroundColor Gray
try {
    $token = (Get-Content .sentryclirc | Select-String -Pattern "token=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
    $authCheck = npx @sentry/cli login --auth-token $token 2>&1 | Out-String
    if ($authCheck -match "Valid org token") {
        Write-Host "✓ Authentication valid" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Authentication check failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# List unresolved issues
Write-Host "📋 Fetching unresolved issues..." -ForegroundColor Yellow
Write-Host ""

try {
    # Try using the CLI wrapper
    .\scripts\sentry\cli-issues.ps1 -Action list -Status unresolved -Limit $Limit
} catch {
    Write-Host "⚠ CLI method failed, trying API method..." -ForegroundColor Yellow
    Write-Host ""
    node scripts/sentry/analyze-issues.js
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To address specific issues:" -ForegroundColor White
Write-Host "1. Get issue details:" -ForegroundColor Gray
Write-Host "   .\scripts\sentry\cli-issues.ps1 -Action details -IssueId 'PROJECT-123'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "2. Resolve an issue:" -ForegroundColor Gray
Write-Host "   .\scripts\sentry\cli-issues.ps1 -Action resolve -IssueId 'PROJECT-123'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. Use API analysis (more detailed):" -ForegroundColor Gray
Write-Host "   .\scripts\sentry\address-issues.ps1 -UseAPI" -ForegroundColor DarkGray
Write-Host ""
Write-Host "4. View all options:" -ForegroundColor Gray
Write-Host "   .\scripts\sentry\cli-issues.ps1 -Action list" -ForegroundColor DarkGray
Write-Host ""
