import { normalizeTarget } from './normalize-target.js';

describe('normalizeTarget', () => {
  it('strips scheme', () => {
    expect(normalizeTarget('https://api.example.com/v1')).toBe('api.example.com');
  });
});
