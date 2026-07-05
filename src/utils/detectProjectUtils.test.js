import { describe, expect, it } from 'vitest';
import { inferProjectConfig } from './detectProjectUtils.js';

describe('inferProjectConfig', () => {
  it('detects a plain React + CSS project', () => {
    const result = inferProjectConfig({
      pkg: { dependencies: { react: '18.0.0' } },
      hasTsConfig: false,
    });

    expect(result).toMatchObject({
      usesTypeScript: false,
      usesStyledComponents: false,
      usesCssModule: true,
      cssPreprocessor: 'css',
      testLibrary: 'None',
      framework: 'react',
    });
  });

  it('detects TypeScript from tsconfig presence', () => {
    const result = inferProjectConfig({ pkg: {}, hasTsConfig: true });
    expect(result.usesTypeScript).toBe(true);
  });

  it('detects TypeScript from the typescript dependency', () => {
    const result = inferProjectConfig({
      pkg: { devDependencies: { typescript: '5.0.0' } },
      hasTsConfig: false,
    });
    expect(result.usesTypeScript).toBe(true);
  });

  it('detects styled-components and disables css modules', () => {
    const result = inferProjectConfig({
      pkg: { dependencies: { 'styled-components': '6.0.0' } },
    });
    expect(result.usesStyledComponents).toBe(true);
    expect(result.usesCssModule).toBe(false);
  });

  it('detects the scss preprocessor from sass', () => {
    const result = inferProjectConfig({ pkg: { devDependencies: { sass: '1.0.0' } } });
    expect(result.cssPreprocessor).toBe('scss');
  });

  it('detects less and stylus preprocessors', () => {
    expect(inferProjectConfig({ pkg: { devDependencies: { less: '4.0.0' } } }).cssPreprocessor).toBe('less');
    expect(inferProjectConfig({ pkg: { devDependencies: { stylus: '0.6.0' } } }).cssPreprocessor).toBe('styl');
  });

  it('prefers Vitest when both test libraries are present', () => {
    const result = inferProjectConfig({
      pkg: { devDependencies: { 'vitest': '2.0.0', '@testing-library/react': '14.0.0' } },
    });
    expect(result.testLibrary).toBe('Vitest');
  });

  it('detects Testing Library', () => {
    const result = inferProjectConfig({
      pkg: { devDependencies: { '@testing-library/react': '14.0.0' } },
    });
    expect(result.testLibrary).toBe('Testing Library');
  });

  it('detects Next.js and Vite frameworks', () => {
    expect(inferProjectConfig({ pkg: { dependencies: { next: '14.0.0' } } }).framework).toBe('next');
    expect(inferProjectConfig({ pkg: { devDependencies: { vite: '5.0.0' } } }).framework).toBe('vite');
  });

  it('handles a missing package.json gracefully', () => {
    const result = inferProjectConfig({ pkg: null, hasTsConfig: false });
    expect(result.testLibrary).toBe('None');
    expect(result.framework).toBe('react');
  });
});
