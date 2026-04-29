import * as vscode from 'vscode';
import { parseToonBlocks } from '../parser/toonParser';

export class ToonRenameProvider implements vscode.RenameProvider {
  prepareRename(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string }> {
    const token = extractTokenAt(document, position);
    if (!token) {
      return Promise.reject(new Error('No renameable token at cursor.'));
    }
    return { range: token.range, placeholder: token.text };
  }

  provideRenameEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    newName: string
  ): vscode.ProviderResult<vscode.WorkspaceEdit> {
    const token = extractTokenAt(document, position);
    if (!token) {
      return undefined;
    }

    const edit = new vscode.WorkspaceEdit();
    const blocks = parseToonBlocks(document.getText());

    for (const block of blocks) {
      if (token.kind === 'blockName' && block.name === token.text) {
        const lineText = document.lineAt(block.headerLine).text;
        const start = lineText.indexOf(block.name);
        if (start >= 0) {
          edit.replace(
            document.uri,
            new vscode.Range(block.headerLine, start, block.headerLine, start + block.name.length),
            newName
          );
        }
      }

      if (token.kind === 'fieldName' && block.headerLine === token.line) {
        const lineText = document.lineAt(block.headerLine).text;
        let searchFrom = lineText.indexOf('{') + 1;
        for (const field of block.fields) {
          const idx = lineText.indexOf(field, searchFrom);
          if (idx >= 0 && field === token.text) {
            edit.replace(
              document.uri,
              new vscode.Range(block.headerLine, idx, block.headerLine, idx + field.length),
              newName
            );
          }
          searchFrom = idx + field.length + 1;
        }
      }
    }

    return edit;
  }
}

interface RenameToken {
  text: string;
  range: vscode.Range;
  line: number;
  kind: 'blockName' | 'fieldName';
}

function extractTokenAt(
  document: vscode.TextDocument,
  position: vscode.Position
): RenameToken | undefined {
  const lineText = document.lineAt(position.line).text;
  const blocks = parseToonBlocks(document.getText());

  for (const block of blocks) {
    if (block.headerLine !== position.line) {
      continue;
    }

    const nameStart = lineText.indexOf(block.name);
    const nameEnd = nameStart + block.name.length;
    if (position.character >= nameStart && position.character <= nameEnd) {
      return {
        text: block.name,
        range: new vscode.Range(position.line, nameStart, position.line, nameEnd),
        line: position.line,
        kind: 'blockName',
      };
    }

    let searchFrom = lineText.indexOf('{') + 1;
    for (const field of block.fields) {
      const idx = lineText.indexOf(field, searchFrom);
      if (idx >= 0 && position.character >= idx && position.character <= idx + field.length) {
        return {
          text: field,
          range: new vscode.Range(position.line, idx, position.line, idx + field.length),
          line: position.line,
          kind: 'fieldName',
        };
      }
      searchFrom = idx + field.length + 1;
    }
  }

  return undefined;
}
