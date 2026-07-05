import { describe, expect, it } from 'vitest';
import deepKeys from './deepKeysUtils.js';

describe('deepKeys', () => {
  it('flattens nested object keys into dot-notation', () => {
    expect(deepKeys({ a: 1, b: { c: 2, d: { e: 3 } } })).toEqual(['a', 'b.c', 'b.d.e']);
  });

  it('treats arrays as leaf values', () => {
    expect(deepKeys({ list: [1, 2], name: 'x' })).toEqual(['list', 'name']);
  });

  it('returns an empty array for an empty object', () => {
    expect(deepKeys({})).toEqual([]);
  });
});
