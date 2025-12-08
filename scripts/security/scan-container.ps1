# Container Security Scanning Script (PowerShell)
# Builds Docker image and scans it with Snyk

param(
    [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"

$ImageName = "matlab-app"
$FullImageName = "${ImageName}:${ImageTag}"

Write-Host "[SECURITY] Starting Container Security Scan" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Snyk is installed
try {
    $null = Get-Command snyk -ErrorAction Stop
} catch {
    Write-Host "[ERROR] Snyk CLI is not installed" -ForegroundColor Red
    Write-Host "Install it with: npm install -g snyk" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "[ERROR] Docker is not running" -ForegroundColor Red
    exit 1
}

# Build Docker image
Write-Host "[BUILD] Building Docker image: ${FullImageName}" -ForegroundColor Cyan
docker build -t $FullImageName .

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] Docker image built successfully" -ForegroundColor Green
Write-Host ""

# Scan with Snyk
Write-Host "[SCAN] Scanning container with Snyk..." -ForegroundColor Cyan
Write-Host ""

try {
    snyk container test $FullImageName `
        --severity-threshold=high `
        --fail-on=upgradable `
        --json | Out-File -FilePath "snyk-container-results.json" -Encoding utf8
} catch {
    Write-Host "[WARNING] Snyk scan completed with warnings" -ForegroundColor Yellow
}

# Display results
if (Test-Path "snyk-container-results.json") {
    Write-Host ""
    Write-Host "[RESULTS] Scan Results:" -ForegroundColor Cyan
    Write-Host "=======================" -ForegroundColor Cyan
    try {
        snyk container test $FullImageName --severity-threshold=high
    } catch {
        Write-Host "[WARNING] Some issues found - check snyk-container-results.json for details" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[SUCCESS] Container scan completed" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Full results saved to: snyk-container-results.json" -ForegroundColor Cyan
