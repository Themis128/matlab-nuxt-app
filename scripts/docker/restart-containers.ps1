# PowerShell script to restart Docker containers
# Usage: .\scripts\docker\restart-containers.ps1

Write-Host "🔄 Restarting Docker containers..." -ForegroundColor Cyan

# Stop containers
Write-Host "⏹️  Stopping containers..." -ForegroundColor Yellow
docker-compose down

# Start containers
Write-Host "▶️  Starting containers..." -ForegroundColor Yellow
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Containers restarted successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker-compose ps
} else {
    Write-Host "❌ Failed to restart containers." -ForegroundColor Red
    exit 1
}
