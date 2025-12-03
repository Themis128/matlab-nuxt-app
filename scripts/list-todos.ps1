<#
PowerShell helper script to list TODOs in the repository.
Works on Windows (PowerShell) — compatible with the repo's default shell.
#>
param(
    [string]$Path = '.',
    [switch]$IncludeHidden
)

Write-Host "Searching for TODOs under: $Path`n"

# Build pattern to capture comment-based TODOs for common languages
$pattern = "(?:(?:\/\/|#|<!--|\/\\*|\\*|%|;|--)\\s*)(TODO|FIXME|HACK|BUG|OPTIMIZE|NOTE|REVIEW|DEPRECATED|QUESTION)[:\\s-]*(.*)"

if (Get-Command rg -ErrorAction SilentlyContinue) {
    # Use ripgrep if available (fast)
    $cmd = "rg -n --hidden --glob '!node_modules' --glob '!.git' --glob '!venv' --glob '!*.output' -S -e '$pattern' $Path"
    Write-Host "Using ripgrep (rg)" -ForegroundColor Green
    Invoke-Expression $cmd
}
else {
    # Fallback to Select-String which is slower
    Get-ChildItem -Path $Path -Recurse -Force -File | Where-Object { $_.FullName -notmatch '\\.(git|gif|png|jpg|mp4|avi|mov)$' -and $_.FullName -notmatch '\\node_modules\\|\\.git\\|\\.output\\|\\venv\\|\\.venv\\|\\__pycache__\\|\\dist\\|\\playwright-report\\|\\.parcel-cache\\' } | ForEach-Object {
        $file = $_.FullName
        $fileMatches = Select-String -Path $file -Pattern $pattern -AllMatches
        if ($fileMatches) {
            foreach ($m in $fileMatches) {
                foreach ($sub in $m.Matches) {
                    $keyword = $sub.Groups[1].Value
                    $body = $sub.Groups[2].Value
                    Write-Host "$($file):$($m.LineNumber) [$keyword] $($body.Trim())"
                }
            }
        }
    }
}
