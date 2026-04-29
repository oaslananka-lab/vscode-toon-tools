import * as assert from 'assert';
import * as vscode from 'vscode';

suite('TOON Tools Extension', () => {
  test('activates without error', async () => {
    const extension = vscode.extensions.getExtension('oaslananka.vscode-toon-tools');
    assert.ok(extension);
    await extension.activate();
    assert.ok(extension.isActive);
  });

  test('registers conversion command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('toon.convertToonToJson'));
  });

  test('formats a sample TOON document', async () => {
    const document = await vscode.workspace.openTextDocument({
      language: 'toon',
      content: 'users[1]{id,name}:\n    1, Alice',
    });
    const edits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
      'vscode.executeFormatDocumentProvider',
      document.uri
    );

    assert.ok(edits);
    assert.strictEqual(edits[0].newText, 'users[1]{id,name}:\n  1,Alice');
  });
});
