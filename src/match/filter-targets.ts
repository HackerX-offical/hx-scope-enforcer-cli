import type { ScopeEntry } from '../types.js';
import { isTargetInScope } from './is-target-in-scope.js';
import { normalizeTarget } from './normalize-target.js';

export function filterTargets(
  targets: string[],
  entries: ScopeEntry[],
): { inScope: string[]; outOfScope: string[] } {
  const inScope: string[] = [];
  const outOfScope: string[] = [];
  const seen = new Set<string>();

  for (const t of targets) {
    const n = normalizeTarget(t);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    const result = isTargetInScope(n, entries);
    if (result.inScope) inScope.push(n);
    else outOfScope.push(n);
  }

  return { inScope, outOfScope };
}
