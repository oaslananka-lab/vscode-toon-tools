import * as vscode from 'vscode';
import { ToonFormattingProvider } from './format/toonFormatter';
import { registerToonLinter } from './lint/toonLinter';
import { ToonCompletionProvider } from './features/completion';
import { ToonFoldingProvider } from './features/folding';
import { ToonSymbolProvider } from './features/symbols';
import { convertJsonToToonCommand } from './convert/jsonToToon';
import { convertToonToJsonCommand } from './convert/toonToJson';
import { openJsonPreviewCommand, openToonPreviewCommand } from './convert/preview';
import { openTableViewerCommand } from './ui/tableViewer';
import { openSizeAnalyzerCommand } from './ui/sizeAnalyzer';
import { TOON_LANGUAGE_ID, registerLanguageConfiguration } from './language/toonLanguage';

export function activate(context: vscode.ExtensionContext): void {
  registerLanguageConfiguration(context);

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(TOON_LANGUAGE_ID, new ToonFormattingProvider())
  );

  const diagnosticCollection = vscode.languages.createDiagnosticCollection(TOON_LANGUAGE_ID);
  context.subscriptions.push(diagnosticCollection);
  registerToonLinter(diagnosticCollection, context);

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      TOON_LANGUAGE_ID,
      new ToonCompletionProvider(),
      ',',
      ' '
    ),
    vscode.languages.registerFoldingRangeProvider(TOON_LANGUAGE_ID, new ToonFoldingProvider()),
    vscode.languages.registerDocumentSymbolProvider(TOON_LANGUAGE_ID, new ToonSymbolProvider())
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('toon.convertJsonToToon', convertJsonToToonCommand),
    vscode.commands.registerCommand('toon.convertToonToJson', convertToonToJsonCommand),
    vscode.commands.registerCommand('toon.openJsonPreview', openJsonPreviewCommand),
    vscode.commands.registerCommand('toon.openToonPreview', openToonPreviewCommand),
    vscode.commands.registerCommand('toon.openTableViewer', openTableViewerCommand),
    vscode.commands.registerCommand('toon.analyzeSizeTokens', openSizeAnalyzerCommand)
  );
}

export function deactivate(): void {
  // No-op: VS Code disposes of subscriptions automatically.
}
