export function hostMatchesWildcard(host: string, suffix: string): boolean {
  if (host === suffix) return false;
  return host.endsWith(`.${suffix}`);
}
