import fsExtra from 'fs-extra';
import inquirer from 'inquirer';

import merge from 'lodash/merge.js';
import { CONFIG_FILE_NAME, DEFAULT_COMPONENT_CONFIG, SCHEMA_URL } from './constants.js';
import deepKeys from './deepKeysUtils.js';
import { detectProjectConfig } from './detectProjectUtils.js';
import { blank, dim, error, exitWithError, header, info, outro, success } from './messagesUtils.js';

const { accessSync, constants, outputFileSync, readFileSync } = fsExtra;
const { prompt } = inquirer;

/**
 * Build the config questions, seeding defaults from detected project signals.
 *
 * @param {ReturnType<typeof detectProjectConfig>} detected
 * @returns {Array<object>} The inquirer questions with detected defaults.
 */
export function buildConfigQuestions(detected = {}) {
  const projectLevelQuestions = [
    {
      type: 'confirm',
      name: 'usesTypeScript',
      message: 'Does this project use TypeScript?',
      default: detected.usesTypeScript ?? false,
    },
    {
      type: 'confirm',
      name: 'usesStyledComponents',
      message: 'Does this project use styled-components?',
      default: detected.usesStyledComponents ?? false,
    },
    {
      type: 'confirm',
      when: answers => !answers.usesStyledComponents,
      name: 'usesCssModule',
      message: 'Does this project use CSS modules?',
      default: detected.usesCssModule ?? true,
    },
    {
      type: 'select',
      name: 'cssPreprocessor',
      when: answers => !answers.usesStyledComponents,
      message: 'Does this project use a CSS Preprocessor?',
      choices: ['css', 'scss', 'less', 'styl'],
      default: detected.cssPreprocessor ?? 'css',
    },
    {
      type: 'select',
      name: 'testLibrary',
      message: 'What testing library does your project use?',
      choices: ['Testing Library', 'Vitest', 'None'],
      default: detected.testLibrary ?? 'Testing Library',
    },
  ];

  const componentLevelQuestions = [
    {
      type: 'input',
      name: 'component.default.path',
      message: 'Set the default path directory to where your components will be generated in?',
      default: () => DEFAULT_COMPONENT_CONFIG.path,
    },
    {
      type: 'confirm',
      name: 'component.default.withStyle',
      message: 'Would you like to create a corresponding stylesheet file with each component you generate?',
      default: DEFAULT_COMPONENT_CONFIG.withStyle,
    },
    {
      type: 'confirm',
      name: 'component.default.withTest',
      message: 'Would you like to create a corresponding test file with each component you generate?',
      default: DEFAULT_COMPONENT_CONFIG.withTest,
    },
    {
      type: 'confirm',
      name: 'component.default.withStory',
      message: 'Would you like to create a corresponding story with each component you generate?',
      default: DEFAULT_COMPONENT_CONFIG.withStory,
    },
    {
      type: 'confirm',
      name: 'component.default.withLazy',
      message:
        'Would you like to create a corresponding lazy file (a file that lazy-loads your component out of the box and enables code splitting: https://react.dev/reference/react/lazy) with each component you generate?',
      default: DEFAULT_COMPONENT_CONFIG.withLazy,
    },
  ];

  return [...projectLevelQuestions, ...componentLevelQuestions];
}

/**
 * Build a full config object directly from detected values (no prompts).
 *
 * @param {ReturnType<typeof detectProjectConfig>} detected
 * @returns {object} A complete Casting config object.
 */
export function buildConfigFromDetected(detected = {}) {
  const config = {
    $schema: SCHEMA_URL,
    usesTypeScript: Boolean(detected.usesTypeScript),
    usesStyledComponents: Boolean(detected.usesStyledComponents),
  };

  if (!config.usesStyledComponents) {
    config.usesCssModule = detected.usesCssModule ?? true;
    config.cssPreprocessor = detected.cssPreprocessor ?? 'css';
  }

  config.testLibrary = detected.testLibrary ?? 'None';
  config.component = { default: { ...DEFAULT_COMPONENT_CONFIG } };

  return config;
}

// Print a short summary of what auto-detection found.

function reportDetection(detected) {
  header('Casting detected your project setup', 'Using these values (skip questions with --auto).');
  info(`TypeScript: ${detected.usesTypeScript ? 'yes' : 'no'}`);
  if (detected.usesStyledComponents) {
    info('Styling: styled-components');
  } else {
    info(`Styling: ${detected.usesCssModule ? 'CSS modules' : 'plain CSS'} (${detected.cssPreprocessor})`);
  }
  info(`Test library: ${detected.testLibrary}`);
  info(`Framework: ${detected.framework}`);
  blank();
}

