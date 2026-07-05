import inquirer from 'inquirer';
import contextJsTemplate from '../templates/context/contextJsTemplate.js';
import contextTestTestingLibraryTemplate from '../templates/context/contextTestTestingLibraryTemplate.js';
import contextTestVitestTemplate from '../templates/context/contextTestVitestTemplate.js';
import contextTsTemplate from '../templates/context/contextTsTemplate.js';
import { WHITESPACE_REGEX } from '../utils/constants.js';
import { applyConvertors, buildConvertors } from '../utils/generateComponentUtils.js';
import { resolveOutputPath, writeFiles } from '../utils/generateFilesUtils.js';

const { prompt } = inquirer;
const USE_CLIENT_DIRECTIVE = '\'use client\';\n\n';

async function promptForContextNames() {
  const { names } = await prompt([
    {
      type: 'input',
      name: 'names',
      message: 'What is the name of your context? (e.g. Theme, separate multiple with spaces)',
      validate: value => (value && value.trim().length > 0) || 'Please enter at least one name.',
    },
  ]);

  return names.trim().split(WHITESPACE_REGEX);
}

function maybePrependUseClient(content, { client, framework }) {
  const wantsClient = client || framework === 'next';
  return wantsClient ? `${USE_CLIENT_DIRECTIVE}${content}` : content;
}

export function buildContextFiles(contextName, cmd, cliConfigFile) {
  const { usesTypeScript, testLibrary, framework } = cliConfigFile;
  const convertors = buildConvertors(contextName);
  const pascalName = convertors.TemplateName;
  const ext = usesTypeScript ? 'tsx' : 'jsx';
  const basePath = cmd.path;
  const folderName = `${pascalName}Context`;
  const files = [];

  const contextFilename = `${pascalName}Context.${ext}`;
  const contextContent = maybePrependUseClient(
    applyConvertors(usesTypeScript ? contextTsTemplate : contextJsTemplate, convertors),
    { client: cmd.client, framework },
  );

  files.push({
    filename: contextFilename,
    filePath: resolveOutputPath({ basePath, folderName, filename: contextFilename, flat: cmd.flat }),
    content: contextContent,
  });

  const withTest = cmd.withTest != null ? cmd.withTest.toString() === 'true' : testLibrary !== 'None';

  if (withTest && testLibrary !== 'None') {
    const testTemplate = testLibrary === 'Vitest' ? contextTestVitestTemplate : contextTestTestingLibraryTemplate;
    const testFilename = `${pascalName}Context.test.${ext}`;
    files.push({
      filename: testFilename,
      filePath: resolveOutputPath({ basePath, folderName, filename: testFilename, flat: cmd.flat }),
      content: applyConvertors(testTemplate, convertors),
    });
  }

  return files;
}

export default function initGenerateContextCommand(args, cliConfigFile, program) {
  const contextConfig = (cliConfigFile.context && cliConfigFile.context.default) || {};

  const contextCommand = program
    .command('context [names...]')
    .alias('ctx')
    .description('Generate a React context with a Provider and a typed consumer hook.')
    .option('-p, --path <path>', 'The path where the context will get generated in.', contextConfig.path || 'src/context')
    .option('-f, --flat', 'Generate the files in the path instead of creating a folder', contextConfig.flat || false)
    .option('--client', 'Prepend the "use client" directive (React Server Components / Next.js)', contextConfig.client || false)
    .option('--dry-run', 'Show what will be generated (with a preview) without writing to disk')
    .option('-y, --yes', 'Skip interactive prompts')
    .option('--withTest <withTest>', 'Generate a corresponding test file.', contextConfig.withTest);

  contextCommand.action(async (contextNames, cmd) => {
    let names = contextNames;

    if ((!names || names.length === 0) && !cmd.yes) {
      names = await promptForContextNames();
    }

    if (!names || names.length === 0) {
      return;
    }

    for (const contextName of names) {
      const files = buildContextFiles(contextName, cmd, cliConfigFile);
      await writeFiles(files, { dryRun: cmd.dryRun });
    }
  });
}
