# Test script to verify Pinia stores and localStorage persistence
# Run with: pwsh -NoProfile -File scripts/test-stores.ps1

Write-Host "🧪 Testing Pinia Stores and Persistence" -ForegroundColor Cyan
Write-Host ""

# Check if localStorage keys exist
$storeKeys = @(
    "performance-store",
    "analytics-store",
    "sentry-store",
    "chrome-devtools-store",
    "mobile-prediction-history",
    "mobile-finder-preferences"
)

Write-Host "📦 Checking localStorage keys..." -ForegroundColor Yellow
foreach ($key in $storeKeys) {
    Write-Host "  - $key" -NoNewline
    # Note: We can't directly check localStorage from PowerShell
    # This is a placeholder for manual verification
    Write-Host " (check in browser DevTools)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Store Test Checklist:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Open browser DevTools (F12)" -ForegroundColor White
Write-Host "2. Go to Application > Local Storage > http://localhost:3000" -ForegroundColor White
Write-Host "3. Verify these keys exist:" -ForegroundColor White
foreach ($key in $storeKeys) {
    Write-Host "   ✓ $key" -ForegroundColor Gray
}
Write-Host ""
Write-Host "4. Navigate to /integration-status page" -ForegroundColor White
Write-Host "5. Check that all stores display data" -ForegroundColor White
Write-Host "6. Refresh the page - data should persist" -ForegroundColor White
Write-Host "7. Close and reopen browser - data should still persist" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Manual Testing Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Performance Store:" -ForegroundColor Yellow
Write-Host "  - Navigate between pages" -ForegroundColor Gray
Write-Host "  - Check /integration-status for Web Vitals" -ForegroundColor Gray
Write-Host "  - Verify performance score and grade appear" -ForegroundColor Gray
Write-Host ""
Write-Host "Analytics Store:" -ForegroundColor Yellow
Write-Host "  - Navigate to different pages" -ForegroundColor Gray
Write-Host "  - Check session ID persists" -ForegroundColor Gray
Write-Host "  - Verify event count increases" -ForegroundColor Gray
Write-Host ""
Write-Host "Sentry Store:" -ForegroundColor Yellow
Write-Host "  - Trigger an error (if possible)" -ForegroundColor Gray
Write-Host "  - Check error count on /integration-status" -ForegroundColor Gray
Write-Host "  - Verify errors persist after refresh" -ForegroundColor Gray
Write-Host ""
Write-Host "Chrome DevTools Store:" -ForegroundColor Yellow
Write-Host "  - Start dev server with Chrome debugging" -ForegroundColor Gray
Write-Host "  - Check connection status on /integration-status" -ForegroundColor Gray
Write-Host "  - Verify connection settings persist" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ All done! Check the browser console for any errors." -ForegroundColor Green