async function createCLIConfigFile({ auto = false } = {}) {
  const detected = detectProjectConfig();

  // Non-interactive: build straight from detection and write.

  if (auto) {
    try {
      const config = buildConfigFromDetected(detected);
      outputFileSync(CONFIG_FILE_NAME, JSON.stringify(config, null, 2));

      reportDetection(detected);
      success(`Created ${CONFIG_FILE_NAME} automatically`);
      blank();
      outro('You can always update the config file manually. Happy Hacking!');

      return config;
    } catch {
      exitWithError('Could not create config file', {
        details: `Failed to write ${CONFIG_FILE_NAME}`,
        suggestions: [
          'Check that you have write permissions in this directory',
          'Make sure the directory is not read-only',
        ],
      });
    }
  }

  // Interactive: seed defaults from detection.

  try {
    header(
      'Welcome to Casting!',
      'Answer a few questions to customize the CLI for your project (defaults are auto-detected).',
    );

    reportDetection(detected);

    const answers = await prompt(buildConfigQuestions(detected));
    const config = { $schema: SCHEMA_URL, ...answers };

    outputFileSync(CONFIG_FILE_NAME, JSON.stringify(config, null, 2));

    blank();
    success(`Created the ${CONFIG_FILE_NAME} config file`);
    blank();
    outro('You can always update the config file manually. Happy Hacking!');

    return config;
  } catch (e) {
    error('Could not create config file', {
      details: `Failed to write ${CONFIG_FILE_NAME}`,
      suggestions: [
        'Check that you have write permissions in this directory',
        'Make sure the directory is not read-only',
      ],
    });
    return e;
  }
}

async function updateCLIConfigFile(missingConfigQuestions, currentConfigFile) {
  try {
    header(
      'Casting has new features!',
      'Answer a few questions to update your config file.',
    );

    const answers = await prompt(missingConfigQuestions);
    const updatedAnswers = merge({ $schema: SCHEMA_URL }, currentConfigFile, answers);

    outputFileSync(CONFIG_FILE_NAME, JSON.stringify(updatedAnswers, null, 2));

    blank();
    success(`Updated the ${CONFIG_FILE_NAME} config file`);
    blank();
    outro('You can always update the config file manually. Happy Hacking!');

    return updatedAnswers;
  } catch (e) {
    error('Could not update config file', {
      details: `Failed to write ${CONFIG_FILE_NAME}`,
      suggestions: [
        'Check that the file is not locked or read-only',
        'Verify you have write permissions',
      ],
    });
    return e;
  }
}

/**
 * Force-create (or overwrite) the config file. Used by `casting init`.
 *
 * @param {{ auto?: boolean }} [options]
 * @returns {Promise<object>} The created config object.
 */
export async function initCLIConfigFile({ auto = false } = {}) {
  ensureProjectRoot();

  const exists = configFileExists();
  if (exists) {
    dim(`An existing ${CONFIG_FILE_NAME} was found and will be overwritten.`);
    blank();
  }

  return createCLIConfigFile({ auto });
}

function ensureProjectRoot() {
  try {
    accessSync('./package.json', constants.R_OK);
  } catch {
    exitWithError('Not in project root', {
      details: 'Could not find package.json in current directory',
      suggestions: [
        'Run this command from your project root directory',
        'Make sure package.json exists in the current directory',
      ],
    });
  }
}

function configFileExists() {
  try {
    accessSync(`./${CONFIG_FILE_NAME}`, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load the Casting config, creating or updating it as needed.
 *
 * @param {{ auto?: boolean, yes?: boolean }} [options]
 * @returns {Promise<object>} The loaded (or newly created) config object.
 */
export async function getCLIConfigFile({ auto = false, yes = false } = {}) {
  ensureProjectRoot();

  if (!configFileExists()) {
    // No config yet: create one. `--yes` implies non-interactive auto setup.
    return createCLIConfigFile({ auto: auto || yes });
  }

  const currentConfigFile = JSON.parse(readFileSync(`./${CONFIG_FILE_NAME}`));
  const detected = detectProjectConfig();
  const configQuestions = buildConfigQuestions(detected);

  /**
   *  Check to see if there's a difference between configQuestions and the currentConfigFile.
   *  If there is, update the currentConfigFile with the missingConfigQuestions.
   */

  const missingConfigQuestions = configQuestions.filter(
    question =>
      !deepKeys(currentConfigFile).includes(question.name)
      && (question.when ? question.when(currentConfigFile) : true),
  );

  if (missingConfigQuestions.length) {
    // In non-interactive mode, fill missing values from detection instead of prompting.
    if (auto || yes) {
      const filled = buildConfigFromDetected(detected);
      const updated = merge({ $schema: SCHEMA_URL }, filled, currentConfigFile);
      outputFileSync(CONFIG_FILE_NAME, JSON.stringify(updated, null, 2));
      return updated;
    }

    return updateCLIConfigFile(missingConfigQuestions, currentConfigFile);
  }

  return currentConfigFile;
}
