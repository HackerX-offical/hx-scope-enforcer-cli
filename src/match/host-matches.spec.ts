import { hostMatchesWildcard } from './host-matches.js';

describe('hostMatchesWildcard', () => {
  it('matches subdomains only', () => {
    expect(hostMatchesWildcard('a.staging.example.com', 'staging.example.com')).toBe(true);
    expect(hostMatchesWildcard('staging.example.com', 'staging.example.com')).toBe(false);
  });
});
