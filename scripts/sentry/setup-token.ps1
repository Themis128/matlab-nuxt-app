# Sentry Token Setup Script
# Helps configure a valid Personal Access Token

param(
    [string]$Token = ""
)

Write-Host "=== Sentry Token Setup ===" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "To fix the 404 error, you need a Personal Access Token." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Steps to generate a token:" -ForegroundColor White
    Write-Host "1. Go to: https://sentry.io/settings/account/api/auth-tokens/" -ForegroundColor Gray
    Write-Host "2. Click 'Create New Token'" -ForegroundColor Gray
    Write-Host "3. Select these scopes:" -ForegroundColor Gray
    Write-Host "   - org:read" -ForegroundColor DarkGray
    Write-Host "   - project:read" -ForegroundColor DarkGray
    Write-Host "   - event:read" -ForegroundColor DarkGray
    Write-Host "4. Copy the token (starts with 'sntrys_')" -ForegroundColor Gray
    Write-Host ""
    $Token = Read-Host "Paste your Personal Access Token here"
}

if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "❌ Token is required" -ForegroundColor Red
    exit 1
}

# Validate token format
if (-not $Token.StartsWith("sntrys_")) {
    Write-Host "⚠ Warning: Token should start with 'sntrys_'" -ForegroundColor Yellow
}

# Update .sentryclirc
Write-Host ""
Write-Host "Updating .sentryclirc..." -ForegroundColor Yellow

try {
    $content = ""
    if (Test-Path .sentryclirc) {
        $content = Get-Content .sentryclirc -Raw
    }

    # Update or add token
    if ($content -match "\[auth\]") {
        if ($content -match "token=") {
            $content = $content -replace "token=.*", "token=$Token"
        } else {
            $content = $content -replace "\[auth\]", "[auth]`ntoken=$Token"
        }
    } else {
        if ($content) {
            $content += "`n"
        }
        $content += "[auth]`ntoken=$Token`n"
    }

    Set-Content -Path .sentryclirc -Value $content
    Write-Host "✓ Updated .sentryclirc" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update .sentryclirc: $_" -ForegroundColor Red
    exit 1
}

# Update .env.sentry
Write-Host "Updating .env.sentry..." -ForegroundColor Yellow

try {
    $envContent = ""
    if (Test-Path .env.sentry) {
        $envContent = Get-Content .env.sentry -Raw
    }

    # Update or add SENTRY_AUTH_TOKEN
    if ($envContent -match "SENTRY_AUTH_TOKEN=") {
        $envContent = $envContent -replace "SENTRY_AUTH_TOKEN=.*", "SENTRY_AUTH_TOKEN=$Token"
    } else {
        if ($envContent -and -not $envContent.EndsWith("`n")) {
            $envContent += "`n"
        }
        $envContent += "SENTRY_AUTH_TOKEN=$Token`n"
    }

    Set-Content -Path .env.sentry -Value $envContent
    Write-Host "✓ Updated .env.sentry" -ForegroundColor Green
} catch {
    Write-Host "⚠ Failed to update .env.sentry: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Token configured successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run sentry:fix-config" -ForegroundColor White
Write-Host "   This will discover your org/project and update configuration" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Then run: npm run sentry:issues" -ForegroundColor White
Write-Host "   This will analyze your Sentry issues" -ForegroundColor Gray
Write-Host ""
