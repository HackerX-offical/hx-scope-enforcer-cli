#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Command } from 'commander';
import chalk from 'chalk';
import {
  EXAMPLE_SCOPE,
  filterTargets,
  isTargetInScope,
  parseScopeFile,
} from './scope.js';

const program = new Command();

program
  .name('hx-scope')
  .description('Validate targets against an authorized engagement scope file')
  .version('1.0.0');

program
  .command('init')
  .description('Write an example scope file')
  .argument('[path]', 'output path', 'scope.txt')
  .action((path: string) => {
    const out = resolve(path);
    if (existsSync(out)) {
      console.error(chalk.red(`Refusing to overwrite existing file: ${out}`));
      process.exit(1);
    }
    writeFileSync(out, EXAMPLE_SCOPE, 'utf8');
    console.log(chalk.green(`Wrote example scope to ${out}`));
  });

function loadScope(scopePath: string) {
  const abs = resolve(scopePath);
  if (!existsSync(abs)) {
    console.error(chalk.red(`Scope file not found: ${abs}`));
    process.exit(1);
  }
  const content = readFileSync(abs, 'utf8');
  const parsed = parseScopeFile(content);
  if (parsed.errors.length) {
    console.error(chalk.red('Scope file errors:'));
    parsed.errors.forEach((e) => console.error(`  ${e}`));
    process.exit(1);
  }
  if (parsed.entries.length === 0) {
    console.error(chalk.red('Scope file has no entries.'));
    process.exit(1);
  }
  return parsed;
}

program
  .command('validate')
  .description('Validate scope file syntax')
  .requiredOption('-f, --file <path>', 'scope file')
  .action((opts: { file: string }) => {
    const abs = resolve(opts.file);
    if (!existsSync(abs)) {
      console.error(chalk.red(`Scope file not found: ${abs}`));
      process.exit(1);
    }
    const parsed = parseScopeFile(readFileSync(abs, 'utf8'));
    if (parsed.errors.length) {
      parsed.errors.forEach((e) => console.error(chalk.red(e)));
      process.exit(1);
    }
    console.log(
      chalk.green(
        `Valid scope file with ${parsed.entries.length} entr${parsed.entries.length === 1 ? 'y' : 'ies'}.`,
      ),
    );
  });

program
  .command('check')
  .description('Check if a single target is in scope')
  .argument('<target>', 'hostname, IP, or URL')
  .requiredOption('-f, --file <path>', 'scope file')
  .option('--json', 'JSON output')
  .action((target: string, opts: { file: string; json?: boolean }) => {
    const { entries } = loadScope(opts.file);
    const result = isTargetInScope(target, entries);
    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else if (result.inScope) {
      console.log(chalk.green(`IN SCOPE: ${result.target}`));
    } else {
      console.log(chalk.red(`OUT OF SCOPE: ${result.target}`));
    }
    process.exit(result.inScope ? 0 : 2);
  });

program
  .command('filter')
  .description('Filter a newline-delimited target list to in-scope only')
  .requiredOption('-f, --file <path>', 'scope file')
  .requiredOption('-i, --input <path>', 'targets file (one per line)')
  .option('-o, --output <path>', 'write in-scope targets here')
  .option('--json', 'JSON output')
  .action(
    (
      opts: {
        file: string;
        input: string;
        output?: string;
        json?: boolean;
      },
    ) => {
      const { entries } = loadScope(opts.file);
      const inputPath = resolve(opts.input);
      if (!existsSync(inputPath)) {
        console.error(chalk.red(`Input file not found: ${inputPath}`));
        process.exit(1);
      }
      const lines = readFileSync(inputPath, 'utf8')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const { inScope, outOfScope } = filterTargets(lines, entries);

      if (opts.json) {
        console.log(JSON.stringify({ inScope, outOfScope }, null, 2));
      } else {
        console.log(chalk.bold(`In scope (${inScope.length}):`));
        inScope.forEach((t) => console.log(`  ${chalk.green(t)}`));
        console.log(chalk.bold(`Out of scope (${outOfScope.length}):`));
        outOfScope.forEach((t) => console.log(`  ${chalk.red(t)}`));
      }

      if (opts.output) {
        writeFileSync(resolve(opts.output), inScope.join('\n') + '\n', 'utf8');
        console.log(chalk.dim(`Wrote in-scope list to ${opts.output}`));
      }

      process.exit(outOfScope.length > 0 ? 2 : 0);
    },
  );

program.parse();
