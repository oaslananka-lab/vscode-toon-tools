import { ToonBlock, ToonRow } from './toonTypes';

const HEADER_REGEX = /^(\w+)\[(\d+)\]\{([^}]*)\}:\s*$/;

interface HeaderParseResult {
  name: string;
  rowCountDeclared: number;
  fields: string[];
}

export function parseToonBlocks(text: string): ToonBlock[] {
  const lines = text.split(/\r?\n/);
  const blocks: ToonBlock[] = [];
  let currentBlock: ToonBlock | undefined;

  const pushCurrent = (): void => {
    if (currentBlock) {
      if (currentBlock.bodyStartLine === -1) {
        currentBlock.bodyStartLine = currentBlock.headerLine + 1;
      }
      if (currentBlock.bodyEndLine === -1) {
        currentBlock.bodyEndLine = currentBlock.headerLine;
      }
      blocks.push(currentBlock);
      currentBlock = undefined;
    }
  };

  lines.forEach((lineText, lineNumber) => {
    const header = tryParseHeader(lineText);
    if (header) {
      pushCurrent();
      currentBlock = {
        name: header.name,
        rowCountDeclared: header.rowCountDeclared,
        fields: header.fields,
        headerLine: lineNumber,
        bodyStartLine: -1,
        bodyEndLine: -1,
        rows: []
      };
      return;
    }

    if (!currentBlock) {
      return;
    }

    const trimmed = lineText.trim();
    if (!trimmed) {
      return;
    }

    const values = trimmed.split(',').map((value) => value.trim());
    const row: ToonRow = {
      line: lineNumber,
      values
    };
    currentBlock.rows.push(row);
    if (currentBlock.bodyStartLine === -1) {
      currentBlock.bodyStartLine = lineNumber;
    }
    currentBlock.bodyEndLine = lineNumber;
  });

  pushCurrent();
  return blocks;
}

function tryParseHeader(lineText: string): HeaderParseResult | undefined {
  const match = HEADER_REGEX.exec(lineText.trim());
  if (!match) {
    return undefined;
  }

  const [, name, rowCount, fieldsSection] = match;
  const fields = splitFields(fieldsSection);
  return {
    name,
    rowCountDeclared: Number.parseInt(rowCount, 10),
    fields
  };
}

function splitFields(source: string): string[] {
  return source
    .split(',')
    .map((field) => field.trim())
    .filter((field) => field.length > 0);
}
