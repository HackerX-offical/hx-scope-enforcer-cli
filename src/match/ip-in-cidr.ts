import ipaddr from 'ipaddr.js';
import type { ScopeEntry } from '../types.js';

export function ipInCidr(ip: string, entry: ScopeEntry & { kind: 'cidr' }): boolean {
  try {
    const parsed = ipaddr.parse(ip);
    if (parsed.kind() !== entry.network.kind()) return false;
    return parsed.match(entry.network, entry.prefix);
  } catch {
    return false;
  }
}
