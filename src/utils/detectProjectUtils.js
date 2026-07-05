import path from 'node:path';
import fsExtra from 'fs-extra';

const { existsSync, readFileSync } = fsExtra;

/**
 * Read and parse the project's package.json.
 *
 * @param {string} [cwd] - Directory to read from
 * @returns {object | null} Parsed package.json, or null if missing/invalid
 */
export function readPackageJson(cwd = process.cwd()) {
  try {
    return JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Infer Casting config values from project signals.
 *
 * Pure function so it can be unit tested without touching the filesystem.
 *
 * @param {object} signals
 * @param {object | null} [signals.pkg] - Parsed package.json
 * @param {boolean} [signals.hasTsConfig] - Whether a tsconfig.json exists
 * @returns {{
 *   usesTypeScript: boolean,
 *   usesStyledComponents: boolean,
 *   usesCssModule: boolean,
 *   cssPreprocessor: string,
 *   testLibrary: string,
 *   framework: string,
 * }} The inferred Casting config values.
 */
export function inferProjectConfig({ pkg, hasTsConfig = false } = {}) {
  const deps = {
    ...(pkg && pkg.dependencies),
    ...(pkg && pkg.devDependencies),
  };

  const has = name => Object.hasOwn(deps, name);

  const usesTypeScript = Boolean(hasTsConfig || has('typescript'));
  const usesStyledComponents = has('styled-components');

  let cssPreprocessor = 'css';
  if (has('sass') || has('node-sass')) {
    cssPreprocessor = 'scss';
  } else if (has('less')) {
    cssPreprocessor = 'less';
  } else if (has('stylus')) {
    cssPreprocessor = 'styl';
  }

  let testLibrary = 'None';
  if (has('vitest')) {
    testLibrary = 'Vitest';
  } else if (has('@testing-library/react')) {
    testLibrary = 'Testing Library';
  }

  let framework = 'react';
  if (has('next')) {
    framework = 'next';
  } else if (has('vite')) {
    framework = 'vite';
  }

  return {
    usesTypeScript,
    usesStyledComponents,
    usesCssModule: !usesStyledComponents,
    cssPreprocessor,
    testLibrary,
    framework,
  };
}

/**
 * Detect the project's Casting config by reading files from disk.
 *
 * @param {string} [cwd] - Project root directory
 * @returns {ReturnType<typeof inferProjectConfig>} The inferred Casting config values.
 */
export function detectProjectConfig(cwd = process.cwd()) {
  const pkg = readPackageJson(cwd);
  const hasTsConfig
    = existsSync(path.join(cwd, 'tsconfig.json'))
      || existsSync(path.join(cwd, 'tsconfig.base.json'));

  return inferProjectConfig({ pkg, hasTsConfig });
}
