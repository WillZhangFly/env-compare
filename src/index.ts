/**
 * env-compare
 * Compare .env files and find missing or different variables
 */

// Types
export type {
  EnvVar,
  EnvFile,
  VarDiff,
  CompareResult,
  CliOptions,
} from './types/index.js';

// Parser
export { parseEnvFile, generateEnvContent } from './parser/env-parser.js';

// Compare
export { compareEnvFiles, areIdentical, getSummary } from './parser/compare.js';
