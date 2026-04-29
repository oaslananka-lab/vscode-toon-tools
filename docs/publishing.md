# Publishing TOON Tools

Publishing uses Doppler for registry tokens and supports both VS Code Marketplace and Open VSX.

Required Doppler project/config:

- Project: `vscode-toon-tools`
- Config: `main`

Required secrets:

- `VSCE_PAT`
- `OVSX_PAT`
- `CODECOV_TOKEN`

## Local Verification

Run the full local gate before publishing:

```bash
npm ci
npm run check:ci
code --install-extension vscode-toon-tools-1.0.0.vsix
```

Review package contents:

```bash
npm run package:ls
```

## Publish

Preferred path:

```bash
doppler run --project vscode-toon-tools --config main -- bash scripts/publish.sh
```

Manual commands:

```bash
doppler run --project vscode-toon-tools --config main -- npx vsce publish --no-dependencies
doppler run --project vscode-toon-tools --config main -- npx ovsx publish --pat "$OVSX_PAT"
```

## Release Workflow

The LAB repository owns automated GitHub Actions:

```bash
gh workflow run release.yml \
  --repo oaslananka-lab/vscode-toon-tools \
  --field version=v1.0.0 \
  --field publish=false
```

Use `publish=true` only when intentionally publishing through GitHub Actions, and set
`approval=APPROVE_RELEASE`.
