# Sentry MCP Authentication Setup Script
# This script helps configure Sentry MCP authentication

param(
    [string]$Token = "",
    [string]$OrgSlug = "baltzakisthemiscom"
)

$mcpPath = "$env:APPDATA\Cursor\User\mcp.json"

Write-Host "=== Sentry MCP Authentication Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if token is provided
if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "No token provided. Please generate a Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://sentry.io/settings/account/api/auth-tokens/" -ForegroundColor White
    Write-Host "2. Click 'Create New Token'" -ForegroundColor White
    Write-Host "3. Select these scopes:" -ForegroundColor White
    Write-Host "   - org:read" -ForegroundColor Gray
    Write-Host "   - project:read" -ForegroundColor Gray
    Write-Host "   - event:read" -ForegroundColor Gray
    Write-Host "   - event:write" -ForegroundColor Gray
    Write-Host "4. Copy the token (starts with 'sntrys_')" -ForegroundColor White
    Write-Host ""
    $Token = Read-Host "Paste your Personal Access Token here"
}

if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "Error: Token is required" -ForegroundColor Red
    exit 1
}

# Validate token format
if (-not $Token.StartsWith("sntrys_")) {
    Write-Host "Warning: Token should start with 'sntrys_'" -ForegroundColor Yellow
}

# Read current MCP config
try {
    $config = Get-Content $mcpPath | ConvertFrom-Json
} catch {
    Write-Host "Error reading mcp.json: $_" -ForegroundColor Red
    exit 1
}

# Update Sentry MCP configuration
if (-not $config.mcpServers) {
    $config | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value @{} -Force
}

$config.mcpServers.sentry = @{
    command = "npx"
    args = @("-y", "@sentry/mcp")
    env = @{
        SENTRY_AUTH_TOKEN = $Token
    }
}

# Add organization if provided
if (-not [string]::IsNullOrEmpty($OrgSlug)) {
    $config.mcpServers.sentry.env.SENTRY_ORG = $OrgSlug
}

# Write updated config
try {
    $config | ConvertTo-Json -Depth 10 | Set-Content $mcpPath
    Write-Host "✓ Sentry MCP configuration updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuration saved to: $mcpPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "=== Next Steps ===" -ForegroundColor Cyan
    Write-Host "1. RESTART CURSOR for changes to take effect" -ForegroundColor Yellow
    Write-Host "2. Test authentication after restart" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "Error writing mcp.json: $_" -ForegroundColor Red
    exit 1
}
