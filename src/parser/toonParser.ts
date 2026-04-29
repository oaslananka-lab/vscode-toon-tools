import { ToonBlock, ToonRow } from './toonTypes';

const HEADER_REGEX = /^([A-Za-z_][A-Za-z0-9_]*)\[(\d+)\]\{([^}]*)\}:\s*$/;

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
    const trimmed = lineText.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

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
        rows: [],
      };
      return;
    }

    if (!currentBlock) {
      return;
    }

    const row: ToonRow = {
      line: lineNumber,
      values: parseToonValues(trimmed),
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

export function parseToonValues(source: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuote = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === '"') {
      if (inQuote && source[index + 1] === '"') {
        current += '"';
        index += 1;
        continue;
      }
      inQuote = !inQuote;
      continue;
    }

    if (char === ',' && !inQuote) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function tryParseHeader(lineText: string): HeaderParseResult | undefined {
  const match = HEADER_REGEX.exec(lineText.trim());
  if (!match) {
    return undefined;
  }

  const [, name, rowCount, fieldsSection] = match;
  return {
    name,
    rowCountDeclared: Number.parseInt(rowCount, 10),
    fields: splitFields(fieldsSection),
  };
}

function splitFields(source: string): string[] {
  return source
    .split(',')
    .map((field) => field.trim())
    .filter((field) => field.length > 0);
}
