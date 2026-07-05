import { describe, expect, it } from 'vitest';
import { buildConfigFromDetected, buildConfigQuestions } from './castingConfigUtils.js';
import { SCHEMA_URL } from './constants.js';

describe('buildConfigFromDetected', () => {
  it('builds a config with schema and component defaults', () => {
    const config = buildConfigFromDetected({
      usesTypeScript: true,
      usesStyledComponents: false,
      usesCssModule: true,
      cssPreprocessor: 'scss',
      testLibrary: 'Vitest',
    });

    expect(config.$schema).toBe(SCHEMA_URL);
    expect(config.usesTypeScript).toBe(true);
    expect(config.usesCssModule).toBe(true);
    expect(config.cssPreprocessor).toBe('scss');
    expect(config.testLibrary).toBe('Vitest');
    expect(config.component.default.path).toBe('src/components');
  });

  it('omits css options when using styled-components', () => {
    const config = buildConfigFromDetected({
      usesStyledComponents: true,
      cssPreprocessor: 'scss',
    });

    expect(config.usesStyledComponents).toBe(true);
    expect(config.usesCssModule).toBeUndefined();
    expect(config.cssPreprocessor).toBeUndefined();
  });
});

describe('buildConfigQuestions', () => {
  it('seeds prompt defaults from detected values', () => {
    const questions = buildConfigQuestions({
      usesTypeScript: true,
      usesStyledComponents: false,
      usesCssModule: true,
      cssPreprocessor: 'less',
      testLibrary: 'Vitest',
    });

    const byName = Object.fromEntries(questions.map(q => [q.name, q]));

    expect(byName.usesTypeScript.default).toBe(true);
    expect(byName.cssPreprocessor.default).toBe('less');
    expect(byName.testLibrary.default).toBe('Vitest');
  });
});
