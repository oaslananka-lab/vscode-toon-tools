#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="vscode-toon-tools"
OWNER="oaslananka"
ORG="oaslananka-lab"

if ! git remote | grep -q '^lab$'; then
  git remote add lab "https://github.com/${ORG}/${REPO_NAME}.git"
fi

if ! git remote | grep -q '^gitlab$'; then
  git remote add gitlab "https://gitlab.com/${OWNER}/${REPO_NAME}.git"
fi

git fetch --all
echo "Pushing to origin (personal)..."
git push origin --all --tags
echo "Pushing to lab (LAB org)..."
git push lab --all --tags
echo "Pushing to gitlab..."
git push gitlab --all --tags
echo "All remotes synced."
