# Verify Security Fixes (PowerShell)
# This script helps verify that security vulnerabilities have been fixed

$ErrorActionPreference = "Stop"

Write-Host "Security Fixes Verification" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if files exist
Write-Host "Checking fixed files..." -ForegroundColor Cyan
Write-Host ""

$fixedFiles = @(
  "tools/run-eslint-mcp-fallback.js",
  "mcp-servers/todo-mcp-server/todo_mcp.py",
  "scripts/sentry/discover-and-fix.js",
  "scripts/sentry/fix-api-config.js",
  "scripts/sentry/analyze-issues.js",
  "server/api/user/settings.put.ts",
  "server/api/user/profile.get.ts",
  "server/api/notifications/mark-all-read.put.ts",
  "scripts/python/view_mat_file.py",
  "scripts/algolia/sync-phones-with-images.js",
  "python_api/enhanced_data_pipeline.py",
  "python_api/pickle_security.py",
  "server/utils/cors.ts"
)

$missingFiles = 0
foreach ($file in $fixedFiles) {
  if (Test-Path $file) {
    Write-Host "OK: $file" -ForegroundColor Green
  } else {
    Write-Host "MISSING: $file" -ForegroundColor Red
    $missingFiles++
  }
}

Write-Host ""
if ($missingFiles -gt 0) {
  Write-Host "ERROR: $missingFiles file(s) missing" -ForegroundColor Red
  exit 1
} else {
  Write-Host "SUCCESS: All fixed files present" -ForegroundColor Green
}

Write-Host ""
Write-Host "Checking for security patterns..." -ForegroundColor Cyan
Write-Host ""

# Check for insecure CORS patterns
Write-Host "Checking for insecure CORS patterns..." -ForegroundColor Yellow
$corsIssues = Select-String -Path "server/api/*.ts" -Pattern "Access-Control-Allow-Origin.*'\*'" -ErrorAction SilentlyContinue
if ($corsIssues) {
  Write-Host "WARNING: Found potential CORS issues:" -ForegroundColor Yellow
  $corsIssues | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
} else {
  Write-Host "OK: No insecure CORS patterns found" -ForegroundColor Green
}

# Check for command injection patterns
Write-Host ""
Write-Host "Checking for command injection patterns..." -ForegroundColor Yellow
$injectionIssues = Select-String -Path "scripts/*.js", "tools/*.js" -Pattern "execSync.*`" -ErrorAction SilentlyContinue
if ($injectionIssues) {
  Write-Host "WARNING: Found potential command injection patterns:" -ForegroundColor Yellow
  $injectionIssues | Select-Object -First 5 | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
} else {
  Write-Host "OK: No obvious command injection patterns found" -ForegroundColor Green
}

# Check for hardcoded secrets
Write-Host ""
Write-Host "Checking for hardcoded secrets..." -ForegroundColor Yellow
$secretPatterns = @("password.*=", "api.*key.*=", "token.*=", "secret.*=")
$foundSecrets = $false
foreach ($pattern in $secretPatterns) {
  $matches = Select-String -Path "scripts/*.js", "scripts/*.ts" -Pattern $pattern -ErrorAction SilentlyContinue |
    Where-Object { $_.Line -notmatch "process.env" }
  if ($matches) {
    Write-Host "WARNING: Potential hardcoded secrets found:" -ForegroundColor Yellow
    $matches | Select-Object -First 5 | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
    $foundSecrets = $true
  }
}
if (-not $foundSecrets) {
  Write-Host "OK: No obvious hardcoded secrets found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run your security scanning tool to verify fixes"
Write-Host "2. Test API endpoints with CORS validation"
Write-Host "3. Review the security fixes summary: docs/SECURITY_FIXES_SUMMARY.md"
Write-Host "4. Run integration tests to ensure functionality still works"
Write-Host ""
Write-Host "SUCCESS: Verification complete" -ForegroundColor Green
