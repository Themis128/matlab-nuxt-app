<#
  Start both Python API and Nuxt dev servers in the background and write PIDs to scripts/dev-pids.json.
  Usage: pwsh -NoProfile -File scripts/start-dev-detached.ps1
#>
param(
    [int]$PythonPort = 8000,
    [int]$NuxtPort = 3000
)

$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Resolve-Path (Join-Path $here '..')
Push-Location $projectRoot

function Write-Log($m) { Write-Host "[start-dev-detached] $m" }

Write-Log "Clearing dev-related ports (3000, 8000, 24678)"
pwsh -NoProfile -File "$projectRoot\scripts\clear-ports.ps1" -Force -Verbose

Write-Log "Starting Python API detached (port $PythonPort)"
$pythonExe = Join-Path $projectRoot "venv\Scripts\python.exe"
$pythonPath = Join-Path $projectRoot "python_api"
if (-not (Test-Path $pythonExe)) { Write-Log "Python venv python not found: $pythonExe" }
$pythonProc = Start-Process -FilePath $pythonExe -ArgumentList 'api.py' -WorkingDirectory $pythonPath -PassThru -WindowStyle Hidden

Start-Sleep -Milliseconds 300
Write-Log "Starting Nuxt dev detached (port $NuxtPort)"
# Use `npx` or the installed globally npm config. We'll try using `npm run dev` in the repo root via pwsh.
  # Start Nuxt dev explicitly on port 3000 and host localhost
  $nuxtProc = Start-Process -FilePath "pwsh" -ArgumentList "-NoProfile -NoLogo -Command cd '$projectRoot' ; npm run dev -- --port 3000 --hostname localhost" -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 1
$devPids = @{ python = $pythonProc.Id; nuxt = $nuxtProc.Id }
$pidFile = Join-Path $projectRoot 'scripts\dev-pids.json'
$devPids | ConvertTo-Json | Set-Content $pidFile -Force
Write-Log "Wrote dev PIDs to ${pidFile}: $($devPids | ConvertTo-Json)"

# Wait briefly for health endpoints to be up (we'll not block too long here)
Write-Log "Waiting for services to start (up to 30s)"
$end = (Get-Date).AddSeconds(30)
$pythonUp = $false
$nuxtUp = $false
while ((Get-Date) -lt $end -and (-not ($pythonUp -and $nuxtUp))) {
    try { Invoke-WebRequest -Uri "http://localhost:$PythonPort/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; $pythonUp = $true } catch { }
    try { Invoke-WebRequest -Uri "http://localhost:$NuxtPort/" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; $nuxtUp = $true } catch { }
    Start-Sleep -Milliseconds 500
}
Write-Log "Python API up: $pythonUp, Nuxt up: $nuxtUp"

Pop-Location
exit 0
