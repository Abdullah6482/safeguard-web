import { normalizeSearchTerm } from '../searchUtils';

describe('Search Utilities', () => {
  test('normalizes whitespace and case', () => {
    expect(normalizeSearchTerm('  Near Miss Event ')).toBe('near miss event');
  });
});
