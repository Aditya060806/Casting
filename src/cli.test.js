import { describe, expect, it } from 'vitest';
import cli from './cli.js';

describe('cli', () => {
  it('should be defined.', () => {
    expect(cli).toBeDefined();
    expect(typeof cli).toBe('function');
  });
});
