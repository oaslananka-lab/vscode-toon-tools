# Changelog

## [1.0.0] - 2026-04-29

### Added

- Hover provider: block metadata and column field hints.
- Inlay hints: field names shown inline in data rows, configurable through `toon.inlayHints.enabled`.
- Rename provider: rename block names and fields.
- Definition provider: jump from data rows to block headers.
- Export CSV command: export any block to a CSV file.
- Status bar item: live block count with a table viewer shortcut.
- Context menu commands for TOON and JSON files.
- Extension settings for linting, formatting, inlay hints, and the status bar.
- `.toonrc` JSON schema validation.
- Comment support in grammar.
- Quoted string values in grammar and parser.

### Changed

- Bundler: migrated from `tsc` output to webpack.
- Webviews: use VS Code CSS variables for theme compatibility.
- Nonce generation: replaced `Math.random()` with `crypto.randomBytes()`.
- Grammar: improved TextMate scopes for block names, row counts, fields, separators, comments, quoted strings, and empty values.

### Infrastructure

- Unit test suite with Jest and a VS Code API mock.
- Integration test scaffold with `@vscode/test-electron`.
- ESLint flat config, Prettier, commitlint, Husky, and lint-staged.
- Taskfile task runner.
- Azure DevOps CI, GitHub Actions LAB automation, and manual GitLab CI mirror.
- Dual-marketplace publishing scripts for VS Code Marketplace and Open VSX.
- Renovate configuration for dependency updates.
- Doppler-based secret inventory and verification.

## [0.1.0] - 2025-01-01

- Initial prototype release.
