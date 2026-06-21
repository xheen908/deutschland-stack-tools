import { Command } from 'commander';
import { validateCmd } from './commands/validate';
import { batchCmd } from './commands/batch';
import { infoCmd } from './commands/info';

export const buildCli = (): Command => {
  const program = new Command();

  program
    .name('dst')
    .description('Deutschland-Stack Tools: ODF & PDF/UA compliance validator')
    .version(process.env.npm_package_version || '1.0.0');

  program.addCommand(validateCmd());
  program.addCommand(batchCmd());
  program.addCommand(infoCmd());

  return program;
};
