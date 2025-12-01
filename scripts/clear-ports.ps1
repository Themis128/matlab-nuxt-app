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
            $isNode = $cmdline -match 'nuxt|nuxi|node|index.mjs|@nuxt' -or ($exe -match 'node.exe')
            $isVite = $cmdline -match 'vite|@vite' -or ($exe -match 'vite.exe')
            $isPython = $cmdline -match 'api.py' -or ($exe -match 'python.exe' -or $exe -match 'python3')
            $isPwsh = $exe -match 'pwsh.exe' -or $exe -match 'powershell.exe' -or $cmdline -match 'npm run dev|NUXT_DEVTOOLS_PORT'
            $belongsToProject = $cmdline -and $cmdline -match ([regex]::Escape($projectRoot))

            if ($isNode -or $isVite -or $isPython -or $isPwsh -or $belongsToProject -or $Force) {
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

function Get-PidsFromNetstat($port) {
    $pids = @()
    try {
        $netstat = (netstat -aon 2>$null | Select-String -Pattern ":$port\s" -SimpleMatch) -or @()
        foreach ($line in $netstat) {
            $parts = ($line -replace '\s+', ' ').Trim() -split ' '
            if ($parts.Length -ge 5) {
                $pid = $parts[-1]
                if ($pid -match '^[0-9]+$') { $pids += [int]$pid }
            }
        }
    } catch {
        # netstat fallback failed, ignore
    }
    return ($pids | Sort-Object -Unique)
}

# Fallback: check for dev-like processes even if no listener found (helps with windows container/IPv6 differences)
foreach ($port in $Ports) {
    $existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($existing) { continue }

    $pids = Get-PidsFromNetstat -port $port
    foreach ($procId in $pids) {
        try {
            $procInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $procId"
            if (-not $procInfo) { continue }

            $exe = $procInfo.ExecutablePath
            $cmdline = $procInfo.CommandLine
            $isNode = $cmdline -match 'nuxt|nuxi|node|vite|@nuxt|index.mjs' -or ($exe -match 'node.exe')
            $isPython = $cmdline -match 'api.py' -or ($exe -match 'python.exe' -or $exe -match 'python3')
            $isPwsh = $exe -match 'pwsh.exe' -or $exe -match 'powershell.exe'
            $belongsToProject = $cmdline -and $cmdline -match ([regex]::Escape($projectRoot))
            if ($isNode -or $isPython -or $isPwsh -or $belongsToProject -or $Force) {
                Write-Log "Stopping PID ${procId} (port ${port}) from netstat fallback. Reason: isNode=${isNode} isPython=${isPython} isPwsh=${isPwsh} belongsToProject=${belongsToProject} force=${Force}"
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        } catch {
            Write-Log "Error checking/stopping PID ${procId} from netstat fallback: $($_.Exception.Message)"
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
