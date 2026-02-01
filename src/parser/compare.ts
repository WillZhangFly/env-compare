import type { EnvFile, CompareResult, VarDiff } from '../types/index.js';
import { parseEnvFile } from './env-parser.js';

/**
 * Compare two .env files
 */
export function compareEnvFiles(firstPath: string, secondPath: string): CompareResult {
  const first = parseEnvFile(firstPath);
  const second = parseEnvFile(secondPath);

  const missingInFirst: VarDiff[] = [];
  const missingInSecond: VarDiff[] = [];
  const different: VarDiff[] = [];
  const identical: VarDiff[] = [];

  // Get all unique keys
  const allKeys = new Set([
    ...first.variables.keys(),
    ...second.variables.keys(),
  ]);

  for (const key of allKeys) {
    const firstVar = first.variables.get(key);
    const secondVar = second.variables.get(key);

    if (!firstVar && secondVar) {
      missingInFirst.push({
        key,
        status: 'missing-in-first',
        secondValue: secondVar.value,
        secondLine: secondVar.line,
      });
    } else if (firstVar && !secondVar) {
      missingInSecond.push({
        key,
        status: 'missing-in-second',
        firstValue: firstVar.value,
        firstLine: firstVar.line,
      });
    } else if (firstVar && secondVar) {
      if (firstVar.value === secondVar.value) {
        identical.push({
          key,
          status: 'identical',
          firstValue: firstVar.value,
          secondValue: secondVar.value,
          firstLine: firstVar.line,
          secondLine: secondVar.line,
        });
      } else {
        different.push({
          key,
          status: 'different',
          firstValue: firstVar.value,
          secondValue: secondVar.value,
          firstLine: firstVar.line,
          secondLine: secondVar.line,
        });
      }
    }
  }

  // Sort by key name
  const sortByKey = (a: VarDiff, b: VarDiff) => a.key.localeCompare(b.key);
  missingInFirst.sort(sortByKey);
  missingInSecond.sort(sortByKey);
  different.sort(sortByKey);
  identical.sort(sortByKey);

  return {
    firstFile: firstPath,
    secondFile: secondPath,
    missingInFirst,
    missingInSecond,
    different,
    identical,
    totalFirst: first.variables.size,
    totalSecond: second.variables.size,
  };
}

/**
 * Check if two env files are identical
 */
export function areIdentical(result: CompareResult): boolean {
  return (
    result.missingInFirst.length === 0 &&
    result.missingInSecond.length === 0 &&
    result.different.length === 0
  );
}

/**
 * Get summary stats
 */
export function getSummary(result: CompareResult): {
  total: number;
  identical: number;
  different: number;
  missingInFirst: number;
  missingInSecond: number;
} {
  return {
    total: new Set([
      ...result.identical.map(v => v.key),
      ...result.different.map(v => v.key),
      ...result.missingInFirst.map(v => v.key),
      ...result.missingInSecond.map(v => v.key),
    ]).size,
    identical: result.identical.length,
    different: result.different.length,
    missingInFirst: result.missingInFirst.length,
    missingInSecond: result.missingInSecond.length,
  };
}
