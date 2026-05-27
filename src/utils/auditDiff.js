export function computeReportDiff(oldReport = {}, newReport = {}) {
  const changes = [];
  const fields = ['title', 'description', 'status', 'severity', 'incidentType'];

  fields.forEach(field => {
    if (oldReport[field] !== newReport[field]) {
      changes.push({
        field,
        from: oldReport[field] || '',
        to: newReport[field] || '',
        timestamp: new Date().toISOString(),
      });
    }
  });

  return changes;
}
