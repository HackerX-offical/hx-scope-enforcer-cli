import type ipaddr from 'ipaddr.js';

export type ScopeEntry =
  | { kind: 'host'; value: string }
  | { kind: 'wildcard'; suffix: string }
  | { kind: 'ip'; value: string }
  | { kind: 'cidr'; network: ipaddr.IPv4 | ipaddr.IPv6; prefix: number };

export interface ScopeFile {
  entries: ScopeEntry[];
  rawLines: string[];
  errors: string[];
}

export interface ScopeMatchResult {
  inScope: boolean;
  matchedBy?: ScopeEntry;
  target: string;
}
