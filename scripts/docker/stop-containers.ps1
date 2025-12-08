# PowerShell script to stop Docker containers
# Usage: .\scripts\docker\stop-containers.ps1

Write-Host "🛑 Stopping Docker containers..." -ForegroundColor Cyan

docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Containers stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to stop containers." -ForegroundColor Red
    exit 1
}
