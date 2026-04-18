export function filterReports(reports = [], filters = {}) {
  return reports.filter(r => {
    if (filters.status && filters.status !== 'all' && r.status !== filters.status) {
      return false;
    }
    if (filters.category && filters.category !== 'all' && r.incidentType !== filters.category) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      const matchLocation = (r.location || '').toLowerCase().includes(q);
      if (!matchTitle && !matchLocation) return false;
    }
    return true;
  });
}
