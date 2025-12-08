# PowerShell script to clean Docker containers, images, and volumes
# Usage: .\scripts\docker\clean-containers.ps1 [-Force]

param(
    [switch]$Force
)

Write-Host "🧹 Cleaning Docker resources..." -ForegroundColor Cyan

if ($Force) {
    Write-Host "⚠️  Force mode: Removing volumes and images" -ForegroundColor Yellow

    # Stop and remove containers with volumes
    docker-compose down -v

    # Remove images
    Write-Host "🗑️  Removing images..." -ForegroundColor Yellow
    docker-compose down --rmi all

    Write-Host "✅ Cleanup complete (volumes and images removed)" -ForegroundColor Green
} else {
    # Just stop and remove containers (keep volumes)
    docker-compose down

    Write-Host "✅ Containers stopped and removed (volumes preserved)" -ForegroundColor Green
    Write-Host "💡 Use -Force to also remove volumes and images" -ForegroundColor Yellow
}
