import { readFileSync, existsSync } from 'fs';
import type { EnvFile, EnvVar } from '../types/index.js';

/**
 * Parse a .env file into structured data
 */
export function parseEnvFile(filePath: string): EnvFile {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const variables = new Map<string, EnvVar>();
  const comments: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;

    // Skip empty lines
    if (!line) continue;

    // Handle comments
    if (line.startsWith('#')) {
      comments.push(line);
      continue;
    }

    // Parse KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2];

      // Handle quoted values
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Handle inline comments
      let comment: string | undefined;
      const commentMatch = value.match(/^([^#]*)\s+#\s*(.*)$/);
      if (commentMatch && !value.startsWith('"') && !value.startsWith("'")) {
        value = commentMatch[1].trim();
        comment = commentMatch[2];
      }

      variables.set(key, {
        key,
        value: value.trim(),
        line: lineNumber,
        comment,
      });
    }
  }

  return {
    path: filePath,
    variables,
    comments,
  };
}

/**
 * Generate .env file content from variables
 */
export function generateEnvContent(variables: EnvVar[]): string {
  return variables
    .map(v => {
      // Quote values with spaces or special characters
      const needsQuotes = /[\s#]/.test(v.value) || v.value === '';
      const value = needsQuotes ? `"${v.value}"` : v.value;
      return `${v.key}=${value}`;
    })
    .join('\n');
}
