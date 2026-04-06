import { formatDate, timeAgo } from '../dateUtils';

describe('Date Utilities Tests', () => {
  test('returns dash for invalid or empty dates', () => {
    expect(formatDate(null)).toBe('—');
    expect(timeAgo(null)).toBe('—');
  });

  test('formats standard ISO dates', () => {
    const res = formatDate('2026-04-01T10:00:00Z');
    expect(res).toContain('2026');
  });
});
