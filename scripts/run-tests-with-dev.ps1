<#
  Start dev servers detached, wait for health, run tests, and cleanup.
  Usage: pwsh -NoProfile -File scripts/run-tests-with-dev.ps1 -- [optional playwright args or tests]
#>
param(
    [string[]]$TestArgs = @()
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Resolve-Path (Join-Path $here '..')
Push-Location $projectRoot

function Write-Log($m) { Write-Host "[run-tests-with-dev] $m" }

# Kill any potential DevTools port conflicts first
pwsh -NoProfile -File "$projectRoot\scripts\kill-devtools-port.ps1" -Verbose

Write-Log "Starting detached dev servers"
pwsh -NoProfile -File "$projectRoot\scripts\start-dev-detached.ps1"

# Wait for health before running tests
Write-Log "Polling health endpoints for readiness (30s)"
$end = (Get-Date).AddSeconds(30)
$pythonUp = $false
$nuxtUp = $false
while ((Get-Date) -lt $end -and (-not ($pythonUp -and $nuxtUp))) {
    try { Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; $pythonUp = $true } catch { }
    try { Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; $nuxtUp = $true } catch { }
    Start-Sleep -Milliseconds 500
}

Write-Log "Health: Python($pythonUp), Nuxt($nuxtUp)"

if (-not ($pythonUp -and $nuxtUp)) {
    Write-Log "Warning: Not all services started in time (continuing anyway)"
}

# Run Playwright tests; set env vars and use npx to call the local CLI and pass all arguments after --
$env:PLAYWRIGHT_TEST = '1'
$env:NUXT_TEST = '1'
if ($TestArgs.Length -gt 0) { $argsList = @('playwright', 'test') + $TestArgs } else { $argsList = @('playwright', 'test') }
Write-Log "Running Playwright via npx: $($argsList -join ' ')"
$process = Start-Process -FilePath 'npx' -ArgumentList $argsList -NoNewWindow -Wait -PassThru
$rc = $process.ExitCode
$rc = $LASTEXITCODE

# Cleanup
Write-Log "Stopping dev servers"
pwsh -NoProfile -File "$projectRoot\scripts\stop-dev.ps1"

Pop-Location
exit $rc
