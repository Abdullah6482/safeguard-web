export function aggregateByDate(reports = []) {
  const map = {};
  reports.forEach(r => {
    const d = (r.createdAt || '').slice(0, 10);
    if (!d) return;
    map[d] = (map[d] || 0) + 1;
  });

  return Object.keys(map)
    .sort()
    .map(date => ({ date, count: map[date] }));
}

export function aggregateByCategory(reports = []) {
  const map = {};
  reports.forEach(r => {
    const cat = r.incidentType || 'Other';
    map[cat] = (map[cat] || 0) + 1;
  });

  return Object.keys(map).map(category => ({ category, count: map[category] }));
}
