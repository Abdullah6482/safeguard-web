import { sanitizeCsvValue, formatIncidentForExport } from '../exportSanitizer';

describe('exportSanitizer', () => {
  test('neutralizes formula injection characters', () => {
    expect(sanitizeCsvValue('=cmd|"/c calc"!A0')).toBe(`'=cmd|"/c calc"!A0`);
    expect(sanitizeCsvValue('+1+2')).toBe(`'+1+2`);
    expect(sanitizeCsvValue('-100')).toBe(`'-100`);
    expect(sanitizeCsvValue('@SUM(A1:A10)')).toBe(`'@SUM(A1:A10)`);
  });

  test('preserves harmless strings and numbers', () => {
    expect(sanitizeCsvValue('Incident description')).toBe('Incident description');
    expect(sanitizeCsvValue('12345')).toBe('12345');
    expect(sanitizeCsvValue('')).toBe('');
    expect(sanitizeCsvValue(null)).toBe('');
  });

  test('normalizes incident structure for export', () => {
    const raw = {
      id: 'inc-101',
      title: '=Chemical Spill',
      severity: 'high',
      riskScore: 16,
      status: 'under_investigation',
      reportedAt: '2026-07-15T10:00:00Z',
      capaRequired: true,
    };
    const formatted = formatIncidentForExport(raw);
    expect(formatted.id).toBe('inc-101');
    expect(formatted.title).toBe(`'=Chemical Spill`);
    expect(formatted.riskScore).toBe(16);
    expect(formatted.status).toBe('under_investigation');
  });
});
