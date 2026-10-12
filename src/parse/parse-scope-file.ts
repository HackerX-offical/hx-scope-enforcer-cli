import type { ScopeEntry, ScopeFile } from '../types.js';
import { parseScopeLine } from './parse-scope-line.js';

export function parseScopeFile(content: string): ScopeFile {
  const lines = content.split(/\r?\n/);
  const entries: ScopeEntry[] = [];
  const errors: string[] = [];

  lines.forEach((line, idx) => {
    const result = parseScopeLine(line, idx + 1);
    if (typeof result === 'string') {
      if (result) errors.push(result);
    } else {
      entries.push(result);
    }
  });

  return { entries, rawLines: lines, errors };
}
