# PowerShell script to start Docker containers
# Usage: .\scripts\docker\start-containers.ps1

Write-Host "🐳 Starting Docker containers..." -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start containers
Write-Host "📦 Building and starting containers..." -ForegroundColor Yellow
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Containers started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "🌐 Services available at:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   API:      http://localhost:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 View logs with: docker-compose logs -f" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to start containers. Check logs above." -ForegroundColor Red
    exit 1
}
