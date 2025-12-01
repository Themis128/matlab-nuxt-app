param(
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
  Write-Log "No free NUXT devtools port found between $StartPort and $MaxPort"
  exit 1
}

Write-Log "Selected free NUXT devtools port: $free"

# Ensure env var is set for child process
$env:NUXT_DEVTOOLS_PORT = $free

# Print child config for debugging
Write-Log "NUXT_DEVTOOLS_PORT set to $env:NUXT_DEVTOOLS_PORT"

Write-Log "Starting Nuxt dev with NUXT_DEVTOOLS_PORT=$free"
npm run dev -- --port 3000 --hostname localhost

exit $LASTEXITCODE
