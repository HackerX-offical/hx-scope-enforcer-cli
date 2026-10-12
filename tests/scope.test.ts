import {
  filterTargets,
  isTargetInScope,
  normalizeTarget,
  parseScopeFile,
} from '../src/scope.js';

describe('normalizeTarget', () => {
  it('strips URL scheme and path', () => {
    expect(normalizeTarget('https://api.example.com/v1')).toBe('api.example.com');
  });

  it('strips port', () => {
    expect(normalizeTarget('example.com:443')).toBe('example.com');
  });
});

describe('parseScopeFile', () => {
  it('parses hosts, wildcards, and CIDR', () => {
    const scope = parseScopeFile(`
# comment
example.com
*.dev.example.com
10.0.0.0/8
192.168.1.5
`);
    expect(scope.errors).toEqual([]);
    expect(scope.entries).toHaveLength(4);
  });

  it('reports invalid lines', () => {
    const scope = parseScopeFile('not a valid entry!!!');
    expect(scope.errors.length).toBeGreaterThan(0);
  });
});

describe('isTargetInScope', () => {
  const entries = parseScopeFile(`
example.com
*.staging.example.com
127.0.0.1
10.0.0.0/8
`).entries;

  it('matches exact host', () => {
    expect(isTargetInScope('example.com', entries).inScope).toBe(true);
  });

  it('does not match parent when only subdomain wildcard', () => {
    expect(isTargetInScope('staging.example.com', entries).inScope).toBe(false);
    expect(isTargetInScope('app.staging.example.com', entries).inScope).toBe(
      true,
    );
  });

  it('matches CIDR', () => {
    expect(isTargetInScope('10.1.2.3', entries).inScope).toBe(true);
    expect(isTargetInScope('11.0.0.1', entries).inScope).toBe(false);
  });

  it('matches IP literal', () => {
    expect(isTargetInScope('127.0.0.1', entries).inScope).toBe(true);
  });
});

describe('filterTargets', () => {
  const entries = parseScopeFile('example.com\n').entries;

  it('deduplicates and splits lists', () => {
    const { inScope, outOfScope } = filterTargets(
      ['https://example.com', 'example.com', 'evil.com'],
      entries,
    );
    expect(inScope).toEqual(['example.com']);
    expect(outOfScope).toEqual(['evil.com']);
  });
});
