# Quick Token Setup - Just paste your token
# This script quickly configures your new Personal Access Token

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

Write-Host "=== Quick Token Setup ===" -ForegroundColor Cyan
Write-Host ""

# Validate token format
if (-not $Token.StartsWith("sntrys_") -and -not $Token.StartsWith("sntryu_")) {
    Write-Host "⚠ Warning: Token should start with 'sntrys_' or 'sntryu_'" -ForegroundColor Yellow
}

Write-Host "Configuring token..." -ForegroundColor Yellow

# Update .sentryclirc
try {
    $content = ""
    if (Test-Path .sentryclirc) {
        $content = Get-Content .sentryclirc -Raw
    }

    if ($content -match "\[auth\]") {
        if ($content -match "token=") {
            $content = $content -replace "token=.*", "token=$Token"
        } else {
            $content = $content -replace "\[auth\]", "[auth]`ntoken=$Token"
        }
    } else {
        if ($content -and -not $content.EndsWith("`n")) {
            $content += "`n"
        }
        $content += "[auth]`ntoken=$Token`n"
    }

    Set-Content -Path .sentryclirc -Value $content -NoNewline
    Write-Host "✓ Updated .sentryclirc" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update .sentryclirc: $_" -ForegroundColor Red
    exit 1
}

# Update .env.sentry
try {
    $envContent = ""
    if (Test-Path .env.sentry) {
        $envContent = Get-Content .env.sentry -Raw
    }

    # Update both SENTRY_AUTH_TOKEN and SENTRY_ACCESS_TOKEN
    if ($envContent -match "SENTRY_AUTH_TOKEN=") {
        $envContent = $envContent -replace "SENTRY_AUTH_TOKEN=.*", "SENTRY_AUTH_TOKEN=$Token"
    } else {
        if ($envContent -and -not $envContent.EndsWith("`n")) {
            $envContent += "`n"
        }
        $envContent += "SENTRY_AUTH_TOKEN=$Token`n"
    }

    if ($envContent -match "SENTRY_ACCESS_TOKEN=") {
        $envContent = $envContent -replace "SENTRY_ACCESS_TOKEN=.*", "SENTRY_ACCESS_TOKEN=$Token"
    } else {
        if ($envContent -and -not $envContent.EndsWith("`n")) {
            $envContent += "`n"
        }
        $envContent += "SENTRY_ACCESS_TOKEN=$Token`n"
    }

    Set-Content -Path .env.sentry -Value $envContent -NoNewline
    Write-Host "✓ Updated .env.sentry" -ForegroundColor Green
} catch {
    Write-Host "⚠ Failed to update .env.sentry: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Token configured!" -ForegroundColor Green
Write-Host ""
Write-Host "Testing configuration..." -ForegroundColor Yellow
Write-Host ""

# Test the configuration
node scripts/sentry/test-token-direct.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Configuration verified! You can now use:" -ForegroundColor Green
    Write-Host "   npm run sentry:issues" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "⚠ Configuration updated but test failed" -ForegroundColor Yellow
    Write-Host "   Run: npm run sentry:issues" -ForegroundColor Yellow
    Write-Host "   to test manually" -ForegroundColor Gray
}

Write-Host ""
