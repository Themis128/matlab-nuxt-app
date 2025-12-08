# Sentry MCP Issue Addressing Script
# This script helps set up Sentry MCP authentication and then addresses issues

param(
    [string]$Token = "",
    [string]$OrgSlug = "baltzakisthemiscom",
    [switch]$SetupOnly = $false
)

$ErrorActionPreference = "Stop"

Write-Host "=== Sentry MCP Issue Addressing ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Setup Authentication
Write-Host "Step 1: Setting up Sentry MCP authentication..." -ForegroundColor Yellow

if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "No token provided. Please generate a Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://sentry.io/settings/account/api/auth-tokens/" -ForegroundColor White
    Write-Host "2. Click 'Create New Token'" -ForegroundColor White
    Write-Host "3. Select these scopes:" -ForegroundColor White
    Write-Host "   - org:read" -ForegroundColor Gray
    Write-Host "   - project:read" -ForegroundColor Gray
    Write-Host "   - event:read" -ForegroundColor Gray
    Write-Host "   - event:write" -ForegroundColor Gray
    Write-Host "   - org:write (if you want to update issues)" -ForegroundColor Gray
    Write-Host "4. Copy the token (starts with 'sntrys_')" -ForegroundColor White
    Write-Host ""
    $Token = Read-Host "Paste your Personal Access Token here"
}

if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "Error: Token is required" -ForegroundColor Red
    exit 1
}

# Update MCP configuration
$mcpPath = "$env:APPDATA\Cursor\User\mcp.json"
try {
    $config = Get-Content $mcpPath | ConvertFrom-Json

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

    if (-not [string]::IsNullOrEmpty($OrgSlug)) {
        $config.mcpServers.sentry.env.SENTRY_ORG = $OrgSlug
    }

    $config | ConvertTo-Json -Depth 10 | Set-Content $mcpPath
    Write-Host "✓ Sentry MCP configuration updated" -ForegroundColor Green
} catch {
    Write-Host "Error updating mcp.json: $_" -ForegroundColor Red
    exit 1
}

if ($SetupOnly) {
    Write-Host ""
    Write-Host "=== Setup Complete ===" -ForegroundColor Green
    Write-Host "Please RESTART CURSOR for changes to take effect." -ForegroundColor Yellow
    Write-Host "After restart, you can use Sentry MCP tools to address issues." -ForegroundColor White
    exit 0
}

# Step 2: Instructions for using MCP after restart
Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. RESTART CURSOR (required for MCP changes)" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. After restart, use these Sentry MCP commands to address issues:" -ForegroundColor White
Write-Host ""
Write-Host "   Find unresolved issues:" -ForegroundColor Gray
Write-Host "   - search_issues(org='$OrgSlug', query='is:unresolved')" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Find critical issues:" -ForegroundColor Gray
Write-Host "   - search_issues(org='$OrgSlug', query='level:error is:unresolved')" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Get issue details:" -ForegroundColor Gray
Write-Host "   - get_issue_details(org='$OrgSlug', issueId='ISSUE-ID')" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Analyze issue with AI:" -ForegroundColor Gray
Write-Host "   - analyze_issue_with_seer(org='$OrgSlug', issueId='ISSUE-ID')" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Resolve an issue:" -ForegroundColor Gray
Write-Host "   - update_issue(org='$OrgSlug', issueId='ISSUE-ID', status='resolved')" -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. Example workflow:" -ForegroundColor White
Write-Host "   a. Search for unresolved issues" -ForegroundColor Gray
Write-Host "   b. Get details for critical issues" -ForegroundColor Gray
Write-Host "   c. Use AI analysis to understand root cause" -ForegroundColor Gray
Write-Host "   d. Fix the code based on analysis" -ForegroundColor Gray
Write-Host "   e. Resolve the issue in Sentry" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Configuration Saved ===" -ForegroundColor Green
Write-Host "Location: $mcpPath" -ForegroundColor Gray
Write-Host ""
