import { filterTargets } from './filter-targets.js';
import { parseScopeFile } from '../parse/parse-scope-file.js';

describe('filterTargets', () => {
  it('splits lists', () => {
    const entries = parseScopeFile('example.com\n').entries;
    const { inScope, outOfScope } = filterTargets(['example.com', 'evil.com'], entries);
    expect(inScope).toEqual(['example.com']);
    expect(outOfScope).toEqual(['evil.com']);
  });
});
