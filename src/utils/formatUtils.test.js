import os from 'node:os';
import { describe, expect, it } from 'vitest';
import { formatContent, resetFormatCache } from './formatUtils.js';

describe('formatContent', () => {
  it('returns content unchanged when Prettier is not available', async () => {
    resetFormatCache();
    // Point at a directory with no local prettier install.
    const result = await formatContent('const x=1', 'a.js', os.tmpdir());
    expect(result).toBe('const x=1');
  });
});
