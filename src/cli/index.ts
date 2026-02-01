#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { compareEnvFiles } from '../parser/compare.js';
import { printCompareResult, printJsonResult, generateExportContent } from './output.js';

const program = new Command();

program
  .name('envdiff')
  .description('Compare .env files and find missing or different variables')
  .version('1.0.0');

program
  .argument('<file1>', 'First .env file')
  .argument('<file2>', 'Second .env file')
  .option('--json', 'Output results as JSON', false)
  .option('--show-identical', 'Show identical variables', false)
  .option('--show-values', 'Show all values (including sensitive)', false)
  .option('--export <file>', 'Export missing variables to a file')
  .option('--export-from <source>', 'Source for export: "first" or "second"', 'first')
  .action(async (
    file1: string,
    file2: string,
    options: {
      json: boolean;
      showIdentical: boolean;
      showValues: boolean;
      export?: string;
      exportFrom: 'first' | 'second';
    }
  ) => {
    try {
      // Resolve paths
      const path1 = resolve(file1);
      const path2 = resolve(file2);

      // Validate files exist
      if (!existsSync(path1)) {
        console.error(chalk.red(`\n❌ File not found: ${path1}`));
        process.exit(1);
      }
      if (!existsSync(path2)) {
        console.error(chalk.red(`\n❌ File not found: ${path2}`));
        process.exit(1);
      }

      // Compare files
      const result = compareEnvFiles(path1, path2);

      // Output results
      if (options.json) {
        printJsonResult(result);
      } else {
        printCompareResult(result, {
          showValues: options.showValues,
          showIdentical: options.showIdentical,
        });

        // Export missing variables if requested
        if (options.export) {
          const missingVars = options.exportFrom === 'first'
            ? result.missingInSecond
            : result.missingInFirst;

          if (missingVars.length === 0) {
            console.log(chalk.yellow('⚠️  No missing variables to export.'));
          } else {
            const content = generateExportContent(missingVars, options.exportFrom);
            writeFileSync(options.export, content);
            console.log(chalk.green(`✅ Exported ${missingVars.length} variables to: ${options.export}`));
          }
          console.log();
        }

        // Tips
        if (result.missingInSecond.length > 0 && !options.export) {
          console.log(chalk.gray('💡 Tip: Use --export <file> to export missing variables'));
        }

        // Support message
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.gray('Found the bug in seconds? Consider supporting:'));
        console.log(chalk.cyan('☕ https://buymeacoffee.com/willzhangfly'));
        console.log();
      }

      // Exit with error if there are differences
      const hasDifferences =
        result.missingInFirst.length > 0 ||
        result.missingInSecond.length > 0 ||
        result.different.length > 0;

      if (hasDifferences && !options.json) {
        process.exit(1);
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
      } else {
        console.error(chalk.red('\n❌ An unexpected error occurred'));
      }
      process.exit(1);
    }
  });

// Add validate command
program
  .command('validate <env-file> <example-file>')
  .description('Validate .env file against .env.example')
  .option('--strict', 'Fail if env has extra variables not in example', false)
  .action((envFile: string, exampleFile: string, options: { strict: boolean }) => {
    try {
      const envPath = resolve(envFile);
      const examplePath = resolve(exampleFile);

      if (!existsSync(envPath)) {
        console.error(chalk.red(`\n❌ File not found: ${envPath}`));
        process.exit(1);
      }
      if (!existsSync(examplePath)) {
        console.error(chalk.red(`\n❌ File not found: ${examplePath}`));
        process.exit(1);
      }

      const result = compareEnvFiles(examplePath, envPath);

      console.log();
      console.log(chalk.bold.blue('🔍 Environment Validation'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log();

      let hasErrors = false;

      // Variables in example but missing in env (required)
      if (result.missingInSecond.length > 0) {
        hasErrors = true;
        console.log(chalk.red(`❌ Missing required variables:`));
        for (const diff of result.missingInSecond) {
          console.log(chalk.red(`   • ${diff.key}`));
        }
        console.log();
      }

      // Extra variables in env (warning or error in strict mode)
      if (result.missingInFirst.length > 0) {
        if (options.strict) {
          hasErrors = true;
          console.log(chalk.red(`❌ Extra variables not in example (strict mode):`));
        } else {
          console.log(chalk.yellow(`⚠️  Extra variables not in example:`));
        }
        for (const diff of result.missingInFirst) {
          console.log(chalk.yellow(`   • ${diff.key}`));
        }
        console.log();
      }

      if (!hasErrors) {
        console.log(chalk.green('✅ Validation passed!'));
        console.log(chalk.gray(`   All ${result.identical.length + result.different.length} required variables are present.`));
        console.log();
      }

      // Support message
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.gray('Saved debugging time? Consider supporting:'));
      console.log(chalk.cyan('☕ https://buymeacoffee.com/willzhangfly'));
      console.log();

      if (hasErrors) {
        process.exit(1);
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
      }
      process.exit(1);
    }
  });

program.parse();
