import chalk from 'chalk';
import type { CompareResult, VarDiff } from '../types/index.js';

/**
 * Mask sensitive value for display
 */
function maskValue(value: string, show: boolean): string {
  if (show) return value;
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '****' + value.slice(-2);
}

/**
 * Check if a key might contain sensitive data
 */
function isSensitive(key: string): boolean {
  const sensitivePatterns = [
    /secret/i,
    /password/i,
    /key/i,
    /token/i,
    /auth/i,
    /credential/i,
    /private/i,
    /api_key/i,
  ];
  return sensitivePatterns.some(p => p.test(key));
}

/**
 * Get display value (masked if sensitive)
 */
function getDisplayValue(key: string, value: string | undefined, showValues: boolean): string {
  if (!value) return chalk.gray('(empty)');
  if (!showValues && isSensitive(key)) {
    return chalk.gray(maskValue(value, false));
  }
  return value;
}

/**
 * Print comparison results to console
 */
export function printCompareResult(result: CompareResult, options: { showValues: boolean; showIdentical: boolean }): void {
  const { showValues, showIdentical } = options;

  console.log();
  console.log(chalk.bold.blue('🔍 Environment Comparison'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();
  console.log(chalk.gray(`Comparing:`));
  console.log(chalk.white(`  1. ${result.firstFile}`));
  console.log(chalk.white(`  2. ${result.secondFile}`));
  console.log();

  // Check if files are identical
  if (
    result.missingInFirst.length === 0 &&
    result.missingInSecond.length === 0 &&
    result.different.length === 0
  ) {
    console.log(chalk.green('✅ Files are identical!'));
    console.log(chalk.gray(`   ${result.identical.length} variables match perfectly.`));
    console.log();
    return;
  }

  // Missing in first file (present in second)
  if (result.missingInFirst.length > 0) {
    console.log(chalk.red(`❌ Missing in ${result.firstFile}:`));
    for (const diff of result.missingInFirst) {
      const value = getDisplayValue(diff.key, diff.secondValue, showValues);
      console.log(chalk.red(`   • ${diff.key}`));
      if (showValues || !isSensitive(diff.key)) {
        console.log(chalk.gray(`     Value in file 2: ${value}`));
      }
    }
    console.log();
  }

  // Missing in second file (present in first)
  if (result.missingInSecond.length > 0) {
    console.log(chalk.yellow(`⚠️  Missing in ${result.secondFile}:`));
    for (const diff of result.missingInSecond) {
      const value = getDisplayValue(diff.key, diff.firstValue, showValues);
      console.log(chalk.yellow(`   • ${diff.key}`));
      if (showValues || !isSensitive(diff.key)) {
        console.log(chalk.gray(`     Value in file 1: ${value}`));
      }
    }
    console.log();
  }

  // Different values
  if (result.different.length > 0) {
    console.log(chalk.cyan('🔄 Different values:'));
    for (const diff of result.different) {
      console.log(chalk.cyan(`   • ${diff.key}`));
      const val1 = getDisplayValue(diff.key, diff.firstValue, showValues);
      const val2 = getDisplayValue(diff.key, diff.secondValue, showValues);
      console.log(chalk.gray(`     File 1: ${val1}`));
      console.log(chalk.gray(`     File 2: ${val2}`));
    }
    console.log();
  }

  // Identical (optional)
  if (showIdentical && result.identical.length > 0) {
    console.log(chalk.green(`✅ Identical (${result.identical.length} variables):`));
    for (const diff of result.identical) {
      console.log(chalk.green(`   • ${diff.key}`));
    }
    console.log();
  } else if (result.identical.length > 0) {
    console.log(chalk.green(`✅ Identical: ${result.identical.length} variables`));
    console.log();
  }

  // Summary
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.bold('Summary:'));
  console.log(chalk.red(`   Missing in file 1: ${result.missingInFirst.length}`));
  console.log(chalk.yellow(`   Missing in file 2: ${result.missingInSecond.length}`));
  console.log(chalk.cyan(`   Different values:  ${result.different.length}`));
  console.log(chalk.green(`   Identical:         ${result.identical.length}`));
  console.log();
}

/**
 * Print JSON output
 */
export function printJsonResult(result: CompareResult): void {
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Generate export content for missing variables
 */
export function generateExportContent(diffs: VarDiff[], sourceFile: 'first' | 'second'): string {
  const lines: string[] = [
    `# Missing variables - exported from env-compare`,
    `# Add these to your .env file`,
    '',
  ];

  for (const diff of diffs) {
    const value = sourceFile === 'first' ? diff.firstValue : diff.secondValue;
    if (value !== undefined) {
      // Quote values with spaces
      const needsQuotes = /[\s#]/.test(value) || value === '';
      const quotedValue = needsQuotes ? `"${value}"` : value;
      lines.push(`${diff.key}=${quotedValue}`);
    } else {
      lines.push(`${diff.key}=`);
    }
  }

  return lines.join('\n');
}
