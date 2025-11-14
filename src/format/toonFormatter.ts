import * as vscode from 'vscode';
import { parseToonBlocks } from '../parser/toonParser';
import { ToonBlock } from '../parser/toonTypes';

export class ToonFormattingProvider implements vscode.DocumentFormattingEditProvider {
  provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
    if (document.lineCount === 0) {
      return [];
    }

    const lastLine = document.lineAt(document.lineCount - 1);
    const fullRange = new vscode.Range(0, 0, document.lineCount - 1, lastLine.text.length);
    const formatted = formatToonDocument(document.getText());
    return [vscode.TextEdit.replace(fullRange, formatted)];
  }
}

export function formatToonDocument(text: string): string {
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
      if (lastSegmentWasBlock && formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }

      const normalized = formatBlock(block).split('\n');
      formattedLines.push(...normalized);

      lastSegmentWasBlock = true;
      currentLine = Math.max(block.bodyEndLine, block.headerLine) + 1;
      continue;
    }

    formattedLines.push(lines[currentLine]);
    lastSegmentWasBlock = false;
    currentLine += 1;
  }

  return formattedLines.join('\n').trimEnd();
}

function formatBlock(block: ToonBlock): string {
  const header = `${block.name}[${block.rowCountDeclared}]{${block.fields.join(',')}}:`;
  const body = block.rows.map((row) => `  ${row.values.join(',')}`).join('\n');
  return body ? `${header}\n${body}` : header;
}
