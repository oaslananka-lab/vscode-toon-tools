import * as vscode from 'vscode';
import { parseToonBlocks } from '../parser/toonParser';

export class ToonHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const blocks = parseToonBlocks(document.getText());
    for (const block of blocks) {
      if (position.line === block.headerLine) {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**Block:** \`${block.name}\`  \n`);
        md.appendMarkdown(`**Declared rows:** ${block.rowCountDeclared}  \n`);
        md.appendMarkdown(`**Actual rows:** ${block.rows.length}  \n`);
        md.appendMarkdown(
          `**Fields (${block.fields.length}):** ${block.fields
            .map((field) => `\`${field}\``)
            .join(', ')}`
        );
        return new vscode.Hover(md);
      }

      const row = block.rows.find((candidate) => candidate.line === position.line);
      if (row) {
        const lineText = document.lineAt(position.line).text;
        const colIndex = resolveColumnIndex(lineText, position.character);
        const fieldName = block.fields[colIndex];
        if (fieldName !== undefined) {
          const md = new vscode.MarkdownString();
          md.appendMarkdown(
            `**Field:** \`${fieldName}\` (column ${colIndex + 1} of ${block.fields.length})`
          );
          return new vscode.Hover(md);
        }
      }
    }
    return undefined;
  }
}

function resolveColumnIndex(lineText: string, character: number): number {
  const prefix = lineText.slice(0, character);
  return (prefix.match(/,/g) ?? []).length;
}
