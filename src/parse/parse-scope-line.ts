import ipaddr from 'ipaddr.js';
import type { ScopeEntry } from '../types.js';
import { HOST_RE, WILDCARD_RE } from './regex.js';

export function parseScopeLine(line: string, lineNo: number): ScopeEntry | string {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return '';

  if (trimmed.includes('/')) {
    try {
      const [addr, prefixStr] = trimmed.split('/');
      const prefix = Number(prefixStr);
      if (!Number.isInteger(prefix)) return `Line ${lineNo}: invalid CIDR prefix`;
      const parsed = ipaddr.parse(addr);
      const max = parsed.kind() === 'ipv4' ? 32 : 128;
      if (prefix < 0 || prefix > max) return `Line ${lineNo}: CIDR prefix out of range`;
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
