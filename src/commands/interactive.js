import inquirer from 'inquirer';
import { WHITESPACE_REGEX } from '../utils/constants.js';
import { generateComponent, getCorrespondingComponentFileTypes } from '../utils/generateComponentUtils.js';
import { writeFiles } from '../utils/generateFilesUtils.js';
import { blank, header } from '../utils/messagesUtils.js';
import { buildContextFiles } from './generateContext.js';
import { buildHookFiles } from './generateHook.js';

const { prompt } = inquirer;

async function runComponentFlow(cliConfigFile) {
  const componentTypes = Object.keys(cliConfigFile.component || { default: {} });

  const { name, type } = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Component name?',
      validate: value => (value && value.trim().length > 0) || 'Please enter a name.',
    },
    {
      type: 'select',
      name: 'type',
      message: 'Which component type?',
      choices: componentTypes,
      when: componentTypes.length > 1,
      default: 'default',
    },
  ]);

  const selectedType = type || 'default';
  const typeConfig = cliConfigFile.component[selectedType];
  const fileTypes = getCorrespondingComponentFileTypes(typeConfig);

  const { enabled } = await prompt([
    {
      type: 'checkbox',
      name: 'enabled',
      message: 'Which files should be included? (space to toggle)',
      choices: fileTypes.map(ft => ({ name: ft, value: ft, checked: typeConfig[ft] === true })),
    },
  ]);

  const cmd = {
    path: typeConfig.path,
    type: selectedType,
    flat: typeConfig.flat || false,
    dryRun: false,
  };

  fileTypes.forEach((ft) => {
    cmd[ft] = enabled.includes(ft);
  });

  for (const componentName of name.trim().split(WHITESPACE_REGEX)) {
    await generateComponent(componentName, cmd, cliConfigFile);
  }
}

async function runHookFlow(cliConfigFile) {
  const { name } = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Hook name? (e.g. useToggle)',
      validate: value => (value && value.trim().length > 0) || 'Please enter a name.',
    },
  ]);

  const cmd = { path: 'src/hooks', flat: false, dryRun: false };

  for (const hookName of name.trim().split(WHITESPACE_REGEX)) {
    await writeFiles(buildHookFiles(hookName, cmd, cliConfigFile), { dryRun: false });
  }
}

async function runContextFlow(cliConfigFile) {
  const { name, client } = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Context name? (e.g. Theme)',
      validate: value => (value && value.trim().length > 0) || 'Please enter a name.',
    },
    {
      type: 'confirm',
      name: 'client',
      message: 'Add the "use client" directive?',
      default: cliConfigFile.framework === 'next',
    },
  ]);

  const cmd = { path: 'src/context', flat: false, dryRun: false, client };

  for (const contextName of name.trim().split(WHITESPACE_REGEX)) {
    await writeFiles(buildContextFiles(contextName, cmd, cliConfigFile), { dryRun: false });
  }
}

/**
 * Bare interactive mode: shown when `casting` is run with no subcommand.
 *
 * @param {object} cliConfigFile - The loaded Casting config
 */
export async function runInteractive(cliConfigFile) {
  header('Casting', 'What would you like to generate?');

  const { kind } = await prompt([
    {
      type: 'select',
      name: 'kind',
      message: 'Pick a generator',
      choices: [
        { name: 'Component', value: 'component' },
        { name: 'Hook', value: 'hook' },
        { name: 'Context (Provider + hook)', value: 'context' },
      ],
    },
  ]);

  blank();

  if (kind === 'component') {
    await runComponentFlow(cliConfigFile);
  } else if (kind === 'hook') {
    await runHookFlow(cliConfigFile);
  } else if (kind === 'context') {
    await runContextFlow(cliConfigFile);
  }
}
