$ErrorActionPreference = 'Stop'

$project = if ($env:DOPPLER_PROJECT) { $env:DOPPLER_PROJECT } else { 'vscode-toon-tools' }
$config = if ($env:DOPPLER_CONFIG) { $env:DOPPLER_CONFIG } else { 'main' }
$missing = @()

Get-Content .doppler/secrets.txt | ForEach-Object {
  $line = $_.Trim()
  if ($line -eq '' -or $line.StartsWith('#')) {
    return
  }
  doppler secrets get $line --plain --project $project --config $config *> $null
  if ($LASTEXITCODE -ne 0) {
    $missing += $line
  }
}

if ($missing.Count -gt 0) {
  Write-Error "Missing Doppler secrets in $project/$config: $($missing -join ', ')"
  exit 1
}

Write-Host "All required secrets present in $project/$config."
