import { parseToonBlocks } from '../../src/parser/toonParser';

describe('parseToonBlocks', () => {
  it('parses a single block with correct row count', () => {
    const [block] = parseToonBlocks('users[2]{id,name}:\n  1,Alice\n  2,Bob');

    expect(block.name).toBe('users');
    expect(block.rowCountDeclared).toBe(2);
    expect(block.fields).toEqual(['id', 'name']);
    expect(block.rows).toHaveLength(2);
  });

  it('parses multiple blocks in sequence', () => {
    const blocks = parseToonBlocks('users[1]{id}:\n  1\nroles[1]{name}:\n  admin');

    expect(blocks.map((block) => block.name)).toEqual(['users', 'roles']);
  });

  it('parses a block with no rows', () => {
    const [block] = parseToonBlocks('empty[0]{}:');

    expect(block.rows).toEqual([]);
    expect(block.bodyStartLine).toBe(1);
    expect(block.bodyEndLine).toBe(0);
  });

  it('ignores commented lines', () => {
    const [block] = parseToonBlocks('# top\nusers[1]{id,name}:\n  # note\n  1,Alice');

    expect(block.rows).toHaveLength(1);
    expect(block.rows[0].values).toEqual(['1', 'Alice']);
  });

  it('handles CRLF line endings', () => {
    const [block] = parseToonBlocks('users[1]{id}\r\n  1'.replace('{id}', '{id}:'));

    expect(block.rows[0].line).toBe(1);
  });

  it('handles empty documents', () => {
    expect(parseToonBlocks('')).toEqual([]);
  });

  it('ignores malformed headers before any block', () => {
    expect(parseToonBlocks('users[one]{id}:\n  1')).toEqual([]);
  });

  it('assigns body start and end lines from parsed rows', () => {
    const [block] = parseToonBlocks('users[2]{id}:\n\n  1\n  2');

    expect(block.bodyStartLine).toBe(2);
    expect(block.bodyEndLine).toBe(3);
  });

  it('parses quoted values containing commas and escaped quotes', () => {
    const [block] = parseToonBlocks('users[1]{id,name}:\n  1,"Bob, ""The Builder"""');

    expect(block.rows[0].values).toEqual(['1', 'Bob, "The Builder"']);
  });
});
