#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start both Python API and Nuxt dev servers for testing
.DESCRIPTION
    Starts the Python API (port 8000) and Nuxt dev server (port 3000) in background jobs
    and waits for both to become healthy before proceeding with tests.
.PARAMETER Timeout
    Maximum time in seconds to wait for servers to become healthy (default: 180)
.PARAMETER WaitForHealthy
    If specified, wait for both servers to become healthy before returning
.EXAMPLE
    .\scripts\start-test-servers.ps1 -WaitForHealthy
    Starts servers and waits for them to be ready
#>
param(
    [int]$Timeout = 180,
    [switch]$WaitForHealthy
)

$ErrorActionPreference = 'Stop'

# Kill any existing servers on ports 8000 and 3000
Write-Host "🧹 Cleaning up existing servers..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 2

# Activate Python virtual environment
$venvPath = Join-Path $PSScriptRoot ".." "venv" "Scripts" "Activate.ps1"
if (Test-Path $venvPath) {
    Write-Host "🐍 Activating Python virtual environment..." -ForegroundColor Cyan
    & $venvPath
} else {
    Write-Warning "Virtual environment not found at: $venvPath"
}

# Start Python API in background
Write-Host "🚀 Starting Python API on port 8000..." -ForegroundColor Green
$pythonJob = Start-Job -Name "PythonAPI" -ScriptBlock {
    param($workDir)
    Set-Location $workDir
    & "venv\Scripts\python.exe" "python_api\api.py"
} -ArgumentList (Get-Location).Path

# Wait a bit for Python API to start binding to port
Start-Sleep -Seconds 5

# Start Nuxt dev server in background
Write-Host "🚀 Starting Nuxt dev server on port 3000..." -ForegroundColor Green
$nuxtJob = Start-Job -Name "NuxtDev" -ScriptBlock {
    param($workDir)
    Set-Location $workDir
    npm run dev
} -ArgumentList (Get-Location).Path

# Reference the job objects so they are not flagged as unused and show their IDs to the user
Write-Host "Background jobs started:" -ForegroundColor Cyan
Write-Host "   - Python API job: Name='$($pythonJob.Name)' Id=$($pythonJob.Id)" -ForegroundColor Cyan
Write-Host "   - Nuxt dev job:   Name='$($nuxtJob.Name)' Id=$($nuxtJob.Id)" -ForegroundColor Cyan

if ($WaitForHealthy) {
    Write-Host "⏳ Waiting for servers to become healthy (timeout: $Timeout seconds)..." -ForegroundColor Yellow

    $startTime = Get-Date
    $pythonHealthy = $false
    $nuxtHealthy = $false

    while (((Get-Date) - $startTime).TotalSeconds -lt $Timeout) {
        # Check Python API
        if (-not $pythonHealthy) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    $pythonHealthy = $true
                    Write-Host "✓ Python API is healthy" -ForegroundColor Green
                }
            } catch {
                # Still waiting...
            }
        }

        # Check Nuxt dev server
        if (-not $nuxtHealthy) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    $nuxtHealthy = $true
                    Write-Host "✓ Nuxt dev server is healthy" -ForegroundColor Green
                }
            } catch {
                # Still waiting...
            }
        }

        if ($pythonHealthy -and $nuxtHealthy) {
            Write-Host "`n✅ Both servers are healthy and ready for testing!" -ForegroundColor Green
            Write-Host "   - Python API: http://localhost:8000" -ForegroundColor Cyan
            Write-Host "   - Nuxt dev:   http://localhost:3000" -ForegroundColor Cyan
            Write-Host "`nRun 'npm run test:manual' to execute tests with these servers" -ForegroundColor Yellow
            return
        }

        Start-Sleep -Seconds 1
    }

    # Timeout reached
    Write-Host "`n⚠️  Timeout reached after $Timeout seconds" -ForegroundColor Red
    if (-not $pythonHealthy) {
        Write-Host "   ✗ Python API not healthy" -ForegroundColor Red
        Write-Host "   Check job output: Receive-Job -Name PythonAPI" -ForegroundColor Yellow
    }
    if (-not $nuxtHealthy) {
        Write-Host "   ✗ Nuxt dev server not healthy" -ForegroundColor Red
        Write-Host "   Check job output: Receive-Job -Name NuxtDev" -ForegroundColor Yellow
    }

    Write-Host "`nTo stop servers: .\scripts\stop-test-servers.ps1" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n✅ Servers started in background" -ForegroundColor Green
    Write-Host "   - Python API job: PythonAPI" -ForegroundColor Cyan
    Write-Host "   - Nuxt dev job:   NuxtDev" -ForegroundColor Cyan
    Write-Host "`nUse -WaitForHealthy to wait for servers to be ready" -ForegroundColor Yellow
    Write-Host "To stop servers: .\scripts\stop-test-servers.ps1" -ForegroundColor Yellow
}
