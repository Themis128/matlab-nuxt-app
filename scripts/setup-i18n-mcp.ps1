# PowerShell script to help set up i18n MCP Server configuration for Cursor
# This script generates the MCP configuration with the correct paths for your system

Write-Host "🌍 i18n MCP Server Configuration Generator" -ForegroundColor Cyan
Write-Host ""

# Get the current project root
$projectRoot = $PSScriptRoot | Split-Path -Parent
$projectRoot = $projectRoot -replace '\\', '/'

Write-Host "📁 Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Configuration template
$config = @{
  mcpServers = @{
    i18n = @{
      command = "npx"
      args = @(
        "-y"
        "i18n-mcp"
        "--dir"
        "$projectRoot/i18n/locales"
        "--base-language"
        "en"
        "--src-dir"
        $projectRoot
        "--project-root"
        $projectRoot
        "--exclude"
        "node_modules,dist,.nuxt,.output,venv,__pycache__,test-results,playwright-report"
        "--generate-types"
        "$projectRoot/types/i18n.ts"
        "--frameworks"
        "vue"
        "--key-style"
        "nested"
        "--debug"
      )
    }
  }
}

# Convert to JSON with proper formatting
$jsonConfig = $config | ConvertTo-Json -Depth 10

Write-Host "📋 Generated Configuration:" -ForegroundColor Green
Write-Host ""
Write-Host $jsonConfig
Write-Host ""

# Save to file
$outputPath = Join-Path $projectRoot ".cursor" "mcp-i18n-config.json"
$outputDir = Split-Path $outputPath -Parent

if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$jsonConfig | Out-File -FilePath $outputPath -Encoding UTF8
Write-Host "✅ Configuration saved to: $outputPath" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open Cursor IDE" -ForegroundColor White
Write-Host "2. Press Ctrl+Shift+P and type 'Preferences: Open User Settings (JSON)'" -ForegroundColor White
Write-Host "3. Copy the configuration above into your Cursor settings" -ForegroundColor White
Write-Host "4. Restart Cursor IDE" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: You can also use the configuration file at:" -ForegroundColor Yellow
Write-Host "   $outputPath" -ForegroundColor Gray
Write-Host ""
