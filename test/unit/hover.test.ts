import * as vscode from 'vscode';
import { ToonHoverProvider } from '../../src/features/hover';
import { createDocument } from './testUtils';

describe('ToonHoverProvider', () => {
  it('returns block metadata markdown on a header line', () => {
    const document = createDocument('users[1]{id,name}:\n  1,Alice');
    const hover = new ToonHoverProvider().provideHover(document, new vscode.Position(0, 2));

    expect(markdownValue(hover)).toContain('**Block:** `users`');
  });

  it('returns field name markdown on a data row', () => {
    const document = createDocument('users[1]{id,name}:\n  1,Alice');
    const hover = new ToonHoverProvider().provideHover(document, new vscode.Position(1, 5));

    expect(markdownValue(hover)).toContain('**Field:** `name`');
  });

  it('returns undefined on non-TOON context', () => {
    const document = createDocument('# just a comment');

    expect(
      new ToonHoverProvider().provideHover(document, new vscode.Position(0, 0))
    ).toBeUndefined();
  });
});

function markdownValue(hover: vscode.ProviderResult<vscode.Hover>): string {
  const contents = (hover as vscode.Hover).contents as unknown as vscode.MarkdownString;
  return contents.value;
}
