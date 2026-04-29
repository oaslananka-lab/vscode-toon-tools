#!/usr/bin/env bash
set -euo pipefail

echo "=== TOON Tools Publish ==="

if [ -z "${VSCE_PAT:-}" ] && command -v doppler >/dev/null 2>&1; then
  echo "Loading secrets from Doppler..."
  eval "$(doppler secrets download --project vscode-toon-tools --config main --format env --no-file)"
fi

if [ -n "${VSCE_PAT:-}" ]; then
  echo "Publishing to VS Code Marketplace..."
  npx vsce publish --pat "$VSCE_PAT" --no-dependencies
  echo "VS Code Marketplace: done"
else
  echo "VSCE_PAT not set - skipping Marketplace."
fi

if [ -n "${OVSX_PAT:-}" ]; then
  echo "Publishing to Open VSX Registry..."
  npx ovsx publish --pat "$OVSX_PAT"
  echo "Open VSX: done"
else
  echo "OVSX_PAT not set - skipping Open VSX."
fi
