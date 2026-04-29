import * as vscode from 'vscode';
import { toonBlockToCsv } from '../convert/codec';
import { parseToonBlocks } from '../parser/toonParser';
import { generateNonce } from '../utils/nonce';

interface TableMessage {
  command?: string;
  blockName?: string;
}

export async function openTableViewerCommand(context: vscode.ExtensionContext): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active TOON document to view.');
    return;
  }

  try {
    const sourceText = editor.document.getText();
    const blocks = parseToonBlocks(sourceText);
    if (blocks.length === 0) {
      vscode.window.showInformationMessage('No TOON blocks found to display.');
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'toonTableViewer',
      'TOON Table Viewer',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')],
      }
    );

    panel.webview.html = getWebviewHtml(panel.webview, context, blocks);
    context.subscriptions.push(
      panel.webview.onDidReceiveMessage(async (message: TableMessage) => {
        if (message.command !== 'exportCsv' || !message.blockName) {
          return;
        }

        const csv = toonBlockToCsv(sourceText, message.blockName);
        if (!csv) {
          vscode.window.showErrorMessage(`Block '${message.blockName}' not found.`);
          return;
        }

        const uri = await vscode.window.showSaveDialog({
          filters: { CSV: ['csv'] },
          defaultUri: vscode.Uri.file(`${message.blockName}.csv`),
        });
        if (!uri) {
          return;
        }

        await vscode.workspace.fs.writeFile(uri, Buffer.from(csv, 'utf-8'));
        vscode.window.showInformationMessage(`Exported '${message.blockName}' to ${uri.fsPath}`);
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to open TOON Table Viewer: ${message}`);
  }
}

function getWebviewHtml(
  webview: vscode.Webview,
  context: vscode.ExtensionContext,
  blocks: ReturnType<typeof parseToonBlocks>
): string {
  const payload = blocks.map((block) => ({
    name: block.name,
    declaredRows: block.rowCountDeclared,
    fields: block.fields,
    rows: block.rows.map((row) => row.values),
  }));
  const data = JSON.stringify(payload).replace(/</g, '\\u003c');
  const nonce = generateNonce();
  const resetUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'media', 'reset.css')
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'media', 'tableViewer.css')
  );
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'media', 'tableViewer.js')
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}' ${webview.cspSource};" />
<link rel="stylesheet" href="${resetUri}" />
<link rel="stylesheet" href="${styleUri}" />
<title>TOON Table Viewer</title>
</head>
<body>
  <main class="toon-shell">
    <section class="toon-toolbar" aria-label="Table controls">
      <label class="toon-control">
        <span>Block</span>
        <select id="blockSelect" class="toon-select"></select>
      </label>
      <label class="toon-control toon-control-grow">
        <span>Filter</span>
        <input id="filter" class="toon-filter" type="search" placeholder="Filter rows" />
      </label>
      <button id="exportCsv" class="toon-btn" type="button">Export CSV</button>
    </section>
    <section id="summary" class="toon-summary" aria-live="polite"></section>
    <section id="table" class="toon-table-wrap" aria-live="polite"></section>
  </main>
  <script nonce="${nonce}">window.__TOON_TABLE_DATA__ = ${data};</script>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
