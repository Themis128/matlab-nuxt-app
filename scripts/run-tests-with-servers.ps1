<#
.SYNOPSIS
    Runs E2E tests with Python API and Nuxt dev servers running.

.DESCRIPTION
    Starts Python API and Nuxt dev server as background jobs, waits for them to be ready,
    runs Playwright tests, then cleans up the background processes.

.EXAMPLE
    pwsh -NoProfile -File scripts/run-tests-with-servers.ps1
#>

[CmdletBinding()]
param(
    [int]$StartupWaitSeconds = 15,
    [int]$HealthCheckRetries = 10,
    [int]$RetryDelaySeconds = 2
)

$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path -Parent $PSScriptRoot

Write-Host "`n[TEST RUNNER] Starting test environment..." -ForegroundColor Cyan

# Kill any existing processes on ports 8000 and 3000
Write-Host "[TEST RUNNER] Cleaning up existing processes on ports 8000 and 3000..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 2

# Start Python API as background job
Write-Host "[TEST RUNNER] Starting Python API on port 8000..." -ForegroundColor Green
$pythonJob = Start-Job -ScriptBlock {
    Set-Location $using:workspaceRoot
    Set-Location python_api
    & "$using:workspaceRoot\venv\Scripts\python.exe" api.py
}

# Start Nuxt dev server as background job
Write-Host "[TEST RUNNER] Starting Nuxt dev server on port 3000..." -ForegroundColor Green
$nuxtJob = Start-Job -ScriptBlock {
    Set-Location $using:workspaceRoot
    npm run dev
}

# Wait for services to initialize
Write-Host "[TEST RUNNER] Waiting $StartupWaitSeconds seconds for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds $StartupWaitSeconds

# Health check for Python API
Write-Host "[TEST RUNNER] Checking Python API health..." -ForegroundColor Yellow
$pythonReady = $false
for ($i = 1; $i -le $HealthCheckRetries; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "[TEST RUNNER] ✓ Python API is ready" -ForegroundColor Green
            $pythonReady = $true
            break
        }
    }
    catch {
        Write-Host "[TEST RUNNER] Python API not ready yet (attempt $i/$HealthCheckRetries)..." -ForegroundColor DarkYellow
        Start-Sleep -Seconds $RetryDelaySeconds
    }
}

if (-not $pythonReady) {
    Write-Host "[TEST RUNNER] ✗ Python API failed to start" -ForegroundColor Red
    Write-Host "`n[PYTHON JOB OUTPUT]:" -ForegroundColor Yellow
    Receive-Job -Job $pythonJob
    Stop-Job -Job $pythonJob, $nuxtJob
    Remove-Job -Job $pythonJob, $nuxtJob
    exit 1
}

# Health check for Nuxt server
Write-Host "[TEST RUNNER] Checking Nuxt server health..." -ForegroundColor Yellow
$nuxtReady = $false
for ($i = 1; $i -le $HealthCheckRetries; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "[TEST RUNNER] ✓ Nuxt server is ready" -ForegroundColor Green
            $nuxtReady = $true
            break
        }
    }
    catch {
        Write-Host "[TEST RUNNER] Nuxt server not ready yet (attempt $i/$HealthCheckRetries)..." -ForegroundColor DarkYellow
        Start-Sleep -Seconds $RetryDelaySeconds
    }
}

if (-not $nuxtReady) {
    Write-Host "[TEST RUNNER] ✗ Nuxt server failed to start" -ForegroundColor Red
    Write-Host "`n[NUXT JOB OUTPUT]:" -ForegroundColor Yellow
    Receive-Job -Job $nuxtJob
    Stop-Job -Job $pythonJob, $nuxtJob
    Remove-Job -Job $pythonJob, $nuxtJob
    exit 1
}

Write-Host "`n[TEST RUNNER] Both servers are ready! Running tests..." -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor DarkGray

# Run the tests
Set-Location $workspaceRoot
$testExitCode = 0
try {
    npm test
    $testExitCode = $LASTEXITCODE
}
catch {
    Write-Host "[TEST RUNNER] Test execution failed: $_" -ForegroundColor Red
    $testExitCode = 1
}

Write-Host "`n" + "=" * 80 -ForegroundColor DarkGray
Write-Host "[TEST RUNNER] Tests completed with exit code: $testExitCode" -ForegroundColor $(if ($testExitCode -eq 0) { 'Green' } else { 'Red' })

# Cleanup
Write-Host "`n[TEST RUNNER] Cleaning up background jobs..." -ForegroundColor Yellow
Stop-Job -Job $pythonJob, $nuxtJob -ErrorAction SilentlyContinue
Remove-Job -Job $pythonJob, $nuxtJob -ErrorAction SilentlyContinue

Write-Host "[TEST RUNNER] Done!" -ForegroundColor Cyan

exit $testExitCode
