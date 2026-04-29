import * as vscode from 'vscode';
import { mapSeverity, registerToonLinter, validateToonBlocks } from '../../src/lint/toonLinter';
import { parseToonBlocks } from '../../src/parser/toonParser';
import { createDocument } from './testUtils';
import { __events, __setConfiguration } from './vscodeMock';

describe('validateToonBlocks', () => {
  it('reports row count mismatch as an error diagnostic', () => {
    const document = createDocument('users[2]{id}:\n  1');
    const diagnostics = validateToonBlocks(parseToonBlocks(document.getText()), document);

    expect(diagnostics[0].message).toContain('Row count mismatch');
    expect(diagnostics[0].severity).toBe('error');
  });

  it('reports duplicate field names as a warning diagnostic', () => {
    const document = createDocument('users[0]{id,ID}:');
    const diagnostics = validateToonBlocks(parseToonBlocks(document.getText()), document);

    expect(diagnostics[0].message).toContain('Duplicate field names');
    expect(diagnostics[0].severity).toBe('warning');
  });

  it('reports wrong value count per row as an error diagnostic', () => {
    const document = createDocument('users[1]{id,name}:\n  1');
    const diagnostics = validateToonBlocks(parseToonBlocks(document.getText()), document);

    expect(
      diagnostics.some((diagnostic) => diagnostic.message === 'Expected 2 values, found 1.')
    ).toBe(true);
  });

  it('returns zero diagnostics for a valid document', () => {
    const document = createDocument('users[1]{id,name}:\n  1,Alice');

    expect(validateToonBlocks(parseToonBlocks(document.getText()), document)).toEqual([]);
  });

  it('maps all severity levels', () => {
    expect(mapSeverity('error')).toBe(vscode.DiagnosticSeverity.Error);
    expect(mapSeverity('warning')).toBe(vscode.DiagnosticSeverity.Warning);
    expect(mapSeverity('info')).toBe(vscode.DiagnosticSeverity.Information);
  });

  it('registers linter events and schedules initial TOON documents', () => {
    jest.useFakeTimers();
    __setConfiguration({ 'linter.debounceMs': 0 });
    const document = createDocument('users[2]{id}:\n  1');
    const workspaceMock = vscode.workspace as unknown as { textDocuments: vscode.TextDocument[] };
    workspaceMock.textDocuments = [document];
    const collection = {
      set: jest.fn(),
      delete: jest.fn(),
      dispose: jest.fn(),
    } as unknown as vscode.DiagnosticCollection;
    const context = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    registerToonLinter(collection, context);
    jest.runOnlyPendingTimers();

    expect(collection.set).toHaveBeenCalled();
    expect(context.subscriptions.length).toBeGreaterThanOrEqual(3);
    workspaceMock.textDocuments = [];
    __setConfiguration({});
    jest.useRealTimers();
  });

  it('skips non-TOON documents', () => {
    const document = createDocument('{"ok":true}', 'json');
    const workspaceMock = vscode.workspace as unknown as { textDocuments: vscode.TextDocument[] };
    workspaceMock.textDocuments = [document];
    const collection = {
      set: jest.fn(),
      delete: jest.fn(),
      dispose: jest.fn(),
    } as unknown as vscode.DiagnosticCollection;

    registerToonLinter(collection, {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);

    expect(collection.set).not.toHaveBeenCalled();
    expect(collection.delete).not.toHaveBeenCalled();
    workspaceMock.textDocuments = [];
  });

  it('clears pending timers and diagnostics when a TOON document closes', () => {
    jest.useFakeTimers();
    __setConfiguration({ 'linter.debounceMs': 20 });
    const document = createDocument('users[2]{id}:\n  1');
    const workspaceMock = vscode.workspace as unknown as { textDocuments: vscode.TextDocument[] };
    workspaceMock.textDocuments = [];
    const collection = {
      set: jest.fn(),
      delete: jest.fn(),
      dispose: jest.fn(),
    } as unknown as vscode.DiagnosticCollection;

    registerToonLinter(collection, {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);
    __events.change?.({ document });
    __events.close?.(document);
    jest.runOnlyPendingTimers();

    expect(collection.set).not.toHaveBeenCalled();
    expect(collection.delete).toHaveBeenCalledWith(document.uri);
    __setConfiguration({});
    jest.useRealTimers();
  });

  it('clears a prior pending lint when a second change arrives', () => {
    jest.useFakeTimers();
    __setConfiguration({ 'linter.debounceMs': 20 });
    const document = createDocument('users[1]{id}:\n  1');
    const collection = {
      set: jest.fn(),
      delete: jest.fn(),
      dispose: jest.fn(),
    } as unknown as vscode.DiagnosticCollection;

    registerToonLinter(collection, {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);
    __events.change?.({ document });
    __events.change?.({ document });
    jest.runOnlyPendingTimers();

    expect(collection.set).toHaveBeenCalledTimes(1);
    __setConfiguration({});
    jest.useRealTimers();
  });

  it('surfaces parser failures as linter errors', () => {
    jest.useFakeTimers();
    const badDocument = {
      ...createDocument('users[1]{id}:\n  1'),
      getText: () => {
        throw new Error('read failed');
      },
    } as vscode.TextDocument;
    const collection = {
      set: jest.fn(),
      delete: jest.fn(),
      dispose: jest.fn(),
    } as unknown as vscode.DiagnosticCollection;

    registerToonLinter(collection, {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);
    __events.change?.({ document: badDocument });
    jest.runOnlyPendingTimers();

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('TOON linter failed: read failed');
    jest.useRealTimers();
  });

  it('clears diagnostics when linting is disabled', () => {
    __setConfiguration({ 'linter.enabled': false });
    const document = createDocument('users[1]{id}:\n  1');
    const workspaceMock = vscode.workspace as unknown as { textDocuments: vscode.TextDocument[] };
    workspaceMock.textDocuments = [document];
    const collection = {
      set: jest.fn(),
      delete: jest.fn(),
      dispose: jest.fn(),
    } as unknown as vscode.DiagnosticCollection;

    registerToonLinter(collection, {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext);

    expect(collection.delete).toHaveBeenCalledWith(document.uri);
    workspaceMock.textDocuments = [];
    __setConfiguration({});
  });
});
