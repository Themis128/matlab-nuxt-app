<#
  Stop the detached dev servers and remove the `scripts/dev-pids.json` file.
  Usage: pwsh -NoProfile -File scripts/stop-dev.ps1
#>
param()

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Resolve-Path (Join-Path $here '..')
Push-Location $projectRoot

function Write-Log($m) { Write-Host "[stop-dev] $m" }
$pidFile = Join-Path $projectRoot 'scripts\dev-pids.json'
if (-not (Test-Path $pidFile)) {
    Write-Log "No PID file found at $pidFile"
    Pop-Location
    exit 0
}

$devPids = Get-Content $pidFile | ConvertFrom-Json
if ($devPids.python) {
    try { Stop-Process -Id $devPids.python -Force -ErrorAction SilentlyContinue; Write-Log "Stopped Python PID $($devPids.python)" } catch { }
}
if ($devPids.nuxt) {
    try { Stop-Process -Id $devPids.nuxt -Force -ErrorAction SilentlyContinue; Write-Log "Stopped Nuxt PID $($devPids.nuxt)" } catch { }
}

Remove-Item $pidFile -ErrorAction SilentlyContinue
Pop-Location
exit 0
