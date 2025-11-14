import * as vscode from 'vscode';

export interface ToonRow {
  line: number;
  values: string[];
}

export interface ToonBlock {
  name: string;
  rowCountDeclared: number;
  fields: string[];
  headerLine: number;
  bodyStartLine: number;
  bodyEndLine: number;
  rows: ToonRow[];
}

export type ToonDiagnosticSeverity = 'error' | 'warning' | 'info';

export interface ToonDiagnostic {
  message: string;
  severity: ToonDiagnosticSeverity;
  range: vscode.Range;
}
