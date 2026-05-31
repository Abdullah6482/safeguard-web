import { computeReportDiff } from '../auditDiff';

describe('Audit Diff Calculator', () => {
  test('detects changed status and severity', () => {
    const oldR = { title: 'Spill', status: 'open', severity: 2 };
    const newR = { title: 'Spill', status: 'closed', severity: 3 };
    const diff = computeReportDiff(oldR, newR);
    expect(diff.length).toBe(2);
    expect(diff.find(d => d.field === 'status').to).toBe('closed');
  });
});
