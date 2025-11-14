import { parseToonBlocks } from '../parser/toonParser';
import { ToonBlock } from '../parser/toonTypes';

interface JsonBlock {
  name: string;
  rows: Record<string, unknown>[];
}

export function jsonToToonSimple(input: unknown, defaultBlockName = 'data'): string {
  const blocks = normalizeJsonToBlocks(input, defaultBlockName);
  if (blocks.length === 0) {
    throw new Error('Nothing to convert to TOON.');
  }
  return blocks.map(renderBlock).join('\n\n');
}

export function toonToJsonSimple(text: string): Record<string, unknown> {
  const blocks = parseToonBlocks(text);
  return blocksToJsonObject(blocks);
}

export function blocksToJsonObject(blocks: ToonBlock[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const block of blocks) {
    result[block.name] = block.rows.map((row) => {
      const obj: Record<string, string | null> = {};
      block.fields.forEach((field, index) => {
        obj[field] = row.values[index] ?? null;
      });
      return obj;
    });
  }
  return result;
}

function normalizeJsonToBlocks(input: unknown, defaultName: string): JsonBlock[] {
  if (Array.isArray(input)) {
    return [
      {
        name: defaultName,
        rows: ensureRowsOfObjects(input, 'root array')
      }
    ];
  }

  if (isPlainObject(input)) {
    const entries = Object.entries(input as Record<string, unknown>);
    const blocks: JsonBlock[] = entries
      .filter(([, value]) => Array.isArray(value))
      .map(([name, value]) => ({ name, rows: ensureRowsOfObjects(value as unknown[], name) }));

    if (blocks.length > 0) {
      return blocks;
    }

    const firstArrayEntry = entries.find(([, value]) => Array.isArray(value));
    if (firstArrayEntry) {
      const [name, value] = firstArrayEntry;
      return [{ name, rows: ensureRowsOfObjects(value as unknown[], name) }];
    }
  }

  throw new Error('JSON root must be an array or an object containing arrays of objects.');
}

function ensureRowsOfObjects(value: unknown[], path: string): Record<string, unknown>[] {
  return value.map((item, index) => {
    if (!isPlainObject(item)) {
      throw new Error(`Element at ${path}[${index}] is not an object.`);
    }
    return item as Record<string, unknown>;
  });
}

function renderBlock(block: JsonBlock): string {
  const fields = collectFields(block.rows);
  const header = `${block.name}[${block.rows.length}]{${fields.join(',')}}:`;
  if (block.rows.length === 0) {
    return header;
  }

  const rows = block.rows.map((row) => {
    const values = fields.map((field) => formatValue(row[field]));
    return `  ${values.join(',')}`;
  });
  return `${header}\n${rows.join('\n')}`;
}

function collectFields(rows: Record<string, unknown>[]): string[] {
  if (rows.length === 0) {
    return [];
  }
  const ordered = Object.keys(rows[0]);
  const seen = new Set(ordered);
  rows.slice(1).forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key);
        ordered.push(key);
      }
    });
  });
  return ordered;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value).replace(/\r?\n/g, ' ');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
