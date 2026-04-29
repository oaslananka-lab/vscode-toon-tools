import * as vscode from 'vscode';
import { parseToonBlocks } from '../parser/toonParser';
import { ToonBlock, ToonDiagnostic, ToonDiagnosticSeverity } from '../parser/toonTypes';

const LANGUAGE_ID = 'toon';

export function registerToonLinter(
  collection: vscode.DiagnosticCollection,
  context: vscode.ExtensionContext
): void {
  const timers = new Map<string, NodeJS.Timeout>();

  const schedule = (document: vscode.TextDocument): void => {
    if (document.languageId !== LANGUAGE_ID) {
      return;
    }

    const config = vscode.workspace.getConfiguration('toon');
    if (!config.get<boolean>('linter.enabled', true)) {
      collection.delete(document.uri);
      return;
    }

    const key = document.uri.toString();
    const pending = timers.get(key);
    if (pending) {
      clearTimeout(pending);
    }

    const delay = config.get<number>('linter.debounceMs', 300);
    const handle = setTimeout(() => {
      timers.delete(key);
      lintDocument(document, collection);
    }, delay);
    timers.set(key, handle);
  };

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(schedule),
    vscode.workspace.onDidChangeTextDocument((event) => schedule(event.document)),
    vscode.workspace.onDidCloseTextDocument((document) => {
      const pending = timers.get(document.uri.toString());
      if (pending) {
        clearTimeout(pending);
      }
      timers.delete(document.uri.toString());
      if (document.languageId === LANGUAGE_ID) {
        collection.delete(document.uri);
      }
    })
  );

  vscode.workspace.textDocuments.forEach(schedule);
}

function lintDocument(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): void {
  try {
    const blocks = parseToonBlocks(document.getText());
    const toonDiagnostics = validateToonBlocks(blocks, document);
    const diagnostics = toonDiagnostics.map(
      (diag) => new vscode.Diagnostic(diag.range, diag.message, mapSeverity(diag.severity))
    );
    collection.set(document.uri, diagnostics);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`TOON linter failed: ${message}`);
  }
}

export function validateToonBlocks(
  blocks: ToonBlock[],
  document: vscode.TextDocument
): ToonDiagnostic[] {
  const diagnostics: ToonDiagnostic[] = [];

  for (const block of blocks) {
    if (block.rows.length !== block.rowCountDeclared) {
      diagnostics.push({
        message: `Row count mismatch. Declared ${block.rowCountDeclared}, found ${block.rows.length}.`,
        severity: 'error',
        range: lineRange(document, block.headerLine),
      });
    }

    const duplicateFields = getDuplicateFields(block.fields);
    if (duplicateFields.length > 0) {
      diagnostics.push({
        message: `Duplicate field names: ${duplicateFields.join(', ')}`,
        severity: 'warning',
        range: fieldRange(document, block.headerLine),
      });
    }

    for (const row of block.rows) {
      if (row.values.length !== block.fields.length) {
        diagnostics.push({
          message: `Expected ${block.fields.length} values, found ${row.values.length}.`,
          severity: 'error',
          range: lineRange(document, row.line),
        });
      }
    }
  }

  return diagnostics;
}

export function mapSeverity(severity: ToonDiagnosticSeverity): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'warning':
      return vscode.DiagnosticSeverity.Warning;
    case 'info':
      return vscode.DiagnosticSeverity.Information;
    case 'error':
      return vscode.DiagnosticSeverity.Error;
  }
}

function fieldRange(document: vscode.TextDocument, line: number): vscode.Range {
  const text = document.lineAt(line).text;
  const startIndex = text.indexOf('{');
  const endIndex = text.indexOf('}');
  const start = startIndex >= 0 ? startIndex + 1 : 0;
  const end = endIndex >= 0 ? endIndex : text.length;
  return new vscode.Range(line, start, line, end);
}

function lineRange(document: vscode.TextDocument, line: number): vscode.Range {
  const text = document.lineAt(line).text;
  return new vscode.Range(line, 0, line, text.length);
}

function getDuplicateFields(fields: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  fields.forEach((field) => {
    const lower = field.toLowerCase();
    if (seen.has(lower)) {
      duplicates.add(field);
    } else {
      seen.add(lower);
    }
  });
  return Array.from(duplicates.values());
}
