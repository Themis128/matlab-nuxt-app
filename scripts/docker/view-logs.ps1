# PowerShell script to view Docker container logs
# Usage: .\scripts\docker\view-logs.ps1 [service]
#   service: frontend, api, or leave empty for all

param(
    [string]$Service = ""
)

Write-Host "📋 Viewing Docker container logs..." -ForegroundColor Cyan

if ($Service -eq "") {
    Write-Host "📊 All services logs (Ctrl+C to exit):" -ForegroundColor Yellow
    docker-compose logs -f
} else {
    Write-Host "📊 $Service service logs (Ctrl+C to exit):" -ForegroundColor Yellow
    docker-compose logs -f $Service
}
