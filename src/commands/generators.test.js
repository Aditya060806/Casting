import { describe, expect, it } from 'vitest';
import { buildContextFiles } from './generateContext.js';
import { buildHookFiles } from './generateHook.js';

describe('buildHookFiles', () => {
  it('generates a TypeScript hook and a Vitest test in a folder', () => {
    const files = buildHookFiles(
      'useToggle',
      { path: 'src/hooks', flat: false },
      { usesTypeScript: true, testLibrary: 'Vitest' },
    );

    const byName = Object.fromEntries(files.map(f => [f.filename, f]));

    expect(byName['useToggle.ts'].filePath).toBe('src/hooks/useToggle/useToggle.ts');
    expect(byName['useToggle.ts'].content).toContain('export function useToggle()');
    expect(byName['useToggle.test.ts'].content).toContain('from \'vitest\'');
  });

  it('respects the flat option and skips tests when testLibrary is None', () => {
    const files = buildHookFiles(
      'useCounter',
      { path: 'src/hooks', flat: true },
      { usesTypeScript: false, testLibrary: 'None' },
    );

    expect(files).toHaveLength(1);
    expect(files[0].filePath).toBe('src/hooks/useCounter.js');
  });
});

describe('buildContextFiles', () => {
  it('generates a Provider + hook and prepends "use client" for Next.js', () => {
    const files = buildContextFiles(
      'Theme',
      { path: 'src/context', flat: false },
      { usesTypeScript: true, testLibrary: 'Testing Library', framework: 'next' },
    );

    const byName = Object.fromEntries(files.map(f => [f.filename, f]));
    const contextFile = byName['ThemeContext.tsx'];

    expect(contextFile.filePath).toBe('src/context/ThemeContext/ThemeContext.tsx');
    expect(contextFile.content.startsWith('\'use client\';')).toBe(true);
    expect(contextFile.content).toContain('export function ThemeProvider');
    expect(contextFile.content).toContain('export function useTheme');
    expect(byName['ThemeContext.test.tsx']).toBeDefined();
  });

  it('omits the directive when not requested', () => {
    const files = buildContextFiles(
      'Auth',
      { path: 'src/context', flat: false, client: false },
      { usesTypeScript: false, testLibrary: 'None', framework: 'react' },
    );

    expect(files[0].content.startsWith('\'use client\'')).toBe(false);
    expect(files).toHaveLength(1);
  });
});
