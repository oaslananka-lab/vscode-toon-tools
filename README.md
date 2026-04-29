# TOON Tools for VS Code

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/oaslananka.vscode-toon-tools?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=oaslananka.vscode-toon-tools)
[![Open VSX](https://img.shields.io/open-vsx/v/oaslananka/vscode-toon-tools?label=Open%20VSX)](https://open-vsx.org/extension/oaslananka/vscode-toon-tools)
[![CI](https://github.com/oaslananka-lab/vscode-toon-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/oaslananka-lab/vscode-toon-tools/actions/workflows/ci.yml)
[![Codecov](https://codecov.io/gh/oaslananka-lab/vscode-toon-tools/branch/main/graph/badge.svg)](https://codecov.io/gh/oaslananka-lab/vscode-toon-tools)

> Token-Oriented Object Notation support: syntax highlighting, formatting, linting,
> intelligent editing, previews, table viewer, and dual-marketplace publishing.

TOON Tools turns `.toon` files into a first-class VS Code editing experience for compact
tabular data. It supports authoring, diagnostics, JSON conversion, data inspection, size analysis,
and CSV export without leaving the editor.

![TOON Tools icon](images/toon-tools-icon.png)

## Features

| Feature               | Description                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Syntax highlighting   | TextMate grammar for block names, row counts, fields, comments, quoted strings, empty values, and separators. |
| Formatter             | Normalizes headers, row indentation, comma spacing, and trailing whitespace.                                  |
| Linter                | Reports row-count mismatches, duplicate fields, and rows with the wrong number of values.                     |
| Hover                 | Shows block metadata on headers and field names on data-row cells.                                            |
| Inlay hints           | Displays field-name hints before row values, controlled by `toon.inlayHints.enabled`.                         |
| Rename and definition | Rename block or field names from headers, and jump from rows back to the block header.                        |
| JSON conversion       | Convert JSON arrays or objects of arrays to TOON, and convert TOON back to JSON.                              |
| Table Viewer          | Inspect blocks as sortable, filterable tables in a VS Code-themed webview.                                    |
| Size Analyzer         | Compare TOON and JSON byte counts, line counts, and token estimates.                                          |
| CSV export            | Export any TOON block to a CSV file from the command palette or context menu.                                 |

## TOON Format Specification

TOON stores tabular records as named blocks:

```toon
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user
```

Header syntax:

```text
BlockName[rowCount]{field1,field2,...}:
```

Rows are indented comma-separated values. Empty values are allowed. Double-quoted values may contain
commas, and embedded quotes are escaped by doubling them:

```toon
users[2]{id,name,note}:
  1,"Bob, Jr.","Says ""hello"""
  2,Alice,
```

Comments start with `#` when the line begins with optional whitespace. See
[docs/toon-spec.md](docs/toon-spec.md) for the complete grammar and examples.

## Configuration

| Setting                       | Default   | Description                                                     |
| ----------------------------- | --------- | --------------------------------------------------------------- |
| `toon.linter.enabled`         | `true`    | Enable real-time TOON linting.                                  |
| `toon.linter.debounceMs`      | `300`     | Debounce delay in milliseconds for linting on document changes. |
| `toon.formatter.indentWidth`  | `2`       | Number of spaces for row indentation. Allowed values: `2`, `4`. |
| `toon.formatter.fieldSpacing` | `compact` | Header field separator style: `compact` or `spaced`.            |
| `toon.inlayHints.enabled`     | `true`    | Show field-name inlay hints in data rows.                       |
| `toon.statusBar.enabled`      | `true`    | Show the current TOON block count in the VS Code status bar.    |

`.toonrc` files are validated against [schemas/toon-config.schema.json](schemas/toon-config.schema.json).

## Commands

| Command                          | Description                                                        | Default shortcut |
| -------------------------------- | ------------------------------------------------------------------ | ---------------- |
| `TOON: Convert JSON to TOON`     | Convert the active JSON document or selection into a TOON preview. | None             |
| `TOON: Convert TOON to JSON`     | Convert the active TOON document or selection into formatted JSON. | None             |
| `TOON: Open JSON Preview (side)` | Open a side-by-side JSON preview for the active TOON document.     | None             |
| `TOON: Open TOON Preview (side)` | Open a side-by-side TOON preview for the active JSON document.     | None             |
| `TOON: Open Table Viewer`        | Open the active TOON document in a sortable table viewer.          | None             |
| `TOON: Analyze Size / Tokens`    | Compare TOON and JSON byte counts and token estimates.             | None             |
| `TOON: Export Block as CSV`      | Export a selected TOON block to CSV.                               | None             |

## Extension Development

```bash
git clone https://github.com/oaslananka/vscode-toon-tools.git
cd vscode-toon-tools
npm ci
npm run build
```

Launch the extension with `F5` and the `Launch TOON Extension` configuration.

Useful local gates:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:unit:coverage
npm run build
npm run package
```

## Contributing

See [docs/contributing.md](docs/contributing.md).

## License

MIT. See [LICENSE](LICENSE).
