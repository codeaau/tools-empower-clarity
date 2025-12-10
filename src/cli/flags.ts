// ./src/cli/flags.ts
import { Command } from 'commander';

export function addCommonFlags(cmd: Command) {
  return cmd
    .option('--outdir <path>', 'base output directory', './artifacts')
    .option('--clock <iso>', 'override clock for determinism/testing')
    .option('--dry-run', 'estimate without writing', false)
    .option('--truncate <limit>', 'safely truncate to limit items', '')
    .option('--json', 'emit machine-readable JSON summary', false);
}
