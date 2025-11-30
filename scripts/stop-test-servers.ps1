#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop test servers started by start-test-servers.ps1
.DESCRIPTION
    Stops background jobs for Python API and Nuxt dev server,
    and kills processes on ports 8000 and 3000.
.EXAMPLE
    .\scripts\stop-test-servers.ps1
    Stops all test servers
#>

$ErrorActionPreference = 'Continue'

Write-Host "🛑 Stopping test servers..." -ForegroundColor Yellow

# Stop background jobs
$pythonJob = Get-Job -Name "PythonAPI" -ErrorAction SilentlyContinue
if ($pythonJob) {
    Write-Host "   Stopping Python API job..." -ForegroundColor Cyan
    Stop-Job -Name "PythonAPI" -ErrorAction SilentlyContinue
    Remove-Job -Name "PythonAPI" -Force -ErrorAction SilentlyContinue
}

$nuxtJob = Get-Job -Name "NuxtDev" -ErrorAction SilentlyContinue
if ($nuxtJob) {
    Write-Host "   Stopping Nuxt dev job..." -ForegroundColor Cyan
    Stop-Job -Name "NuxtDev" -ErrorAction SilentlyContinue
    Remove-Job -Name "NuxtDev" -Force -ErrorAction SilentlyContinue
}

# Kill processes on ports
Write-Host "   Killing processes on port 8000..." -ForegroundColor Cyan
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Write-Host "   Killing processes on port 3000..." -ForegroundColor Cyan
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

# Also kill any devtools processes
& (Join-Path $PSScriptRoot "kill-devtools-port.ps1") -ErrorAction SilentlyContinue

Write-Host "`n✅ All test servers stopped" -ForegroundColor Green
