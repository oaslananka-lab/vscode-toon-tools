import * as vscode from 'vscode';
import { formatToonDocument } from '../../src/format/toonFormatter';
import { ToonFormattingProvider } from '../../src/format/toonFormatter';
import { __setConfiguration } from './vscodeMock';
import { createDocument } from './testUtils';

describe('formatToonDocument', () => {
  it('normalizes indentation to two spaces', () => {
    expect(formatToonDocument('users[1]{id,name}:\n    1, Alice')).toBe(
      'users[1]{id,name}:\n  1,Alice'
    );
  });

  it('preserves a blank line between blocks', () => {
    expect(formatToonDocument('a[1]{id}:\n  1\nb[1]{id}:\n  2')).toBe(
      'a[1]{id}:\n  1\n\nb[1]{id}:\n  2'
    );
  });

  it('trims trailing whitespace', () => {
    expect(formatToonDocument('users[1]{id}:\n  1   \n')).toBe('users[1]{id}:\n  1');
  });

  it('returns an empty document unchanged', () => {
    expect(formatToonDocument('')).toBe('');
  });

  it('no-ops when a single block is already formatted', () => {
    const source = 'users[1]{id,name}:\n  1,Alice';

    expect(formatToonDocument(source)).toBe(source);
  });

  it('uses provider configuration for four-space indentation and spaced fields', () => {
    __setConfiguration({
      'formatter.indentWidth': 4,
      'formatter.fieldSpacing': 'spaced',
    });
    const edits = new ToonFormattingProvider().provideDocumentFormattingEdits(
      createDocument('users[1]{id,name}:\n  1,Alice')
    );

    expect(edits[0]).toBeInstanceOf(vscode.TextEdit);
    expect(edits[0].newText).toBe('users[1]{id, name}:\n    1,Alice');
    __setConfiguration({});
  });

  it('preserves comments between blocks while trimming comment whitespace', () => {
    expect(formatToonDocument('users[0]{}:\n# note   \nroles[0]{}:')).toBe(
      'users[0]{}:\n# note\nroles[0]{}:'
    );
  });
});
