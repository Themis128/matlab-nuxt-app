param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('show','hide')]
    [string]$mode = 'hide',
    [switch]$backup
)

# Determine paths relative to this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path "$scriptDir\..\.."
$settingsDir = Join-Path $repoRoot ".vscode"
$controlsDir = Join-Path $settingsDir "settings-controls"
$targetFile = Join-Path $settingsDir "settings.json"

Write-Host "Repo root: $repoRoot"
Write-Host "Target settings: $targetFile"

if (-not (Test-Path $controlsDir)) {
    Write-Error "settings-controls folder not found in: $controlsDir"
    exit 1
}

switch ($mode) {
    'hide' {
        $source = Join-Path $controlsDir "settings-hide.json"
    }
    'show' {
        $source = Join-Path $controlsDir "settings-show.json"
    }
}

if ($backup -and (Test-Path $targetFile)) {
    $bak = Join-Path $settingsDir "settings.json.bak"
    Copy-Item -Path $targetFile -Destination $bak -Force
    Write-Host "Backed up current settings to $bak"
}

if (-not (Test-Path $source)) {
    Write-Error "Source settings template not found: $source"
    exit 1
}

Copy-Item -Path $source -Destination $targetFile -Force
Write-Host "Applied settings: $mode"
Write-Host "Reload VS Code or run 'Developer: Reload Window' to apply changes."
