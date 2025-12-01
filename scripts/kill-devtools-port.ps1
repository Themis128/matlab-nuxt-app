param(
  [int]$Port = 24678,
  [switch]$Verbose
)

function Write-Log($msg) {
  if ($Verbose) { Write-Host "[kill-devtools-port] $msg" }
}

function Get-ListeningProcesses($port) {
  try {
    if ($IsWindows -or $PSVersionTable.PSVersion.Major -lt 6) {
      # Windows PowerShell or Windows with older PS
      if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
        Write-Log 'Using Get-NetTCPConnection (Windows)'
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        return $connections | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
      }
      else {
        Write-Log 'Get-NetTCPConnection not available, using netstat'
        $netstat = netstat -ano | Select-String ":$port\s" | Select-String 'LISTENING'
        $pids = @()
        foreach ($line in $netstat) {
          $parts = $line -split '\s+'
          $processId = $parts[-1]
          if ($processId -match '^\d+$') {
            $pids += [int]$processId
          }
        }
        return $pids | Sort-Object -Unique
      }
    }
    else {
      # Linux/macOS (PowerShell Core)
      Write-Log 'Using ss command (Linux/macOS)'
      $ssOutput = ss -tlnp | Select-String ":$port\s"
      $pids = @()
      foreach ($line in $ssOutput) {
        if ($line -match 'pid=(\d+)') {
          $pids += [int]$matches[1]
        }
      }
      return $pids | Sort-Object -Unique
    }
  }
  catch {
    Write-Log "Failed to get listening processes: $($_.Exception.Message)"
    return @()
  }
}

try {
  Write-Log "Checking listeners on port $Port"
  $processIds = Get-ListeningProcesses $Port

  if ($processIds.Count -eq 0) {
    Write-Log "No listeners found on port $Port."
    exit 0
  }

  foreach ($processId in $processIds) {
    try {
      $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
      if ($proc) {
        Write-Log "Stopping process $($proc.ProcessName) (PID ${processId}) on port ${Port}"
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
      }
      else {
        Write-Log "Process with PID ${processId} not found"
      }
    }
    catch {
      Write-Log "Failed to stop PID ${processId}: $($_.Exception.Message)"
    }
  }

  Start-Sleep -Milliseconds 300
  $remainingPids = Get-ListeningProcesses $Port
  if ($remainingPids.Count -gt 0) {
    Write-Error "Port $Port still in use after attempt."
    exit 1
  }
  else {
    Write-Log "Port $Port freed successfully."
    exit 0
  }
}
catch {
  Write-Error "Error while freeing port ${Port}: $($_.Exception.Message)"
  exit 1
}
