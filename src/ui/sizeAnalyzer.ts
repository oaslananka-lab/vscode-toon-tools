import * as vscode from 'vscode';
import { toonToJsonSimple } from '../convert/codec';

export async function openSizeAnalyzerCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active TOON document to analyze.');
    return;
  }

  try {
    const toonText = editor.document.getText();
    const toonLength = toonText.length;
    const toonLines = editor.document.lineCount;

    const jsonValue = toonToJsonSimple(toonText);
    const jsonString = JSON.stringify(jsonValue, null, 2);
    const jsonLength = jsonString.length;
    const jsonLines = jsonString.split(/\r?\n/).length;

    const savings = jsonLength > 0 ? 1 - toonLength / jsonLength : 0;
    const toonTokens = approximateTokens(toonLength);
    const jsonTokens = approximateTokens(jsonLength);

    const panel = vscode.window.createWebviewPanel(
      'toonSizeAnalyzer',
      'TOON Size Analyzer',
      vscode.ViewColumn.Beside,
      { enableScripts: false }
    );

    panel.webview.html = getHtml({
      toonLength,
      jsonLength,
      toonLines,
      jsonLines,
      savings,
      toonTokens,
      jsonTokens
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to analyze TOON document: ${message}`);
  }
}

function approximateTokens(chars: number): number {
  return Math.ceil(chars / 4);
}

interface AnalyzerStats {
  toonLength: number;
  jsonLength: number;
  toonLines: number;
  jsonLines: number;
  savings: number;
  toonTokens: number;
  jsonTokens: number;
}

function getHtml(stats: AnalyzerStats): string {
  const percent = (stats.savings * 100).toFixed(1);
  const nonce = createNonce();
  const comparison = stats.jsonLength > 0 ? `${percent}%` : 'n/a';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}';" />
<style nonce="${nonce}">
  body { font-family: Segoe UI, sans-serif; padding: 16px; line-height: 1.5; }
  h1 { font-size: 1.4rem; margin-bottom: 1rem; }
  table { border-collapse: collapse; width: 100%; max-width: 520px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
  .highlight { font-weight: 600; }
  .note { margin-top: 1rem; font-size: 0.9rem; color: #555; }
</style>
</head>
<body>
  <h1>TOON Size / Token Analysis</h1>
  <table>
    <tr><th>TOON length (chars)</th><td class="highlight">${stats.toonLength}</td></tr>
    <tr><th>JSON length (chars)</th><td>${stats.jsonLength}</td></tr>
    <tr><th>TOON lines</th><td>${stats.toonLines}</td></tr>
    <tr><th>JSON lines</th><td>${stats.jsonLines}</td></tr>
    <tr><th>Approx. TOON tokens</th><td>${stats.toonTokens}</td></tr>
    <tr><th>Approx. JSON tokens</th><td>${stats.jsonTokens}</td></tr>
    <tr><th>Estimated savings</th><td>${comparison}</td></tr>
  </table>
  <p class="note">Token counts use a simple chars/4 heuristic for a quick approximation.</p>
</body>
</html>`;
}

function createNonce(): string {
  return Math.random().toString(36).slice(2, 15);
}
