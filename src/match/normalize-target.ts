export function normalizeTarget(target: string): string {
  let t = target.trim().toLowerCase();
  t = t.replace(/^https?:\/\//, '');
  t = t.split('/')[0] ?? t;
  t = t.split(':')[0] ?? t;
  t = t.replace(/\.$/, '');
  return t;
}
