import { matchToJson } from './json.js';

describe('matchToJson', () => {
  it('serializes', () => {
    expect(JSON.parse(matchToJson({ inScope: true, target: 'x' })).target).toBe('x');
  });
});
