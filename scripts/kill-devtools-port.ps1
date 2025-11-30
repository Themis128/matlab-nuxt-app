param(
    [int]$Port = 24678,
    [switch]$Verbose
)

function Write-Log($msg) {
    if ($Verbose) { Write-Host "[kill-devtools-port] $msg" }
}

try {
    Write-Log "Checking listeners on port $Port"
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (!$connections) {
        Write-Log "No listeners found on port $Port."
        exit 0
    }

    $processIds = $connections | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
    foreach ($processId in $processIds) {
        try {
            $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Log "Stopping process $($proc.ProcessName) (PID ${processId}) on port ${Port}"
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        } catch {
            Write-Log "Failed to stop PID ${processId}: $($_.Exception.Message)"
        }
    }

    Start-Sleep -Milliseconds 300
    $remaining = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($remaining) {
        Write-Error "Port $Port still in use after attempt."
        exit 1
    } else {
        Write-Log "Port $Port freed successfully."
        exit 0
    }
} catch {
    Write-Error "Error while freeing port ${Port}: $($_.Exception.Message)"
    exit 1
}
