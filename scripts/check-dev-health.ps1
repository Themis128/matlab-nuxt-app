param(
    [int[]]$Ports = @(3000, 8000, 24678),
    [int]$PythonPort = 8000,
    [int]$NuxtPort = 3000
)

$ErrorActionPreference = 'Stop'

function Write-Log($m) { Write-Host "[check-dev-health] $m" }

Write-Log "Checking listening ports: $($Ports -join ', ')"
foreach ($port in $Ports) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if (!$conns) { Write-Log "Port $($port): free"; continue }
        $procIds = $conns | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
        foreach ($pid in $procIds) {
            try {
                $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Log "Port $($port) -> PID $($proc.Id) $($proc.ProcessName) Path: $($proc.Path)"
                } else {
                    Write-Log "Port $($port) -> PID $pid (process gone)";
                }
            } catch {
                Write-Log "Port $($port) -> PID $pid (couldn't inspect process)"
            }
        }
    } catch {
        Write-Log "Error checking port $($port): $($_.Exception.Message)"
    }
}

Write-Log "Checking service endpoints"
try {
    $nuxtCode = (Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$NuxtPort/" -TimeoutSec 3 -ErrorAction Stop).StatusCode
    Write-Log "Nuxt: http://localhost:$NuxtPort/ -> $nuxtCode"
} catch {
    Write-Log "Nuxt: http://localhost:$NuxtPort/ -> Error: $($_.Exception.Message)"
}

try {
    $pyCode = (Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$PythonPort/health" -TimeoutSec 3 -ErrorAction Stop).StatusCode
    Write-Log "Python API: http://localhost:$PythonPort/health -> $pyCode"
} catch {
    Write-Log "Python API: http://localhost:$PythonPort/health -> Error: $($_.Exception.Message)"
}

Write-Log "Checking node and python processes (summary)"
Get-Process -Name node -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path,StartTime | Format-Table -AutoSize
Get-Process -Name python -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path,StartTime | Format-Table -AutoSize

Write-Log "Done"
exit 0
