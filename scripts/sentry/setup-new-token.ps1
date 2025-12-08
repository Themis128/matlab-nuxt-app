# Setup New Sentry Auth Token
# Guides user through creating and configuring a new Personal Access Token

param(
    [string]$Token = ""
)

Write-Host "=== Sentry Auth Token Setup ===" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "To fix the authentication error, you need a Personal Access Token." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Step 1: Generate a new token" -ForegroundColor White
    Write-Host "1. Open your browser and go to:" -ForegroundColor Gray
    Write-Host "   https://sentry.io/settings/account/api/auth-tokens/" -ForegroundColor Green
    Write-Host ""
    Write-Host "2. Click 'Create New Token' button" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Configure the token:" -ForegroundColor Gray
    Write-Host "   - Name: 'MatLab Project API Token' (or any name)" -ForegroundColor DarkGray
    Write-Host "   - Scopes: Select these REQUIRED scopes:" -ForegroundColor DarkGray
    Write-Host "     ✓ org:read - Read organization information" -ForegroundColor DarkGray
    Write-Host "     ✓ project:read - Read project information" -ForegroundColor DarkGray
    Write-Host "     ✓ event:read - Read events and issues" -ForegroundColor DarkGray
    Write-Host "     ✓ event:write - Write events (optional but recommended)" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "4. Click 'Create Token'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. COPY THE TOKEN IMMEDIATELY (you won't see it again!)" -ForegroundColor Red
    Write-Host "   The token starts with 'sntrys_'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Step 2: Paste the token below" -ForegroundColor White
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
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host ""
Write-Host "Updating configuration files..." -ForegroundColor Yellow

# Update .sentryclirc
try {
    $content = ""
    if (Test-Path .sentryclirc) {
        $content = Get-Content .sentryclirc -Raw
    }

    # Update or add token in [auth] section
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

    # Update or add SENTRY_AUTH_TOKEN
    if ($envContent -match "SENTRY_AUTH_TOKEN=") {
        $envContent = $envContent -replace "SENTRY_AUTH_TOKEN=.*", "SENTRY_AUTH_TOKEN=$Token"
    } else {
        if ($envContent -and -not $envContent.EndsWith("`n")) {
            $envContent += "`n"
        }
        $envContent += "SENTRY_AUTH_TOKEN=$Token`n"
    }

    # Also update SENTRY_ACCESS_TOKEN if it exists
    if ($envContent -match "SENTRY_ACCESS_TOKEN=") {
        $envContent = $envContent -replace "SENTRY_ACCESS_TOKEN=.*", "SENTRY_ACCESS_TOKEN=$Token"
    } else {
        if ($envContent -and -not $envContent.EndsWith("`n")) {
            $envContent += "`n"
        }
        $envContent += "SENTRY_ACCESS_TOKEN=$Token`n"
    }

    # Fix org typo if present
    $envContent = $envContent -replace "SENTRY_ORG_SLUG=baltzisthemiscom", "SENTRY_ORG_SLUG=baltzakisthemiscom"
    $envContent = $envContent -replace "SENTRY_ORG=baltzisthemiscom", "SENTRY_ORG=baltzakisthemiscom"

    # Ensure SENTRY_ORG and SENTRY_PROJECT are set
    if (-not ($envContent -match "SENTRY_ORG=")) {
        $envContent += "SENTRY_ORG=baltzakisthemiscom`n"
    }
    if (-not ($envContent -match "SENTRY_PROJECT=")) {
        $envContent += "SENTRY_PROJECT=matlab-app`n"
    }

    Set-Content -Path .env.sentry -Value $envContent -NoNewline
    Write-Host "✓ Updated .env.sentry" -ForegroundColor Green
    Write-Host "  - Fixed org typo (baltzisthemiscom → baltzakisthemiscom)" -ForegroundColor Gray
    Write-Host "  - Added SENTRY_ORG and SENTRY_PROJECT" -ForegroundColor Gray
} catch {
    Write-Host "⚠ Failed to update .env.sentry: $_" -ForegroundColor Yellow
    Write-Host "  You may need to update it manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Token configured successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run sentry:fix-config" -ForegroundColor White
Write-Host "   This will discover your org/project and verify the configuration" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Then run: npm run sentry:issues" -ForegroundColor White
Write-Host "   This will analyze your Sentry issues" -ForegroundColor Gray
Write-Host ""
