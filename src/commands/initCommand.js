import { initCLIConfigFile } from '../utils/castingConfigUtils.js';

export default function initInitCommand(program) {
  program
    .command('init')
    .description('Create (or overwrite) the casting.json config file.')
    .option('--auto', 'Skip questions and auto-detect everything from your project')
    .action(async (cmd) => {
      await initCLIConfigFile({ auto: Boolean(cmd.auto) });
    });
}
