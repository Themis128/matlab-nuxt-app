# Manual Fix for Sentry Configuration
# Fixes the org typo and updates project name

Write-Host "=== Fixing Sentry Configuration ===" -ForegroundColor Cyan
Write-Host ""

# Fix .sentryclirc
Write-Host "Updating .sentryclirc..." -ForegroundColor Yellow
$sentryclirc = Get-Content .sentryclirc -Raw
$sentryclirc = $sentryclirc -replace "project=--org", "project=matlab-app"
Set-Content .sentryclirc -Value $sentryclirc
Write-Host "Fixed .sentryclirc" -ForegroundColor Green

# Instructions for .env.sentry
Write-Host ""
Write-Host ".env.sentry needs manual update (file is protected)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please update .env.sentry with these corrections:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Fix the org typo:" -ForegroundColor White
Write-Host "   Change: SENTRY_ORG_SLUG=baltzisthemiscom" -ForegroundColor Gray
Write-Host "   To:     SENTRY_ORG_SLUG=baltzakisthemiscom" -ForegroundColor Green
Write-Host ""
Write-Host "2. Add these lines if missing:" -ForegroundColor White
Write-Host "   SENTRY_ORG=baltzakisthemiscom" -ForegroundColor Green
Write-Host "   SENTRY_PROJECT=matlab-app" -ForegroundColor Green
Write-Host ""
Write-Host "3. The token might be expired. If API still fails:" -ForegroundColor White
Write-Host "   - Generate new token: https://sentry.io/settings/account/api/auth-tokens/" -ForegroundColor Gray
Write-Host "   - Update SENTRY_ACCESS_TOKEN in .env.sentry" -ForegroundColor Gray
Write-Host ""
Write-Host "After updating .env.sentry, run: npm run sentry:fix-config" -ForegroundColor Cyan
Write-Host ""
