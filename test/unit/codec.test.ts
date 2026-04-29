import {
  blocksToJsonObject,
  jsonToToonSimple,
  toonBlockToCsv,
  toonToJsonSimple,
} from '../../src/convert/codec';

describe('codec', () => {
  it('converts an array of objects to a TOON block', () => {
    const toon = jsonToToonSimple([{ id: 1, name: 'Alice' }]);

    expect(toon).toBe('data[1]{id,name}:\n  1,Alice');
  });

  it('converts an object of arrays to multiple blocks', () => {
    const toon = jsonToToonSimple({
      users: [{ id: 1 }],
      roles: [{ name: 'admin' }],
    });

    expect(toon).toContain('users[1]{id}:');
    expect(toon).toContain('roles[1]{name}:');
  });

  it('roundtrips TOON to JSON object keys', () => {
    const json = toonToJsonSimple('users[1]{id,name}:\n  1,Alice');

    expect(Object.keys(json)).toEqual(['users']);
    expect(json.users).toEqual([{ id: '1', name: 'Alice' }]);
  });

  it('exports CSV with escaped comma values', () => {
    const csv = toonBlockToCsv('users[1]{id,name}:\n  1,"Bob, Jr."', 'users');

    expect(csv).toBe('id,name\n1,"Bob, Jr."');
  });

  it('returns null when exporting an unknown block', () => {
    expect(toonBlockToCsv('users[0]{}:', 'missing')).toBeNull();
  });

  it('throws on non-array and non-object roots', () => {
    expect(() => jsonToToonSimple('bad')).toThrow('JSON root must be an array');
  });

  it('throws when an array item is not an object', () => {
    expect(() => jsonToToonSimple([1])).toThrow('Element at root array[0] is not an object.');
  });

  it('renders empty arrays as empty TOON blocks', () => {
    expect(jsonToToonSimple({ items: [] })).toBe('items[0]{}:');
  });

  it('collects fields from later rows and renders null values as empty cells', () => {
    const toon = jsonToToonSimple([
      { id: 1, name: null },
      { id: 2, role: 'admin', meta: { active: true } },
    ]);

    expect(toon).toContain('data[2]{id,name,role,meta}:');
    expect(toon).toContain('  1,,,');
    expect(toon).toContain('"{"');
  });

  it('fills missing trailing row values as null when converting parsed blocks', () => {
    const json = blocksToJsonObject([
      {
        name: 'users',
        rowCountDeclared: 1,
        fields: ['id', 'name'],
        headerLine: 0,
        bodyStartLine: 1,
        bodyEndLine: 1,
        rows: [{ line: 1, values: ['1'] }],
      },
    ]);

    expect(json.users).toEqual([{ id: '1', name: null }]);
  });

  it('quotes comma-containing JSON values for parser-safe roundtrip', () => {
    const toon = jsonToToonSimple([{ id: 1, name: 'Bob, Jr.' }]);
    const json = toonToJsonSimple(toon);

    expect(json.data).toEqual([{ id: '1', name: 'Bob, Jr.' }]);
  });
});
