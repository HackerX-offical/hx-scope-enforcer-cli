import type { ScopeEntry, ScopeMatchResult } from '../types.js';
import { normalizeTarget } from './normalize-target.js';
import { hostMatchesWildcard } from './host-matches.js';
import { ipInCidr } from './ip-in-cidr.js';

export function isTargetInScope(target: string, entries: ScopeEntry[]): ScopeMatchResult {
  const normalized = normalizeTarget(target);
  if (!normalized) return { inScope: false, target: normalized };

  for (const entry of entries) {
    if (entry.kind === 'host' && normalized === entry.value) {
      return { inScope: true, matchedBy: entry, target: normalized };
    }
    if (entry.kind === 'wildcard' && hostMatchesWildcard(normalized, entry.suffix)) {
      return { inScope: true, matchedBy: entry, target: normalized };
    }
    if (entry.kind === 'ip' && normalized === entry.value) {
      return { inScope: true, matchedBy: entry, target: normalized };
    }
    if (entry.kind === 'cidr' && ipInCidr(normalized, entry)) {
      return { inScope: true, matchedBy: entry, target: normalized };
    }
  }

  return { inScope: false, target: normalized };
}
