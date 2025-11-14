# TOON Tools for VS Code

<!-- Badges placeholder: VS Code Marketplace | GitHub Actions | License -->

> Author expressive TOON (Token Oriented Object Notation) files with syntax highlighting, formatting, linting, JSON⇄TOON conversion, previews, and interactive inspectors directly inside VS Code.

## Features

- **Language tooling** – TextMate grammar, language configuration, snippets, completion, folding, and symbol navigation for `.toon` files.
- **Formatter & linter** – Opinionated formatter plus live diagnostics for row counts, missing fields, and structural mistakes.
- **Converters & previews** – Commands to convert JSON⇄TOON or open side-by-side previews without touching disk.
- **Table Viewer** – Sort, filter, and explore TOON data as a grid via a lightweight webview.
- **Size Analyzer** – Compare TOON vs JSON payload sizes and token estimates for quick budgeting.
- **Themed iconography** – `.toon` tabs display a custom TOON icon in both light and dark themes.

## Installation

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Build once to generate `dist/`:

   ```bash
   npm run build
   ```

3. Press `F5` (the **Launch TOON Extension** config) to open an Extension Development Host. For Marketplace publishing, package via `vsce package` (see below).

## Usage

### Authoring TOON

1. In the Extension Development Host window, open `test-fixtures/sample.toon` or create a fresh `.toon` file.
2. Confirm the status bar shows **TOON** and the editor tab displays the TOON icon.
3. Use the `toon-table` snippet to scaffold blocks, rely on completion for field names, and fold headers via VS Code folding controls.

### Command Palette actions

- `TOON: Convert JSON to TOON`
- `TOON: Convert TOON to JSON`
- `TOON: Open JSON Preview`
- `TOON: Open TOON Preview`
- `TOON: Open Table Viewer`
- `TOON: Analyze Size / Tokens`

All commands operate on the active editor; previews open in additional tabs so your source remains intact.

### Interactive viewers

- **Table Viewer** – Presents TOON rows as a sortable/filterable table for quick inspections.
- **Size / Token Analyzer** – Displays byte counts plus token estimates for both TOON and JSON so you can track payload budgets.

## Development

```bash
npm install
npm run build
npm run watch
```

- Use `npm run watch` during development to keep `dist/` up to date.
- Launch the extension with `F5` → **Launch TOON Extension**.
- No secrets or API tokens are embedded in the repository; contributions should continue this pattern.

## Manual Verification Suite

Use the fixtures in `test-fixtures/` after launching the Extension Development Host (`F5`).

- Open `sample.toon` → confirm **TOON** status bar text, custom icon in the tab, lint-free Problems panel, formatter output, snippets, completion, folding, and symbol navigation.
- Run `TOON: Convert TOON to JSON`, `TOON: Open JSON Preview`, `TOON: Open Table Viewer`, and `TOON: Analyze Size / Tokens`; compare results with `sample.json`.
- Open `sample-invalid.toon` → Problems panel should report row-count mismatch and missing-field diagnostics with correct line ranges.
- Open `sample.json` → run `TOON: Convert JSON to TOON` and `TOON: Open TOON Preview`; inspect converted text beside the JSON source.
- Editing ergonomics → In a new `.toon`, trigger the `toon-table` snippet, accept completion suggestions, fold/unfold blocks, and use “Go to Symbol in File”.

## GitHub Publishing Checklist

```bash
git init
git add .
git commit -m "Initial TOON VS Code extension"
git branch -M main
git remote add origin git@github.com/oaslananka/vscode-toon-tools.git
# or
# git remote add origin https://github.com/oaslananka/vscode-toon-tools.git
git push -u origin main
```

## VS Code Marketplace (Placeholder)

1. Install `vsce` and ensure `publisher` is `oaslananka`.
2. Create a Personal Access Token with the `Marketplace` scope.
3. Package locally:

   ```bash
   vsce package
   ```

4. Publish once credentials are configured:

   ```bash
   vsce publish
   ```

## Release Notes

See `CHANGELOG.md` for complete history. Highlights for v0.1.0:

- Initial public release of TOON Tools for VS Code.
- Includes language services, formatter, linter, JSON⇄TOON conversion, Table Viewer, Size Analyzer, themed icons, and manual verification fixtures.
