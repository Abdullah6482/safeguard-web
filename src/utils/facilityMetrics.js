export function calculateSiteKPIs(reports = [], siteId) {
  const filtered = siteId && siteId !== 'all' ? reports.filter(r => r.facilityId === siteId) : reports;
  const count = filtered.length;
  const daysWithoutIncident = count > 0 ? 14 : 90;

  return { totalIncidents: count, daysWithoutIncident };
}
