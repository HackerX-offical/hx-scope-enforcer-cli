import ipaddr from 'ipaddr.js';

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

const HOST_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
const WILDCARD_RE = /^\*\.(.+)$/;

export function parseScopeLine(line: string, lineNo: number): ScopeEntry | string {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return '';
  }

  if (trimmed.includes('/')) {
    try {
      const [addr, prefixStr] = trimmed.split('/');
      const prefix = Number(prefixStr);
      if (!Number.isInteger(prefix)) {
        return `Line ${lineNo}: invalid CIDR prefix`;
      }
      const parsed = ipaddr.parse(addr);
      const max = parsed.kind() === 'ipv4' ? 32 : 128;
      if (prefix < 0 || prefix > max) {
        return `Line ${lineNo}: CIDR prefix out of range`;
      }
      return { kind: 'cidr', network: parsed, prefix };
    } catch {
      return `Line ${lineNo}: invalid CIDR ${trimmed}`;
    }
  }

  if (ipaddr.isValid(trimmed)) {
    return { kind: 'ip', value: ipaddr.parse(trimmed).toString() };
  }

  const wild = WILDCARD_RE.exec(trimmed);
  if (wild) {
    const suffix = wild[1].toLowerCase();
    if (!HOST_RE.test(suffix) && suffix !== 'localhost') {
      return `Line ${lineNo}: invalid wildcard suffix ${suffix}`;
    }
    return { kind: 'wildcard', suffix };
  }

  const host = trimmed.toLowerCase();
  if (host === 'localhost' || HOST_RE.test(host)) {
    return { kind: 'host', value: host };
  }

  return `Line ${lineNo}: unrecognized scope entry ${trimmed}`;
}

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

function hostMatchesWildcard(host: string, suffix: string): boolean {
  if (host === suffix) return false;
  return host.endsWith(`.${suffix}`);
}

function ipInCidr(ip: string, entry: ScopeEntry & { kind: 'cidr' }): boolean {
  try {
    const parsed = ipaddr.parse(ip);
    if (parsed.kind() !== entry.network.kind()) return false;
    return parsed.match(entry.network, entry.prefix);
  } catch {
    return false;
  }
}

export function normalizeTarget(target: string): string {
  let t = target.trim().toLowerCase();
  t = t.replace(/^https?:\/\//, '');
  t = t.split('/')[0] ?? t;
  t = t.split(':')[0] ?? t;
  t = t.replace(/\.$/, '');
  return t;
}

export interface ScopeMatchResult {
  inScope: boolean;
  matchedBy?: ScopeEntry;
  target: string;
}

export function isTargetInScope(target: string, entries: ScopeEntry[]): ScopeMatchResult {
  const normalized = normalizeTarget(target);
  if (!normalized) {
    return { inScope: false, target: normalized };
  }

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

export const EXAMPLE_SCOPE = `# HackerX engagement scope — only test targets listed here
# Domains
example.com
*.staging.example.com

# Infrastructure
127.0.0.1
10.0.0.0/8
`;
