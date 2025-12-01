<#
  Clear conflicting processes bound to ports commonly used during dev.
  - Ports: 3000 (Nuxt), 8000 (Python API), 24678 (Nuxt DevTools websocket)
  This script will inspect each PID owning the port and kill it only if it's a node or python process whose cmdline contains either "nuxt" or "api.py" or the current project's folder path.
  Usage: pwsh -NoProfile -File scripts/clear-ports.ps1 -Force
#>
param(
    [int[]]$Ports = @(3000, 8000, 24678),
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Resolve-Path (Join-Path $here '..')

function Write-Log($msg) { Write-Host "[clear-ports] $msg" }

foreach ($port in $Ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (!$connections) { Write-Log "No listeners on port ${port}."; continue }

    $procIds = $connections | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
    foreach ($procId in $procIds) {
        try {
            $procInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $procId"
            if (-not $procInfo) { Write-Log "No process info for PID ${procId} (port ${port})"; continue }

            $exe = $procInfo.ExecutablePath
            $cmdline = $procInfo.CommandLine
            Write-Log "Found PID ${procId} on port ${port}: exe=${exe} cmdLine=${cmdline}"

            # If the process seems clearly related (nuxt, node, python, api.py or inside project root), stop it
            $isNode = $cmdline -match 'nuxt|node' -or ($exe -match 'node.exe')
            $isPython = $cmdline -match 'api.py' -or ($exe -match 'python.exe' -or $exe -match 'python3')
            $belongsToProject = $cmdline -and $cmdline -match ([regex]::Escape($projectRoot))

            if ($isNode -or $isPython -or $belongsToProject -or $Force) {
                Write-Log "Stopping PID ${procId} (port ${port}). Reason: isNode=${isNode} isPython=${isPython} belongsToProject=${belongsToProject} force=${Force}"
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Start-Sleep -Milliseconds 200
            } else {
                Write-Log "Skipping PID ${procId} on port ${port}: not a node/python process and not in project folder. Use -Force to kill anyway."
            }
        } catch {
            Write-Log "Error checking/stopping PID ${procId}: $($_.Exception.Message)"
        }
    }
}

# Confirm ports are free
foreach ($port in $Ports) {
    $check = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($check) {
        Write-Log "Port ${port} still in use by PID(s): $($check | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique -join ', ')"
    } else {
        Write-Log "Port $port freed"
    }
}

exit 0
