param(
  [int]$Port = 3000,
  [string]$HostName = "localhost",
  [int]$StartPort = 24678,
  [int]$MaxPort = 24750,
  [int]$PortIncrement = 1
)

function Write-Log($m) { Write-Host "[start-nuxt-dev] $m" }

function Test-PortFree($port) {
  try {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) { return $false }
  }
  catch {
    # Fallback to netstat parsing
    try {
      $out = netstat -aon 2>$null | Select-String -Pattern ":$port\s" -SimpleMatch
      if ($out) { return $false }
    }
    catch { }
  }
  return $true
}

function Find-FreePort($start, $max, $increment) {
  for ($p = $start; $p -le $max; $p += $increment) {
    if (Test-PortFree -port $p) { return $p }
  }
  return $null
}

$free = Find-FreePort -start $StartPort -max $MaxPort -increment $PortIncrement
if (-not $free) {
  Write-Log "⚠️  No free NUXT devtools port found between $StartPort and $MaxPort"
  Write-Log "⚠️  Attempting to use port $StartPort anyway (may cause conflict)"
  $free = $StartPort
}

Write-Log "✅ Selected NUXT devtools port: $free"

# Ensure env var is set for child process
$env:NUXT_DEVTOOLS_PORT = $free

# Print child config for debugging
Write-Log "NUXT_DEVTOOLS_PORT set to $env:NUXT_DEVTOOLS_PORT"

Write-Log "Starting Nuxt dev with NUXT_DEVTOOLS_PORT=$free on port $Port, hostname $HostName"

# Start Chrome with remote debugging for Chrome DevTools MCP (optional)
$chromeScript = Join-Path $PSScriptRoot "start-chrome-debug.ps1"
if (Test-Path $chromeScript) {
    $devUrl = "http://${HostName}:${Port}"
    Write-Log "Starting Chrome with remote debugging for MCP connection..."
    Start-Process powershell -ArgumentList "-NoProfile", "-File", "`"$chromeScript`"", "-Url", $devUrl -WindowStyle Minimized
    Start-Sleep -Seconds 1
}

npm run dev -- --port $Port --hostname $HostName

exit $LASTEXITCODE
