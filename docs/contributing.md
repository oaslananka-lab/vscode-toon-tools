# Contributing

## Setup

```bash
git clone https://github.com/oaslananka/vscode-toon-tools.git
cd vscode-toon-tools
npm ci
npm run build
```

Launch the extension with `F5` and the `Launch TOON Extension` configuration.

## Branch Policy

- `main` is stable and protected in the LAB repository.
- `develop` is the integration branch.
- Release branches use `release/vX.Y.Z`.
- Feature and fix branches should target `develop`.

## Commit Convention

Use conventional commits:

```text
feat: add table filtering
fix: handle quoted TOON values
docs: update publishing guide
security: tighten webview CSP
```

## Test Requirements

Run the relevant checks before opening a pull request:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:unit:coverage
npm run build
```

For release-bound changes, run:

```bash
npm run check:ci
```

## Pull Request Checklist

- The change is focused and does not rewrite unrelated code.
- Public behavior changes are documented.
- Unit tests cover parser, converter, formatter, linter, or provider behavior affected by the change.
- Webview changes preserve a restrictive CSP and use VS Code theme variables.
- No secrets or tokens are committed.
