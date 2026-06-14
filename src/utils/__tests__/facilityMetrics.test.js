import { calculateSiteKPIs } from '../facilityMetrics';

describe('Facility Metrics', () => {
  test('filters reports by facility ID', () => {
    const list = [{ facilityId: 'site_alpha' }, { facilityId: 'site_beta' }];
    const res = calculateSiteKPIs(list, 'site_alpha');
    expect(res.totalIncidents).toBe(1);
  });
});
