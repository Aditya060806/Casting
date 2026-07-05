import inquirer from 'inquirer';
import { WHITESPACE_REGEX } from '../utils/constants.js';
import {
  generateComponent,
  getComponentByType,
  getCorrespondingComponentFileTypes,
} from '../utils/generateComponentUtils.js';

const { prompt } = inquirer;

// Prompt for one or more component names when none are passed on the CLI.
async function promptForComponentNames() {
  const { names } = await prompt([
    {
      type: 'input',
      name: 'names',
      message: 'What is the name of your component? (separate multiple with spaces)',
      validate: value => (value && value.trim().length > 0) || 'Please enter at least one name.',
    },
  ]);

  return names.trim().split(WHITESPACE_REGEX);
}

export default function initGenerateComponentCommand(args, cliConfigFile, program) {
  const selectedComponentType = getComponentByType(args, cliConfigFile);

  const componentCommand = program
    .command('component [names...]')
    .alias('c')
    .description('Generate a React component with its corresponding files.')

  // Static component command option defaults.

    .option('-p, --path <path>', 'The path where the component will get generated in.', selectedComponentType.path)
    .option(
      '--type <type>',
      'You can pass a component type that you have configured in your Casting config file.',
      'default',
    )
    .option(
      '-f, --flat',
      'Generate the files in the mentioned path instead of creating new folder for it',
      selectedComponentType.flat || false,
    )
    .option('--dry-run', 'Show what will be generated (with a preview) without writing to disk')
    .option('-y, --yes', 'Skip interactive prompts and use detected/config defaults')
    .option(
      '--customDirectory <customDirectory>',
      'You can pass a cased path template that will be used as the component path for the component being generated.\n'
      + 'E.g. this allows you to add a prefix or suffix to the component path, '
      + 'or change the case of the name of the directory holding the components to kebab-case.\n'
      + 'Examples:\n'
      + '- TemplateName\n'
      + '- template-name\n'
      + '- TemplateNameSuffix',
    );

  // Dynamic component command option defaults.

  const dynamicOptions = getCorrespondingComponentFileTypes(selectedComponentType);

  dynamicOptions.forEach((dynamicOption) => {
    componentCommand.option(
      `--${dynamicOption} <${dynamicOption}>`,
      `With corresponding ${dynamicOption.split('with')[1]} file.`,
      selectedComponentType[dynamicOption],
    );
  });

  // Component command action.

  componentCommand.action(async (componentNames, cmd) => {
    let names = componentNames;

    if ((!names || names.length === 0) && !cmd.yes) {
      names = await promptForComponentNames();
    }

    if (!names || names.length === 0) {
      return;
    }

    for (const componentName of names) {
      await generateComponent(componentName, cmd, cliConfigFile);
    }
  });
}
