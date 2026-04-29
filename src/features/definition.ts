import * as vscode from 'vscode';
import { parseToonBlocks } from '../parser/toonParser';

export class ToonDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Definition> {
    const blocks = parseToonBlocks(document.getText());
    for (const block of blocks) {
      const row = block.rows.find((candidate) => candidate.line === position.line);
      if (!row) {
        continue;
      }

      return new vscode.Location(
        document.uri,
        new vscode.Range(
          block.headerLine,
          0,
          block.headerLine,
          document.lineAt(block.headerLine).text.length
        )
      );
    }
    return undefined;
  }
}
