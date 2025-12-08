#!/usr/bin/env pwsh
# Fix Windows File Watcher Limits
# This script helps resolve EPERM errors by increasing Windows file watcher limits

Write-Host "🔧 Windows File Watcher Configuration Fix" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script requires administrator privileges." -ForegroundColor Yellow
    Write-Host "   Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Or manually run this command:" -ForegroundColor Gray
    Write-Host "   reg add `"HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem`" /v LongPathsEnabled /t REG_DWORD /d 1 /f" -ForegroundColor Gray
    exit 1
}

Write-Host "📝 Checking current file watcher settings..." -ForegroundColor Blue

# Enable long paths (helps with deep directory structures)
try {
    $longPaths = Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -ErrorAction SilentlyContinue
    if ($longPaths.LongPathsEnabled -ne 1) {
        Write-Host "   Enabling long paths support..." -ForegroundColor Yellow
        Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -Type DWord
        Write-Host "   ✓ Long paths enabled (requires restart)" -ForegroundColor Green
    } else {
        Write-Host "   ✓ Long paths already enabled" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Could not modify long paths setting: $_" -ForegroundColor Yellow
}

# Note: Windows doesn't have a direct registry setting for file watcher limits
# The limits are typically handled by:
# 1. Excluding unnecessary directories (done in nuxt.config.ts)
# 2. Using polling mode if needed (can be enabled in nuxt.config.ts)
# 3. Reducing the number of watched files

Write-Host ""
Write-Host "💡 Recommendations:" -ForegroundColor Cyan
Write-Host "   1. Restart your computer after enabling long paths" -ForegroundColor White
Write-Host "   2. Exclude antivirus from scanning the project directory" -ForegroundColor White
Write-Host "   3. If issues persist, enable polling mode in nuxt.config.ts:" -ForegroundColor White
Write-Host "      vite: { server: { watch: { usePolling: true } } }" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Configuration check complete!" -ForegroundColor Green
