# Sentry CLI Issues Management Script
# Wrapper script to use Sentry CLI for issue management

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('list', 'resolve', 'ignore', 'unresolve', 'delete', 'update', 'details', 'stats')]
    [string]$Action = 'list',

    [Parameter(Mandatory=$false)]
    [string]$IssueId = '',

    [Parameter(Mandatory=$false)]
    [string]$Status = 'unresolved',

    [Parameter(Mandatory=$false)]
    [int]$Limit = 10,

    [Parameter(Mandatory=$false)]
    [string]$Query = '',

    [Parameter(Mandatory=$false)]
    [string]$Org = 'baltzakisthemiscom',

    [Parameter(Mandatory=$false)]
    [string]$Project = 'matlab'
)

$ErrorActionPreference = "Continue"

Write-Host "=== Sentry CLI Issues Management ===" -ForegroundColor Cyan
Write-Host ""

# Check if Sentry CLI is available
try {
    $cliVersion = npx @sentry/cli --version 2>&1 | Select-String -Pattern "sentry-cli" | ForEach-Object { $_.Line }
    if ($cliVersion) {
        Write-Host "✓ Sentry CLI: $cliVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Sentry CLI not found. Installing..." -ForegroundColor Yellow
    npm install --save-dev @sentry/cli
}

Write-Host ""

switch ($Action) {
    'list' {
        Write-Host "📋 Listing $Status issues..." -ForegroundColor Yellow
        Write-Host ""

        $queryValue = if ($Query) { $Query } else { "is:$Status" }

        try {
            if ($queryValue) {
                npx @sentry/cli issues list `
                    --status $Status `
                    --max-rows $Limit `
                    --query $queryValue
            } else {
                npx @sentry/cli issues list `
                    --status $Status `
                    --max-rows $Limit
            }
        } catch {
            Write-Host "❌ Error listing issues: $_" -ForegroundColor Red
            Write-Host ""
            Write-Host "💡 Try using the API directly:" -ForegroundColor Yellow
            Write-Host "   node scripts/sentry/analyze-issues.js" -ForegroundColor Gray
        }
    }

    'details' {
        if (-not $IssueId) {
            Write-Host "❌ Issue ID is required for details" -ForegroundColor Red
            Write-Host "   Usage: .\scripts\sentry\cli-issues.ps1 -Action details -IssueId 'PROJECT-123'" -ForegroundColor Gray
            exit 1
        }

        Write-Host "🔍 Getting details for issue: $IssueId" -ForegroundColor Yellow
        Write-Host ""

        try {
            npx @sentry/cli issues show --id $IssueId
        } catch {
            Write-Host "❌ Error getting issue details: $_" -ForegroundColor Red
        }
    }

    'resolve' {
        if (-not $IssueId) {
            Write-Host "❌ Issue ID is required to resolve" -ForegroundColor Red
            Write-Host "   Usage: .\scripts\sentry\cli-issues.ps1 -Action resolve -IssueId 'PROJECT-123'" -ForegroundColor Gray
            exit 1
        }

        Write-Host "✅ Resolving issue: $IssueId" -ForegroundColor Yellow
        Write-Host ""

        try {
            npx @sentry/cli issues update --id $IssueId --status resolved
            Write-Host "✓ Issue resolved successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error resolving issue: $_" -ForegroundColor Red
        }
    }

    'ignore' {
        if (-not $IssueId) {
            Write-Host "❌ Issue ID is required to ignore" -ForegroundColor Red
            exit 1
        }

        Write-Host "🔇 Ignoring issue: $IssueId" -ForegroundColor Yellow
        Write-Host ""

        try {
            npx @sentry/cli issues update --id $IssueId --status muted
            Write-Host "✓ Issue ignored successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error ignoring issue: $_" -ForegroundColor Red
        }
    }

    'unresolve' {
        if (-not $IssueId) {
            Write-Host "❌ Issue ID is required to unresolve" -ForegroundColor Red
            exit 1
        }

        Write-Host "🔄 Unresolving issue: $IssueId" -ForegroundColor Yellow
        Write-Host ""

        try {
            npx @sentry/cli issues update --id $IssueId --status unresolved
            Write-Host "✓ Issue unresolved successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error unresolving issue: $_" -ForegroundColor Red
        }
    }

    'stats' {
        Write-Host "📊 Getting issue statistics..." -ForegroundColor Yellow
        Write-Host ""

        try {
            Write-Host "Unresolved issues:" -ForegroundColor Cyan
            npx @sentry/cli issues list --status unresolved --max-rows 1 2>&1 | Out-Null

            Write-Host ""
            Write-Host "Resolved issues:" -ForegroundColor Cyan
            npx @sentry/cli issues list --status resolved --max-rows 1 2>&1 | Out-Null

            Write-Host ""
            Write-Host "💡 For detailed stats, use:" -ForegroundColor Yellow
            Write-Host "   node scripts/sentry/analyze-issues.js" -ForegroundColor Gray
        } catch {
            Write-Host "❌ Error getting stats: $_" -ForegroundColor Red
        }
    }

    default {
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Write-Host ""
        Write-Host "Available actions:" -ForegroundColor Yellow
        Write-Host "  list      - List issues (default)" -ForegroundColor Gray
        Write-Host "  details   - Get issue details" -ForegroundColor Gray
        Write-Host "  resolve   - Resolve an issue" -ForegroundColor Gray
        Write-Host "  ignore    - Ignore an issue" -ForegroundColor Gray
        Write-Host "  unresolve - Unresolve an issue" -ForegroundColor Gray
        Write-Host "  stats     - Get issue statistics" -ForegroundColor Gray
    }
}

Write-Host ""
