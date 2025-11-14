import * as vscode from 'vscode';

export const TOON_LANGUAGE_ID = 'toon';

export const TOON_DOCUMENT_SELECTOR: vscode.DocumentSelector = [
  { language: TOON_LANGUAGE_ID, scheme: 'file' },
  { language: TOON_LANGUAGE_ID, scheme: 'untitled' }
];

export function registerLanguageConfiguration(context: vscode.ExtensionContext): void {
  const disposable = vscode.languages.setLanguageConfiguration(TOON_LANGUAGE_ID, {
    comments: {
      lineComment: '#'
    },
    brackets: [
      ['{', '}'],
      ['[', ']']
    ],
    indentationRules: {
      decreaseIndentPattern: /^\s*\}/,
      increaseIndentPattern: /^.*{[^}]*$/
    }
  });

  context.subscriptions.push(disposable);
}
