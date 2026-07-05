import inquirer from 'inquirer';
import hookJsTemplate from '../templates/hook/hookJsTemplate.js';
import hookTestTestingLibraryTemplate from '../templates/hook/hookTestTestingLibraryTemplate.js';
import hookTestVitestTemplate from '../templates/hook/hookTestVitestTemplate.js';
import hookTsTemplate from '../templates/hook/hookTsTemplate.js';
import { WHITESPACE_REGEX } from '../utils/constants.js';
import { applyConvertors, buildConvertors } from '../utils/generateComponentUtils.js';
import { resolveOutputPath, writeFiles } from '../utils/generateFilesUtils.js';

const { prompt } = inquirer;

async function promptForHookNames() {
  const { names } = await prompt([
    {
      type: 'input',
      name: 'names',
      message: 'What is the name of your hook? (e.g. useToggle, separate multiple with spaces)',
      validate: value => (value && value.trim().length > 0) || 'Please enter at least one name.',
    },
  ]);

  return names.trim().split(WHITESPACE_REGEX);
}

export function buildHookFiles(hookName, cmd, cliConfigFile) {
  const { usesTypeScript, testLibrary } = cliConfigFile;
  const convertors = buildConvertors(hookName);
  const ext = usesTypeScript ? 'ts' : 'js';
  const basePath = cmd.path;
  const files = [];

  const hookFilename = `${hookName}.${ext}`;
  files.push({
    filename: hookFilename,
    filePath: resolveOutputPath({ basePath, folderName: hookName, filename: hookFilename, flat: cmd.flat }),
    content: applyConvertors(usesTypeScript ? hookTsTemplate : hookJsTemplate, convertors),
  });

  const withTest = cmd.withTest != null ? cmd.withTest.toString() === 'true' : testLibrary !== 'None';

  if (withTest && testLibrary !== 'None') {
    const testTemplate = testLibrary === 'Vitest' ? hookTestVitestTemplate : hookTestTestingLibraryTemplate;
    const testFilename = `${hookName}.test.${ext}`;
    files.push({
      filename: testFilename,
      filePath: resolveOutputPath({ basePath, folderName: hookName, filename: testFilename, flat: cmd.flat }),
      content: applyConvertors(testTemplate, convertors),
    });
  }

  return files;
}

export default function initGenerateHookCommand(args, cliConfigFile, program) {
  const hookConfig = (cliConfigFile.hook && cliConfigFile.hook.default) || {};

  const hookCommand = program
    .command('hook [names...]')
    .alias('h')
    .description('Generate a custom React hook (and its test).')
    .option('-p, --path <path>', 'The path where the hook will get generated in.', hookConfig.path || 'src/hooks')
    .option('-f, --flat', 'Generate the files in the path instead of creating a folder', hookConfig.flat || false)
    .option('--dry-run', 'Show what will be generated (with a preview) without writing to disk')
    .option('-y, --yes', 'Skip interactive prompts')
    .option('--withTest <withTest>', 'Generate a corresponding test file.', hookConfig.withTest);

  hookCommand.action(async (hookNames, cmd) => {
    let names = hookNames;

    if ((!names || names.length === 0) && !cmd.yes) {
      names = await promptForHookNames();
    }

    if (!names || names.length === 0) {
      return;
    }

    for (const hookName of names) {
      const files = buildHookFiles(hookName, cmd, cliConfigFile);
      await writeFiles(files, { dryRun: cmd.dryRun });
    }
  });
}
