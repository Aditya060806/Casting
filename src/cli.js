import { createRequire } from 'node:module';
import { program } from 'commander';

import initGenerateComponentCommand from './commands/generateComponent.js';
import initGenerateContextCommand from './commands/generateContext.js';
import initGenerateHookCommand from './commands/generateHook.js';
import initInitCommand from './commands/initCommand.js';
import { runInteractive } from './commands/interactive.js';
import { getCLIConfigFile } from './utils/castingConfigUtils.js';

export default async function cli(args) {
  const rawArgs = args.slice(2);
  const localRequire = createRequire(import.meta.url);
  const pkg = localRequire('../package.json');

  const isHelp = rawArgs.includes('-h') || rawArgs.includes('--help');
  const isVersion = rawArgs.includes('-V') || rawArgs.includes('--version');
  const firstArg = rawArgs.find(arg => !arg.startsWith('-'));
  const isInit = firstArg === 'init';

  program
    .name('casting')
    .description('Generate React components, hooks, and contexts instantly.')
    .version(pkg.version);

  // `init` creates the config, so it must not require an existing one.
  initInitCommand(program);

  // For `--version` and `init` we don't need to load/create a project config.
  if (isVersion || isInit) {
    program.parse(args);
    return;
  }

  const auto = rawArgs.includes('--auto');
  const yes = rawArgs.includes('--yes') || rawArgs.includes('-y');
  const cliConfigFile = await getCLIConfigFile({ auto, yes });

  // Register generators.
  initGenerateComponentCommand(args, cliConfigFile, program);
  initGenerateHookCommand(args, cliConfigFile, program);
  initGenerateContextCommand(args, cliConfigFile, program);

  // Bare mode (no subcommand, not asking for help): launch the interactive menu.
  if (!firstArg && !isHelp) {
    await runInteractive(cliConfigFile);
    return;
  }

  program.parse(args);
}
