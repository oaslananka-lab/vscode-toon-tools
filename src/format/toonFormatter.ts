import * as vscode from 'vscode';
import { parseToonBlocks } from '../parser/toonParser';
import { ToonBlock } from '../parser/toonTypes';

export interface FormatToonOptions {
  indentWidth?: 2 | 4;
  fieldSpacing?: 'compact' | 'spaced';
}

export class ToonFormattingProvider implements vscode.DocumentFormattingEditProvider {
  provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
    if (document.lineCount === 0) {
      return [];
    }

    const config = vscode.workspace.getConfiguration('toon');
    const indentWidth = config.get<2 | 4>('formatter.indentWidth', 2);
    const fieldSpacing = config.get<'compact' | 'spaced'>('formatter.fieldSpacing', 'compact');
    const lastLine = document.lineAt(document.lineCount - 1);
    const fullRange = new vscode.Range(0, 0, document.lineCount - 1, lastLine.text.length);
    const formatted = formatToonDocument(document.getText(), { indentWidth, fieldSpacing });
    return [vscode.TextEdit.replace(fullRange, formatted)];
  }
}

export function formatToonDocument(text: string, options: FormatToonOptions = {}): string {
  const blocks = parseToonBlocks(text);
  if (blocks.length === 0) {
    return text.trimEnd();
  }

  const lines = text.split(/\r?\n/);
  const blockByHeader = new Map<number, ToonBlock>();
  blocks.forEach((block) => blockByHeader.set(block.headerLine, block));

  const formattedLines: string[] = [];
  let currentLine = 0;
  let lastSegmentWasBlock = false;

  while (currentLine < lines.length) {
    const block = blockByHeader.get(currentLine);
    if (block) {
      if (lastSegmentWasBlock && formattedLines.length > 0 && lastValue(formattedLines) !== '') {
        formattedLines.push('');
      }

      formattedLines.push(...formatBlock(block, options).split('\n'));
      lastSegmentWasBlock = true;
      currentLine = Math.max(block.bodyEndLine, block.headerLine) + 1;
      continue;
    }

    const trimmed = lines[currentLine].trim();
    if (trimmed.startsWith('#') || !trimmed) {
      formattedLines.push(lines[currentLine].trimEnd());
    } else {
      formattedLines.push(lines[currentLine]);
    }
    lastSegmentWasBlock = false;
    currentLine += 1;
  }

  return formattedLines.join('\n').trimEnd();
}

function formatBlock(block: ToonBlock, options: FormatToonOptions): string {
  const indent = ' '.repeat(options.indentWidth ?? 2);
  const separator = options.fieldSpacing === 'spaced' ? ', ' : ',';
  const header = `${block.name}[${block.rowCountDeclared}]{${block.fields.join(separator)}}:`;
  const body = block.rows.map((row) => `${indent}${row.values.join(',')}`).join('\n');
  return body ? `${header}\n${body}` : header;
}

function lastValue(values: string[]): string | undefined {
  return values[values.length - 1];
}
