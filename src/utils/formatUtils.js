import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let prettierPromise;

/**
 * Try to load the target project's local Prettier install.
 * Cached after first resolution. Returns null if Prettier isn't available.
 *
 * @param {string} cwd - Project root
 * @returns {Promise<object | null>} The Prettier module, or null when unavailable.
 */
async function loadPrettier(cwd) {
  if (prettierPromise !== undefined) {
    return prettierPromise;
  }

  prettierPromise = (async () => {
    try {
      const require = createRequire(pathToFileURL(path.join(cwd, 'package.json')).href);
      const prettierEntry = require.resolve('prettier');
      const mod = await import(pathToFileURL(prettierEntry).href);
      return mod.default ?? mod;
    } catch {
      return null;
    }
  })();

  return prettierPromise;
}

// Test helper: reset the cached Prettier lookup.
export function resetFormatCache() {
  prettierPromise = undefined;
}

/**
 * Format file content using the project's Prettier (if installed).
 * Always safe: on any failure it returns the original content unchanged.
 *
 * @param {string} content - The content to format
 * @param {string} filePath - Target path (used to infer parser + resolve config)
 * @param {string} [cwd] - Project root
 * @returns {Promise<string>} The formatted content (or the original on failure).
 */
export async function formatContent(content, filePath, cwd = process.cwd()) {
  const prettier = await loadPrettier(cwd);
  if (!prettier) {
    return content;
  }

  try {
    const config = (await prettier.resolveConfig(filePath)) || {};
    return await prettier.format(content, { ...config, filepath: filePath });
  } catch {
    return content;
  }
}
