import { parseScopeFile } from './parse-scope-file.js';

describe('parseScopeFile', () => {
  it('parses host', () => {
    expect(parseScopeFile('example.com\n').entries).toHaveLength(1);
  });
});
