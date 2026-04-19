import { filterReports } from '../filterUtils';

describe('Filter Reports Utility', () => {
  const sampleData = [
    { id: 1, title: 'Chemical leak', incidentType: 'spill', status: 'open' },
    { id: 2, title: 'Slip in corridor', incidentType: 'injury', status: 'closed' },
  ];

  test('filters by status', () => {
    const res = filterReports(sampleData, { status: 'open' });
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(1);
  });

  test('filters by search term', () => {
    const res = filterReports(sampleData, { search: 'slip' });
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(2);
  });
});
