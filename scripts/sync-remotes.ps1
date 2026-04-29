$ErrorActionPreference = 'Stop'

$repoName = 'vscode-toon-tools'
$owner = 'oaslananka'
$org = 'oaslananka-lab'

$remotes = git remote
if ($remotes -notcontains 'lab') {
  git remote add lab "https://github.com/$org/$repoName.git"
}
if ($remotes -notcontains 'gitlab') {
  git remote add gitlab "https://gitlab.com/$owner/$repoName.git"
}

git fetch --all
Write-Host 'Pushing to origin (personal)...'
git push origin --all --tags
Write-Host 'Pushing to lab (LAB org)...'
git push lab --all --tags
Write-Host 'Pushing to gitlab...'
git push gitlab --all --tags
Write-Host 'All remotes synced.'
