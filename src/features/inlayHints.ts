import * as vscode from 'vscode';
import { parseToonBlocks } from '../parser/toonParser';

export class ToonInlayHintsProvider implements vscode.InlayHintsProvider {
  provideInlayHints(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.ProviderResult<vscode.InlayHint[]> {
    const config = vscode.workspace.getConfiguration('toon');
    if (!config.get<boolean>('inlayHints.enabled', true)) {
      return [];
    }

    const hints: vscode.InlayHint[] = [];
    const blocks = parseToonBlocks(document.getText());

    for (const block of blocks) {
      for (const row of block.rows) {
        if (row.line < range.start.line || row.line > range.end.line) {
          continue;
        }
        const lineText = document.lineAt(row.line).text;
        const valuesStart = lineText.search(/\S/);
        if (valuesStart < 0) {
          continue;
        }

        let charOffset = valuesStart;
        for (let index = 0; index < row.values.length; index += 1) {
          const fieldName = block.fields[index];
          if (fieldName) {
            const hint = new vscode.InlayHint(
              new vscode.Position(row.line, charOffset),
              `${fieldName}:`,
              vscode.InlayHintKind.Parameter
            );
            hint.paddingRight = true;
            hints.push(hint);
          }
          charOffset += row.values[index].length + 1;
        }
      }
    }

    return hints;
  }
}
