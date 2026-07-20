/**
 * Sanitizes cell values to prevent CSV injection vulnerabilities (formula execution).
 * Prepends single quote if value begins with =, +, -, @, \t, or \r.
 */
export function sanitizeCsvValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.some(char => str.startsWith(char))) {
    return `'${str}`;
  }
  return str;
}

/**
 * Normalizes incident report records into structured export format.
 */
export function formatIncidentForExport(incident) {
  if (!incident) return null;
  return {
    id: incident.id || '',
    title: sanitizeCsvValue(incident.title || ''),
    severity: incident.severity || 'low',
    riskScore: Number(incident.riskScore || 0),
    status: incident.status || 'open',
    reportedAt: incident.reportedAt ? new Date(incident.reportedAt).toISOString() : '',
    capaRequired: Boolean(incident.capaRequired),
  };
}
