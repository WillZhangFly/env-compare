/**
 * Parsed environment variable
 */
export interface EnvVar {
  key: string;
  value: string;
  line: number;
  comment?: string;
}

/**
 * Parsed .env file
 */
export interface EnvFile {
  path: string;
  variables: Map<string, EnvVar>;
  comments: string[];
}

/**
 * Comparison result for a single variable
 */
export interface VarDiff {
  key: string;
  status: 'missing-in-first' | 'missing-in-second' | 'different' | 'identical';
  firstValue?: string;
  secondValue?: string;
  firstLine?: number;
  secondLine?: number;
}

/**
 * Complete comparison result
 */
export interface CompareResult {
  firstFile: string;
  secondFile: string;
  missingInFirst: VarDiff[];
  missingInSecond: VarDiff[];
  different: VarDiff[];
  identical: VarDiff[];
  totalFirst: number;
  totalSecond: number;
}

/**
 * CLI options
 */
export interface CliOptions {
  json: boolean;
  showIdentical: boolean;
  showValues: boolean;
  export?: string;
  format: 'table' | 'simple';
}
