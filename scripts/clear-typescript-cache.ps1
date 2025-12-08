# Clear TypeScript Language Server Cache
# This script clears TypeScript-related caches to fix server crashes

Write-Host "🧹 Clearing TypeScript Language Server Cache..." -ForegroundColor Cyan

$cleared = $false

# 1. Clear .vscode/.typescript if it exists
$vscodeTypescript = ".vscode\.typescript"
if (Test-Path $vscodeTypescript) {
    Remove-Item -Recurse -Force $vscodeTypescript
    Write-Host "✅ Deleted .vscode/.typescript folder" -ForegroundColor Green
    $cleared = $true
}

# 2. Clear .nuxt cache (Nuxt TypeScript cache)
$nuxtCache = ".nuxt"
if (Test-Path $nuxtCache) {
    Write-Host "⚠️  Found .nuxt folder. This contains Nuxt's TypeScript cache." -ForegroundColor Yellow
    Write-Host "   Run 'npm run prepare' to regenerate it after clearing." -ForegroundColor Yellow
    $response = Read-Host "   Delete .nuxt folder? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Remove-Item -Recurse -Force $nuxtCache
        Write-Host "✅ Deleted .nuxt folder" -ForegroundColor Green
        $cleared = $true
    }
}

# 3. Clear node_modules/.cache if it exists
$nodeCache = "node_modules\.cache"
if (Test-Path $nodeCache) {
    Remove-Item -Recurse -Force $nodeCache
    Write-Host "✅ Deleted node_modules/.cache folder" -ForegroundColor Green
    $cleared = $true
}

# 4. Information about VS Code workspace storage
Write-Host "`n📋 Additional Cache Locations:" -ForegroundColor Cyan
Write-Host "   VS Code stores TypeScript cache in workspace storage." -ForegroundColor Gray
Write-Host "   Location: %APPDATA%\Code\User\workspaceStorage\" -ForegroundColor Gray
Write-Host "   To clear: Close VS Code, then delete workspace storage folders" -ForegroundColor Gray

if (-not $cleared) {
    Write-Host "`nℹ️  No TypeScript cache folders found in workspace (this is normal)" -ForegroundColor Yellow
    Write-Host "   The TypeScript server cache is managed by VS Code internally." -ForegroundColor Gray
} else {
    Write-Host "`n✅ Cache clearing complete!" -ForegroundColor Green
}

Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Restart VS Code" -ForegroundColor White
Write-Host "   2. Or run: TypeScript: Restart TS Server (Ctrl+Shift+P)" -ForegroundColor White
if ($cleared -and (Test-Path ".nuxt") -eq $false) {
    Write-Host "   3. Run: npm run prepare (to regenerate .nuxt)" -ForegroundColor White
}
