import type { ScopeMatchResult } from '../types.js';

export function matchToJson(result: ScopeMatchResult): string {
  return JSON.stringify(result, null, 2);
}
