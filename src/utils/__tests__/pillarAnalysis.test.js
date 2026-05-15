import { calculatePillarMetrics } from '../pillarAnalysis';

describe('Pillar Analysis Calculations', () => {
  test('identifies dominant pillar accurately', () => {
    const res = calculatePillarMetrics({ people: 2, asset: 5, environment: 1, reputation: 3 });
    expect(res.max).toBe(5);
    expect(res.dominantPillar).toBe('Assets');
  });

  test('computes average to 1 decimal place', () => {
    const res = calculatePillarMetrics({ people: 4, asset: 4, environment: 2, reputation: 2 });
    expect(res.avg).toBe(3);
  });
});
