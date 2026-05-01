import { aggregateByDate, aggregateByCategory } from '../chartDataTransformers';

describe('Chart Data Transformers', () => {
  test('aggregates daily frequencies correctly', () => {
    const reports = [
      { createdAt: '2026-05-01T10:00:00Z' },
      { createdAt: '2026-05-01T15:00:00Z' },
      { createdAt: '2026-05-02T12:00:00Z' },
    ];
    const res = aggregateByDate(reports);
    expect(res.length).toBe(2);
    expect(res[0].count).toBe(2);
  });

  test('tallies categories accurately', () => {
    const reports = [
      { incidentType: 'Spill' },
      { incidentType: 'Spill' },
      { incidentType: 'Injury' },
    ];
    const res = aggregateByCategory(reports);
    expect(res.find(c => c.category === 'Spill').count).toBe(2);
  });
});
