import path from 'node:path';
import fsExtra from 'fs-extra';
import { formatContent } from './formatUtils.js';
import { error, fileSummary } from './messagesUtils.js';

const { existsSync, outputFileSync } = fsExtra;

/**
 * Write a set of generated files to disk (or preview them in dry-run mode),
 * formatting each with the project's Prettier when available, then print a summary.
 *
 * @param {Array<{ filename: string, filePath: string, content: string }>} files
 * @param {{ dryRun?: boolean }} [options]
 * @returns {Promise<Array<object>>} The per-file results.
 */
export async function writeFiles(files, { dryRun = false } = {}) {
  const generatedFiles = [];
  let basePath = '';

  for (const file of files) {
    const { filename, filePath } = file;
    let content = file.content;

    if (!basePath) {
      basePath = path.dirname(filePath);
    }

    if (existsSync(filePath)) {
      generatedFiles.push({ filename, status: 'skipped', path: filePath, content });
      continue;
    }

    try {
      if (!dryRun) {
        content = await formatContent(content, filePath);
        outputFileSync(filePath, content);
      }

      generatedFiles.push({ filename, status: 'created', path: filePath, content });
    } catch (err) {
      generatedFiles.push({ filename, status: 'failed', path: filePath });
      error(`Failed to create ${filename}`, {
        details: err.message,
        suggestions: [
          'Check that you have write permissions to the target directory',
          'Verify the path is valid',
        ],
      });
    }
  }

  fileSummary(generatedFiles, basePath, { dryRun });

  return generatedFiles;
}

/**
 * Compute the output path for a generated file, honoring the --flat option.
 *
 * @param {{ basePath: string, folderName: string, filename: string, flat?: boolean }} args
 * @returns {string} The resolved output path.
 */
export function resolveOutputPath({ basePath, folderName, filename, flat = false }) {
  return flat
    ? path.posix.join(basePath, filename)
    : path.posix.join(basePath, folderName, filename);
}
