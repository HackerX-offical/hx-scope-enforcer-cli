import { isTargetInScope } from './is-target-in-scope.js';
import { parseScopeFile } from '../parse/parse-scope-file.js';

describe('isTargetInScope', () => {
  const entries = parseScopeFile('example.com\n*.staging.example.com\n').entries;
  it('matches wildcard', () => {
    expect(isTargetInScope('app.staging.example.com', entries).inScope).toBe(true);
  });
});
